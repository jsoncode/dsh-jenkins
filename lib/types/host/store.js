/**
 * dsh-jenkins —— 插件数据文件存储（$DSH_HOME/dsh-jenkins.json + dsh-jenkins.key）。
 *
 * 取代 settings.yaml 中的 dsh-jenkins 命名空间，作为插件数据的唯一持久化源：
 * - 服务器列表（Token 以 AES-256-GCM 加密，密钥文件 dsh-jenkins.key 机器绑定）；
 * - 浏览器缓存（发布参数回显 lastParams + 发布历史 history，明文 JSON）。
 *
 * 路径解析优先级：settings 服务 documentPath 所在目录 → $DSH_HOME 环境变量 →
 * ~/.dsh。不新增 peerDependency（复用 node:fs / node:crypto / node:os）。
 *
 * 写路径为进程内串行队列 + 临时文件 rename 原子写；损坏文件备份为 .bak。
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
/** 数据文件格式版本（预留演进）。 */
export const STORE_VERSION = 1;
export const STORE_FILE = 'dsh-jenkins.json';
export const KEY_FILE = 'dsh-jenkins.key';
const ENC_PREFIX = 'enc:v1:';
const KEY_ALGO = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;
export const EMPTY_STORE = () => ({ version: STORE_VERSION, servers: [], cache: {} });
let cachedDir = null;
/**
 * 解析插件数据目录。优先级：settings documentPath 目录 → $DSH_HOME → ~/.dsh。
 * 结果进程内缓存（宿主运行期目录不会变化）。
 */
export function resolveStoreDir(settingsDocPath) {
    if (cachedDir !== null)
        return cachedDir;
    if (settingsDocPath && settingsDocPath.trim().length > 0) {
        cachedDir = dirname(settingsDocPath);
        return cachedDir;
    }
    const env = process.env.DSH_HOME;
    cachedDir = env && env.trim().length > 0 ? env.trim() : join(homedir(), '.dsh');
    return cachedDir;
}
/** 测试用：重置路径缓存。 */
export function resetStoreDirCache() {
    cachedDir = null;
}
/* ── 密钥与加解密 ───────────────────────────────────────────── */
/** 读取密钥文件；不存在时生成新密钥并写入（权限收紧）。返回 null 表示无需密钥。 */
async function loadKey(dir) {
    const keyPath = join(dir, KEY_FILE);
    try {
        const raw = (await readFile(keyPath, 'utf8')).trim();
        const key = Buffer.from(raw, 'base64');
        if (key.length === KEY_BYTES)
            return key;
        console.warn(`[dsh-jenkins] key file corrupt (length=${key.length}), regenerating: ${keyPath}`);
    }
    catch { /* 不存在或不可读：生成新密钥 */ }
    const key = randomBytes(KEY_BYTES);
    await mkdir(dir, { recursive: true });
    await writeFile(keyPath, key.toString('base64'), { encoding: 'utf8' });
    try {
        await chmod(keyPath, 0o600);
    }
    catch { /* Windows 尽力而为 */ }
    return key;
}
/** 加密 token：enc:v1:<ivBase64>:<tagBase64>:<cipherBase64>；空 token 原样返回。 */
function encryptToken(plain, key) {
    if (!plain)
        return '';
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(KEY_ALGO, key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${ENC_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}
/** 解密 token；密钥缺失/损坏/被篡改时返回空串并告警（不崩溃）。 */
function decryptToken(sealed, key) {
    if (!sealed)
        return '';
    if (!sealed.startsWith(ENC_PREFIX))
        return sealed;
    if (key === null) {
        console.warn('[dsh-jenkins] key file missing, token treated as empty; re-enter token in Settings');
        return '';
    }
    try {
        const rest = sealed.slice(ENC_PREFIX.length);
        const sep = rest.indexOf(':');
        if (sep === -1)
            throw new Error('bad sealed token');
        const tagSep = rest.indexOf(':', sep + 1);
        if (tagSep === -1)
            throw new Error('bad sealed token');
        const iv = Buffer.from(rest.slice(0, sep), 'base64');
        const tag = Buffer.from(rest.slice(sep + 1, tagSep), 'base64');
        const data = Buffer.from(rest.slice(tagSep + 1), 'base64');
        const decipher = createDecipheriv(KEY_ALGO, key, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    }
    catch (e) {
        console.warn('[dsh-jenkins] token decrypt failed, treated as empty; re-enter token in Settings', e instanceof Error ? e.message : String(e));
        return '';
    }
}
/* ── 序列化 / 反序列化 ───────────────────────────────────────── */
function sealStore(store, key) {
    const servers = store.servers.map((s) => ({
        ...s,
        token: key !== null ? encryptToken(s.token, key) : s.token || '',
    }));
    return JSON.stringify({ version: STORE_VERSION, servers, cache: store.cache ?? {} }, null, 2);
}
function openStore(raw, key) {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object')
        throw new Error('store root must be an object');
    const servers = Array.isArray(parsed.servers)
        ? parsed.servers.map((s) => ({
            id: String(s.id || ''),
            name: String(s.name || ''),
            baseUrl: String(s.baseUrl || ''),
            username: String(s.username || ''),
            token: decryptToken(String(s.token || ''), key),
            insecure: !!s.insecure,
            verified: !!s.verified,
        }))
        : [];
    const cache = parsed.cache && typeof parsed.cache === 'object' && !Array.isArray(parsed.cache)
        ? parsed.cache
        : {};
    return { version: STORE_VERSION, servers, cache };
}
/* ── 读 / 写 ─────────────────────────────────────────────────── */
/**
 * 读取数据文件。
 * @returns 有效 store；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
 */
export async function loadStore(dir) {
    const target = join(dir, STORE_FILE);
    let raw;
    try {
        raw = await readFile(target, 'utf8');
    }
    catch (e) {
        const err = e;
        if (err && err.code === 'ENOENT')
            return null;
        console.warn(`[dsh-jenkins] cannot read store file: ${target}`, e instanceof Error ? e.message : String(e));
        return null;
    }
    try {
        // 密钥文件缺失时按需读取：有 enc 前缀 token 才真正需要，缺失按空处理。
        let key = null;
        try {
            const rawKey = (await readFile(join(dir, KEY_FILE), 'utf8')).trim();
            const parsedKey = Buffer.from(rawKey, 'base64');
            if (parsedKey.length === KEY_BYTES)
                key = parsedKey;
        }
        catch { /* 密钥缺失：token 解密走空 */ }
        return openStore(raw, key);
    }
    catch (e) {
        try {
            await rename(target, target + '.bak');
        }
        catch { /* 备份失败忽略 */ }
        console.warn(`[dsh-jenkins] store file corrupt, backed up to .bak and starting empty: ${target}`, e instanceof Error ? e.message : String(e));
        return null;
    }
}
/* ── 原子写（进程内串行队列）──────────────────────────────────── */
let writeChain = Promise.resolve();
function doSave(dir, store) {
    return (async () => {
        await mkdir(dir, { recursive: true });
        const hasToken = store.servers.some((s) => !!s.token);
        const key = hasToken ? await loadKey(dir) : null;
        const payload = sealStore(store, key);
        const tmp = join(dir, STORE_FILE + '.tmp');
        const target = join(dir, STORE_FILE);
        await writeFile(tmp, payload, { encoding: 'utf8' });
        await rename(tmp, target);
    })();
}
/** 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。 */
export function saveStore(dir, store) {
    const next = writeChain.then(() => doSave(dir, store));
    writeChain = next.catch(() => { });
    return next;
}
