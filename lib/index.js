import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Schema from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
//#region src/host/fence.ts
/** 规范化后的 URL hostname 是否指向本地回环（localhost / 127.0.0.0/8 / [::1]）。 */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	const parts = hostname.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** 规范化一个 Host 头 authority 为 URL，解析失败返回 undefined。 */
function parseAuthority(authority) {
	try {
		return new URL(`http://${authority}`);
	} catch {
		return;
	}
}
/** 规范化 authority 形式：hostname，或带端口的 hostname:port。 */
function canonicalAuthority(entry, entryUrl) {
	const port = entryUrl.port !== "" ? entryUrl.port : new URL(`https://${entry}`).port;
	return port === "" ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}
/** 请求 authority 是否匹配 trustedHosts 中的一项（精确或省略端口）。 */
function isTrustedAuthority(hostUrl, trustedHosts) {
	return trustedHosts.some((entry) => {
		const entryUrl = parseAuthority(entry);
		if (entryUrl === void 0) return false;
		return canonicalAuthority(entry, entryUrl) === entryUrl.hostname ? entryUrl.hostname === hostUrl.hostname : entryUrl.host === hostUrl.host;
	});
}
/**
* 判定一次 /dsh-jenkins/api 请求是否可放行。
* @param headers - node HTTP 请求头。
* @param trustedHosts - 部署的非回环受信任主机（webRuntime.trustedHosts，可为空）。
* @returns true 表示 Host 是自有（回环或受信任）且浏览器标记为同源。
*/
function isTrustedApiRequest(headers, trustedHosts) {
	const raw = headers.host;
	if (typeof raw !== "string" || raw === "") return false;
	const hostUrl = parseAuthority(raw);
	if (hostUrl === void 0) return false;
	if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false;
	if (headers["sec-fetch-site"] === "cross-site") return false;
	const origin = headers.origin;
	if (typeof origin !== "string" || origin === "") return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
//#endregion
//#region src/host/jenkins.ts
const psQuote = (v) => `'${String(v).replace(/'/g, "''")}'`;
const normalizeBase = (u) => String(u || "").trim().replace(/\/+$/, "");
/** 从 job URL 中提取路径段（decode 后）。 */
function jobSegments(jobUrl) {
	const m = String(jobUrl || "").match(/\/job\/(.+?)\/?$/);
	if (!m) return [];
	return m[1].split("/job/").map((seg) => {
		try {
			return decodeURIComponent(seg);
		} catch {
			return seg;
		}
	});
}
const jobPath = (segments) => segments.map((seg) => "/job/" + encodeURIComponent(seg)).join("");
/** 拆分 `-D -` 输出的响应头与响应体（兼容 \r\n 与 \n 两种行尾）。 */
function splitHeaders(stdout) {
	const i1 = stdout.indexOf("\r\n\r\n");
	if (i1 !== -1) return {
		headers: stdout.slice(0, i1),
		body: stdout.slice(i1 + 4)
	};
	const i2 = stdout.indexOf("\n\n");
	if (i2 !== -1) return {
		headers: stdout.slice(0, i2),
		body: stdout.slice(i2 + 2)
	};
	return {
		headers: stdout,
		body: ""
	};
}
/** 取响应头里最后一个 HTTP 状态码（重定向链末尾）。 */
function lastStatus(headers) {
	const matches = [...headers.matchAll(/HTTP\/\d(?:\.\d)?\s+(\d+)/g)];
	if (matches.length === 0) return 0;
	return Number(matches[matches.length - 1][1]);
}
function headerValue(headers, name) {
	const m = headers.match(new RegExp(`^${name}\\s*:\\s*(.+)$`, "im"));
	return m ? m[1].trim() : void 0;
}
/** 执行 curl（经 subprocess 直接 spawn，避免 shell 引号/令牌问题）。 */
async function runCurl(ctx, server, args, opts) {
	const sub = ctx.get("subprocess");
	if (sub === void 0) throw new Error("subprocess 服务不可用，无法调用 Jenkins API");
	let curlPath;
	try {
		curlPath = await sub.resolveExecutable("curl.exe");
	} catch {
		curlPath = await sub.resolveExecutable("curl");
	}
	let cwd = ".";
	const policy = ctx.get("sandboxPolicy");
	if (policy !== void 0 && typeof policy.workspaceRoot === "string" && policy.workspaceRoot.length > 0) cwd = policy.workspaceRoot;
	const argv = [
		curlPath,
		"-sS",
		"-m",
		"40",
		"-u",
		(server.username || "admin") + ":" + server.token
	];
	if (server.insecure) argv.push("-k");
	for (const a of args) argv.push(a);
	let handle;
	try {
		handle = await sub.spawn({
			argv,
			cwd,
			stdio: {
				stdin: opts !== void 0 && opts.stdin !== void 0 ? { data: opts.stdin } : "ignore",
				stdout: {
					mode: "collect",
					maxBytes: 8388608
				},
				stderr: {
					mode: "collect",
					maxBytes: 65536
				}
			},
			graceMs: 5e3
		});
	} catch (e) {
		throw new Error("启动 curl 失败：" + (e && e.message || String(e)));
	}
	try {
		await handle.done;
	} catch (e) {
		throw new Error("启动 curl 失败：" + (e && e.message || String(e)));
	}
	const stdout = handle.collected && handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : "";
	const stderr = handle.collected && handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : "";
	return {
		exitCode: (await handle.done).exitCode,
		stdout,
		stderr
	};
}
/** 发一次 Jenkins HTTP 请求，返回状态码 / 响应头 / 响应体。 */
async function jenkinsRequest(ctx, server, path, opts) {
	const method = opts?.method ?? "GET";
	const form = opts?.form !== void 0 ? opts.form : null;
	const headers = opts?.headers ?? {};
	const args = ["-D", "-"];
	if (method === "POST") args.push("-X", "POST");
	for (const k of Object.keys(headers)) args.push("-H", `${k}: ${headers[k]}`);
	if (form !== null) args.push("--data-binary", "@-");
	args.push(normalizeBase(server.baseUrl) + path);
	const runOpts = {};
	if (form !== null) {
		const pairs = [];
		for (const k of Object.keys(form)) pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(form[k] == null ? "" : String(form[k])));
		runOpts.stdin = pairs.join("&");
	}
	const res = await runCurl(ctx, server, args, runOpts);
	if (res.exitCode !== 0 && res.exitCode !== null) throw new Error("网络请求失败：" + ((res.stderr || "").trim() || `curl 退出码 ${res.exitCode}`));
	const parsed = splitHeaders(res.stdout);
	return {
		status: lastStatus(parsed.headers),
		headers: parsed.headers,
		body: parsed.body
	};
}
/** 发 Jenkins 请求并解析 JSON；>=400 抛带 status 的错误。 */
async function jenkinsJson(ctx, server, path, opts) {
	const r = await jenkinsRequest(ctx, server, path, opts);
	if (r.status >= 400) {
		let msg = "HTTP " + r.status;
		try {
			const j = JSON.parse(r.body || "{}");
			if (j.message) msg += "：" + j.message;
		} catch {}
		if (r.status === 401) msg = "认证失败（HTTP 401）：用户名或 Token 不正确";
		if (r.status === 403) msg = "权限不足（HTTP 403）：请检查 Token 权限";
		if (r.status === 404) msg = "资源不存在（HTTP 404）";
		const err = new Error(msg);
		err.status = r.status;
		throw err;
	}
	if (!r.body || !r.body.trim()) return null;
	try {
		return JSON.parse(r.body);
	} catch (e) {
		throw new Error("响应解析失败：" + e.message);
	}
}
/** 获取 CSRF crumb（失败静默返回 null）。 */
async function getCrumb(ctx, server) {
	try {
		const r = await jenkinsRequest(ctx, server, "/crumbIssuer/api/json");
		if (r.status >= 400) return null;
		const j = JSON.parse(r.body || "{}");
		if (j && j.crumb) return {
			field: j.crumbRequestField || "Jenkins-Crumb",
			value: j.crumb
		};
	} catch {}
	return null;
}
/** 归一化 Jenkins 参数定义（服务端 _class → 本地 type）。 */
function normalizeParamDef(d) {
	const cls = String(d._class || "");
	const name = String(d.name || "");
	const desc = String(d.description || "");
	let type = "string";
	let defaultValue = d.defaultValue;
	let choices = null;
	if (cls.indexOf("BooleanParameterDefinition") !== -1) type = "boolean";
	else if (cls.indexOf("ChoiceParameterDefinition") !== -1) {
		type = "choice";
		choices = Array.isArray(d.choices) ? d.choices : [];
	} else if (cls.indexOf("PasswordParameterDefinition") !== -1) type = "password";
	else if (cls.indexOf("TextParameterDefinition") !== -1) type = "text";
	else if (cls.indexOf("CredentialsParameterDefinition") !== -1) type = "credentials";
	else if (cls.indexOf("FileParameterDefinition") !== -1) type = "file";
	return {
		name,
		description: desc,
		type,
		defaultValue: defaultValue === null || defaultValue === void 0 ? "" : defaultValue,
		choices
	};
}
/** 从 job detail 的 property 列表提取参数定义。 */
function extractParams(prop) {
	const list = prop || [];
	let holder = null;
	for (let i = 0; i < list.length; i++) {
		const x = list[i];
		if (x && String(x._class || "").indexOf("ParametersDefinitionProperty") !== -1) {
			holder = x;
			break;
		}
	}
	if (!holder) return [];
	const defs = holder.parameterDefinitions || [];
	const out = [];
	for (let i = 0; i < defs.length; i++) out.push(normalizeParamDef(defs[i]));
	return out;
}
//#endregion
//#region src/host/workspace-config.ts
/** 在工作区根目录查找配置文件（按 json → js → ts 顺序）。 */
async function findConfigFile(fsService, cwd) {
	for (const name of [
		"dsh-jenkins.json",
		"dsh-jenkins.js",
		"dsh-jenkins.ts"
	]) try {
		const target = await fsService.resolve(name, { cwd });
		if (await fsService.stat(target) !== void 0) return {
			name,
			target
		};
	} catch {}
	return null;
}
/** 解析配置文件内容（json 直读；js/ts 经 node 子进程求值 default 导出）。 */
async function parseConfigFile(fsService, shell, found) {
	const { name, target } = found;
	if (name.endsWith(".json")) {
		const text = await fsService.readText(target);
		return JSON.parse(text);
	}
	const abs = fsService.processPath(target);
	const command = `node ${name.endsWith(".ts") ? "--import tsx/esm " : ""}--input-type=module -e ${psQuote("import('file:///'+process.argv[1].replace(/\\\\/g,'/')).then(m=>process.stdout.write(JSON.stringify(m.default??m))).catch(e=>{process.stderr.write(String((e&&e.message)||e));process.exit(1)})")} ${psQuote(abs)}`;
	const spec = shell.resolve({
		command,
		timeoutMs: 2e4,
		stdoutMaxBytes: 2097152
	});
	const res = await shell.run(spec);
	if (res.exitCode !== 0 && res.exitCode !== null) {
		const detail = (res.stderr && res.stderr.text || "").trim().slice(0, 300);
		throw new Error("配置文件解析失败：" + (detail || `node 退出码 ${res.exitCode}`));
	}
	return JSON.parse(res.stdout && res.stdout.text || "{}");
}
/** 校验并归一化配置（数组格式，每个元素 = { job, server, parameters }）。 */
function normalizeConfig(raw) {
	if (!Array.isArray(raw)) throw new Error("配置文件需导出数组（每个元素一个发布目标：{ job, server, environments }）");
	if (raw.length === 0) throw new Error("配置文件数组不能为空");
	return {
		format: "array",
		entries: raw.map((e, i) => {
			if (!e || typeof e !== "object" || Array.isArray(e)) throw new Error("配置第 " + (i + 1) + " 项需为对象");
			const record = e;
			const job = String(record.job || "").trim();
			if (!job) throw new Error("配置第 " + (i + 1) + " 项缺少 job（Jenkins 任务路径）");
			const server = String(record.server || "").trim();
			if (!server) throw new Error("配置第 " + (i + 1) + " 项缺少 server（服务器名称或地址）");
			return {
				job,
				server,
				parameters: record.environments && typeof record.environments === "object" && !Array.isArray(record.environments) ? record.environments : {}
			};
		})
	};
}
/** 加载工作区配置（不存在返回 null）。 */
async function loadWorkspaceConfig(fsService, shell, cwd) {
	const found = await findConfigFile(fsService, cwd);
	if (found === null) return null;
	return {
		...normalizeConfig(await parseConfigFile(fsService, shell, found)),
		file: found.name
	};
}
//#endregion
//#region src/host/update.ts
/**
* dsh-jenkins —— 宿主半边：插件新版本检查（op: updateCheck）。
*
* 以 npm registry 搜索接口（keywords:dsh-jenkins）取线上最新版本，
* 与**被安装根目录的 package.json** 的 version 比对（即本插件安装位置的
* 包清单，经 import.meta.url 相对定位，不依赖任何绝对路径）：
* 返回 { current, latest, hasUpdate }。name 不匹配视为未命中（不提示更新）。
*
* 结果在宿主进程内缓存 10 分钟，避免每次页面加载都请求 registry；
* 网络失败静默降级为 { current, latest:'', hasUpdate:false }，不打扰用户。
* 更新进程结束（pluginUpdateStatus 返回 done）后调用 resetInstalledVersionCache()，
* 下一次 updateCheck 重读新版本号 —— 客户端据此隐藏「更新」胶囊。
*/
/** npm registry 搜索接口：按关键字查本插件，size=1 取第一条。 */
const REGISTRY_URL = "https://registry.npmjs.org/-/v1/search?text=keywords:dsh-jenkins&size=1&from=0";
/** 插件名判断条件：搜索结果 package.name 必须严格等于该值。 */
const PLUGIN_NAME$1 = "dsh-jenkins";
/** registry 结果缓存时长（毫秒）。 */
const CACHE_MS = 6e5;
/** 单次 registry 请求超时（毫秒）。 */
const FETCH_TIMEOUT_MS = 8e3;
/** 解析 semver 版本串；非法返回 null（忽略前导 v，容忍空白）。 */
function parseVersion(input) {
	const raw = String(input ?? "").trim().replace(/^v/i, "");
	const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(raw);
	if (m === null) return null;
	const pre = m[4] !== void 0 ? m[4].split(".").filter((p) => p.length > 0) : [];
	return {
		nums: [
			Number(m[1]),
			Number(m[2]),
			Number(m[3])
		],
		pre
	};
}
/** 比较单个预发布标识：纯数字按数值比较，数字 < 字母串，其余按 ASCII。 */
function comparePreIdentifiers(a, b) {
	const na = /^\d+$/.test(a) ? Number(a) : null;
	const nb = /^\d+$/.test(b) ? Number(b) : null;
	if (na !== null && nb !== null) return na === nb ? 0 : na < nb ? -1 : 1;
	if (na !== null) return -1;
	if (nb !== null) return 1;
	return a === b ? 0 : a < b ? -1 : 1;
}
/**
* 判断 candidate 是否严格比 base 更新（semver 规则子集）：
* 主版本三元组数值比较；预发布版劣于正式版，预发布标识逐段比较。
* 任一侧无法解析时返回 false（宁可漏报也不误报）。
*/
function isNewerVersion(candidate, base) {
	const c = parseVersion(candidate);
	const b = parseVersion(base);
	if (c === null || b === null) return false;
	for (let i = 0; i < 3; i++) if (c.nums[i] !== b.nums[i]) return c.nums[i] > b.nums[i];
	if (c.pre.length === 0 && b.pre.length === 0) return false;
	if (c.pre.length === 0) return true;
	if (b.pre.length === 0) return false;
	const len = Math.max(c.pre.length, b.pre.length);
	for (let i = 0; i < len; i++) {
		const ci = c.pre[i];
		const bi = b.pre[i];
		if (ci === void 0) return false;
		if (bi === void 0) return true;
		const cmp = comparePreIdentifiers(ci, bi);
		if (cmp !== 0) return cmp > 0;
	}
	return false;
}
let installedVersionCache = null;
/** 清空已读版本缓存：插件更新完成后调用，下次 updateCheck 重读新版本号。 */
function resetInstalledVersionCache() {
	installedVersionCache = null;
}
/**
* 读取被安装根目录 package.json 的 version（并校验 name）。
* 编译产物 lib/index.js 相对 `../package.json`；源码直跑（tsx src/…）相对
* `../../package.json`。两候选都失败或 name 不符时回退 process.cwd()。
* 结果进程内记忆（包清单运行期不变）。
*/
function readInstalledVersion() {
	if (installedVersionCache !== null) return installedVersionCache;
	const candidates = [new URL("../package.json", import.meta.url), new URL("../../package.json", import.meta.url)];
	let fallback = "";
	for (const url of candidates) try {
		const text = readFileSync(url, "utf8");
		const pkg = JSON.parse(text);
		if (pkg.name === PLUGIN_NAME$1 && typeof pkg.version === "string") {
			installedVersionCache = pkg.version;
			return pkg.version;
		}
		if (fallback === "" && typeof pkg.version === "string") fallback = pkg.version;
	} catch {}
	if (fallback === "") try {
		const pkg = JSON.parse(readFileSync("package.json", "utf8"));
		if (pkg.name === PLUGIN_NAME$1 && typeof pkg.version === "string") fallback = pkg.version;
	} catch {}
	installedVersionCache = fallback;
	return fallback;
}
let cache = null;
/** 从 registry 响应里取 name 严格匹配条目的版本（objects 可能有多个）。 */
function pickLatest(objects) {
	if (!Array.isArray(objects)) return "";
	for (const item of objects) {
		const pkg = item?.package;
		if (pkg === void 0 || pkg === null || pkg.name !== PLUGIN_NAME$1) continue;
		return typeof pkg.version === "string" ? pkg.version.trim() : "";
	}
	return "";
}
async function fetchLatest() {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(REGISTRY_URL, {
			signal: controller.signal,
			headers: { accept: "application/json" }
		});
		if (!res.ok) return "";
		return pickLatest((await res.json().catch(() => null))?.objects);
	} catch {
		return "";
	} finally {
		clearTimeout(timer);
	}
}
/**
* 检查插件更新：registry 最新版 vs 被安装根目录 package.json 版本。
* 进程内缓存 10 分钟；网络失败降级为 { current, latest:'', hasUpdate:false }。
*/
async function checkPluginUpdate() {
	const current = readInstalledVersion();
	if (cache !== null && Date.now() - cache.at < CACHE_MS) {
		const cachedInfo = cache.info;
		return {
			...cachedInfo,
			current,
			hasUpdate: isNewerVersion(cachedInfo.latest, current)
		};
	}
	const latest = await fetchLatest();
	const info = {
		current,
		latest,
		hasUpdate: isNewerVersion(latest, current)
	};
	cache = {
		at: Date.now(),
		info
	};
	return info;
}
//#endregion
//#region src/host/plugin-update.ts
/**
* dsh-jenkins —— 宿主半边：执行插件更新命令（后台进程 + 输出缓冲）。
*
* 浏览器半边点击「更新」胶囊 → 确认弹框 → 大日志弹框：本模块以子进程后台
* 执行 `dsh plugin --profile web update dsh-jenkins`，stdout/stderr 实时
* 追加进环形缓冲；客户端轮询 pluginUpdateStatus op 拉取累计输出与运行状态
* （done / exitCode）。同一时刻只允许一个更新进程；进程内缓冲有上限防膨胀。
* 更新进程结束（done）后，ops 层会调用 update.ts 的 resetInstalledVersionCache()，
* 使下次 updateCheck 重读新版本号（客户端据此隐藏「更新」胶囊）。
*/
/** 被更新的插件包名（dsh plugin --profile web update <包名>）。 */
const PLUGIN_NAME = "dsh-jenkins";
let run = null;
function appendOutput(rec, text) {
	rec.output = (rec.output + text).slice(-524288);
}
/**
* 启动更新进程。已在运行则返回 alreadyRunning=true（不重复启动）；
* 上次已结束则丢弃旧记录重新开始。
*/
function startPluginUpdate() {
	if (run !== null && run.running) return {
		ok: true,
		alreadyRunning: true
	};
	run = null;
	let child;
	try {
		child = spawn("dsh", [
			"plugin",
			"--profile",
			"web",
			"update",
			PLUGIN_NAME
		], {
			shell: process.platform === "win32",
			windowsHide: true
		});
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : String(e)
		};
	}
	const rec = {
		child,
		output: "",
		running: true,
		exitCode: null,
		error: ""
	};
	run = rec;
	child.stdout.on("data", (d) => appendOutput(rec, d.toString()));
	child.stderr.on("data", (d) => appendOutput(rec, d.toString()));
	child.on("error", (err) => {
		appendOutput(rec, `\n[spawn error] ${err.message}\n`);
		rec.error = err.message;
		rec.exitCode = -1;
		rec.running = false;
	});
	child.on("close", (code) => {
		appendOutput(rec, `\n[exit code ${code ?? "null"}]\n`);
		rec.exitCode = code;
		rec.running = false;
	});
	return { ok: true };
}
/** 轮询用：当前更新进程（或最近一次已结束进程）的状态与累计输出。 */
function getPluginUpdateStatus() {
	if (run === null) return {
		running: false,
		done: false,
		output: "",
		exitCode: null,
		error: ""
	};
	return {
		running: run.running,
		done: !run.running,
		output: run.output,
		exitCode: run.exitCode,
		error: run.error
	};
}
//#endregion
//#region src/host/ops.ts
const maskToken = (t) => {
	if (!t) return "";
	if (t.length <= 6) return "••••••";
	return t.slice(0, 2) + "••••" + t.slice(-2);
};
const publicServer = (s) => ({
	id: s.id,
	name: s.name,
	baseUrl: s.baseUrl,
	username: s.username,
	tokenMasked: maskToken(s.token),
	hasToken: !!s.token,
	insecure: !!s.insecure,
	verified: !!s.verified
});
/** 把异常/消息映射为本地化错误码（客户端按 code 显示中/英文）。 */
function errCodeOf(e) {
	const err = e;
	if (err && err.status === 401) return "auth-failed";
	if (err && err.status === 403) return "forbidden";
	if (err && err.status === 404) return "not-found";
	const msg = err && err.message || String(e);
	if (msg.indexOf("网络请求失败") !== -1) return "network-failed";
	if (msg.indexOf("无法解析任务路径") !== -1) return "job-path-invalid";
	if (msg.indexOf("缺少队列 ID") !== -1) return "queue-id-missing";
	if (msg.indexOf("缺少工作区路径") !== -1) return "cwd-missing";
	if (msg.indexOf("响应解析失败") !== -1) return "parse-failed";
}
async function runOp(deps, req) {
	if (deps.storeReady) await deps.storeReady;
	const { ctx, readServers, writeServers, findServer } = deps;
	const op = req && req.op;
	if (op === "workspaceConfig") {
		const cwd = String(req.cwd || "").trim();
		console.log("[dsh-jenkins] workspaceConfig cwd=", cwd);
		if (!cwd) return {
			ok: false,
			code: "cwd-missing",
			error: "Missing workspace path"
		};
		try {
			const fsService = ctx.get("fs");
			const shell = ctx.get("shell");
			if (fsService === void 0 || shell === void 0) return {
				ok: false,
				code: "fs-missing",
				error: "fs/shell service unavailable"
			};
			const config = await loadWorkspaceConfig(fsService, shell, cwd);
			console.log("[dsh-jenkins] workspaceConfig found=", config !== null, config && config.file);
			return config === null ? {
				ok: true,
				found: false,
				config: null
			} : {
				ok: true,
				found: true,
				config
			};
		} catch (e) {
			console.error("[dsh-jenkins] workspaceConfig error", e);
			return {
				ok: false,
				code: errCodeOf(e),
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	if (op === "workspaceTrigger") {
		const cwd = String(req.cwd || "").trim();
		if (!cwd) return {
			ok: false,
			code: "cwd-missing",
			error: "Missing workspace path"
		};
		try {
			const fsService = ctx.get("fs");
			const shell = ctx.get("shell");
			if (fsService === void 0 || shell === void 0) return {
				ok: false,
				code: "fs-missing",
				error: "fs/shell service unavailable"
			};
			const config = await loadWorkspaceConfig(fsService, shell, cwd);
			if (config === null) return {
				ok: false,
				code: "no-config",
				error: "No dsh-jenkins.json/js/ts config found in workspace root"
			};
			const entries = config.entries || [];
			let server = req.serverId ? findServer(String(req.serverId)) : void 0;
			if (server === void 0) for (const en of entries) {
				server = findServer(en.server);
				if (server !== void 0) break;
			}
			if (server === void 0) {
				const all = readServers();
				if (all.length === 1) server = all[0];
			}
			if (server === void 0) return {
				ok: false,
				code: "server-missing",
				error: "Server from config not found; configure it in Settings → Jenkins first"
			};
			const segs = (req.job && String(req.job).trim() ? String(req.job).trim() : entries[0] ? entries[0].job : "").split("/").filter(Boolean);
			if (segs.length === 0) return {
				ok: false,
				code: "job-path-invalid",
				error: "Empty job path"
			};
			const jobKey = segs.join("/");
			let parameters = req.parameters && typeof req.parameters === "object" && Object.keys(req.parameters).length > 0 ? req.parameters : null;
			if (parameters === null) {
				const serverId = server.id;
				const match = entries.find((en) => {
					const s = findServer(en.server);
					return en.job === jobKey && s !== void 0 && s.id === serverId;
				}) || entries.find((en) => en.job === jobKey) || entries[0];
				parameters = match && match.parameters || {};
			}
			const result = await runOp(deps, {
				op: "trigger",
				serverId: server.id,
				segments: segs,
				parameters
			});
			if (!result.ok) return result;
			let nextBuildNumber = null;
			if (result.queueId == null) try {
				const d = await runOp(deps, {
					op: "jobDetail",
					serverId: server.id,
					jobUrl: normalizeBase(server.baseUrl) + jobPath(segs)
				});
				if (d.ok) nextBuildNumber = d.nextBuildNumber;
			} catch {}
			return {
				ok: true,
				queueId: result.queueId,
				location: result.location,
				serverId: server.id,
				segments: segs,
				nextBuildNumber
			};
		} catch (e) {
			return {
				ok: false,
				code: errCodeOf(e),
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	if (op === "saveTemplate") {
		const cwd = String(req.cwd || "").trim();
		if (!cwd) return {
			ok: false,
			code: "cwd-missing",
			error: "Missing workspace path"
		};
		const filename = String(req.filename || "").trim();
		if (filename !== "dsh-jenkins.json" && filename !== "dsh-jenkins.js" && filename !== "dsh-jenkins.ts") return {
			ok: false,
			code: "template-name-invalid",
			error: "Invalid template filename: " + filename
		};
		try {
			const fsService = ctx.get("fs");
			if (fsService === void 0) return {
				ok: false,
				code: "fs-missing",
				error: "fs service unavailable"
			};
			const target = await fsService.resolve(filename, { cwd });
			const existed = await fsService.stat(target) !== void 0;
			if (existed && req.overwrite !== true) return {
				ok: true,
				existed: true,
				path: fsService.processPath(target)
			};
			await fsService.writeText(target, String(req.content ?? ""), void 0, void 0, {
				mode: "workspace-write",
				workspaceRoot: cwd
			});
			return {
				ok: true,
				existed,
				path: fsService.processPath(target)
			};
		} catch (e) {
			console.error("[dsh-jenkins] saveTemplate error", e);
			return {
				ok: false,
				code: "template-save-failed",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	if (op === "list") return {
		ok: true,
		servers: readServers().map(publicServer)
	};
	if (op === "save") {
		const a = req && req.server || {};
		const baseUrl = normalizeBase(String(a.baseUrl || ""));
		const username = String(a.username || "").trim();
		const token = String(a.token || "").trim();
		if (!/^https?:\/\//i.test(baseUrl)) return {
			ok: false,
			code: "url-invalid",
			error: "Server URL must start with http:// or https://"
		};
		if (!username) return {
			ok: false,
			code: "username-required",
			error: "Username is required"
		};
		const name = String(a.name || "").trim() || baseUrl;
		const servers = readServers();
		if (a.id) {
			const s = servers.find((x) => x.id === a.id);
			if (!s) return {
				ok: false,
				code: "server-missing",
				error: "Server not found"
			};
			const effectiveToken = token || s.token;
			if (!effectiveToken) return {
				ok: false,
				code: "token-required",
				error: "Token is required"
			};
			const connChanged = s.baseUrl !== baseUrl || s.username !== username || !!s.insecure !== !!a.insecure || !!token && token !== s.token;
			s.name = name;
			s.baseUrl = baseUrl;
			s.username = username;
			s.token = effectiveToken;
			s.insecure = !!a.insecure;
			if (connChanged) s.verified = false;
		} else {
			if (!token) return {
				ok: false,
				code: "token-required",
				error: "Token is required"
			};
			servers.push({
				id: "srv-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
				name,
				baseUrl,
				username,
				token,
				insecure: !!a.insecure
			});
		}
		await writeServers(servers);
		return {
			ok: true,
			servers: readServers().map(publicServer)
		};
	}
	if (op === "delete") {
		await writeServers(readServers().filter((s) => s.id !== req.id));
		return {
			ok: true,
			servers: readServers().map(publicServer)
		};
	}
	if (op === "test") {
		const a = req && req.server || {};
		const stored = a.id ? findServer(String(a.id)) : null;
		let baseUrl = normalizeBase(String(a.baseUrl || ""));
		let username = String(a.username || "").trim();
		let token = String(a.token || "").trim();
		if (stored) {
			if (!baseUrl) baseUrl = stored.baseUrl;
			if (!username) username = stored.username;
			if (!token) token = stored.token;
		}
		if (!baseUrl || !token) return {
			ok: false,
			code: "fields-missing",
			error: "Server URL and Token are required"
		};
		const insecure = a.insecure !== void 0 ? !!a.insecure : stored ? !!stored.insecure : false;
		const server = {
			baseUrl,
			username: username || "admin",
			token,
			insecure
		};
		const persistVerified = async (v) => {
			if (!stored) return;
			const servers = readServers();
			const target = servers.find((s) => s.id === stored.id);
			if (target) {
				target.verified = v;
				await writeServers(servers);
			}
		};
		let r;
		try {
			r = await jenkinsRequest(ctx, server, "/api/json");
		} catch (e) {
			await persistVerified(false);
			return {
				ok: false,
				code: errCodeOf(e) || "network-failed",
				error: e instanceof Error ? e.message : String(e)
			};
		}
		if (r.status === 401) {
			await persistVerified(false);
			return {
				ok: false,
				code: "auth-failed",
				error: "Authentication failed: wrong username or Token (HTTP 401)"
			};
		}
		if (r.status === 403) {
			await persistVerified(false);
			return {
				ok: false,
				code: "forbidden",
				error: "Permission denied (HTTP 403)"
			};
		}
		if (r.status >= 400) {
			await persistVerified(false);
			return {
				ok: false,
				code: "connect-failed",
				error: "Connection failed (HTTP " + r.status + ")"
			};
		}
		let data = null;
		try {
			data = JSON.parse(r.body || "{}");
		} catch {}
		await persistVerified(true);
		return {
			ok: true,
			version: data && data.version ? data.version : "",
			nodeName: data && data.nodeName ? data.nodeName : ""
		};
	}
	if (op === "jobs") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found; configure it in settings first"
		};
		const data = await jenkinsJson(ctx, s, "/api/json?tree=" + encodeURIComponent("jobs[name,color,url,buildable,jobs[name,color,url,buildable,jobs[name,color,url,buildable]]]"));
		const jobs = [];
		const walk = (list, prefix, depth) => {
			for (const j of list || []) {
				const segs = prefix.concat([String(j.name)]);
				if (j.color === "folder" || Array.isArray(j.jobs) && j.jobs.length > 0) {
					if (depth < 3 && Array.isArray(j.jobs)) walk(j.jobs, segs, depth + 1);
					else jobs.push({
						path: segs.join("/"),
						name: j.name,
						color: "folder",
						buildable: false,
						folder: true,
						url: j.url || ""
					});
				} else jobs.push({
					path: segs.join("/"),
					name: j.name,
					color: j.color || "grey",
					buildable: !!j.buildable,
					folder: false,
					url: j.url || ""
				});
			}
		};
		walk(data.jobs || [], [], 1);
		jobs.sort((x, y) => x.folder === y.folder ? String(x.name).localeCompare(String(y.name)) : x.folder ? -1 : 1);
		return {
			ok: true,
			jobs
		};
	}
	if (op === "jobDetail") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const segs = jobSegments(String(req.jobUrl || ""));
		if (segs.length === 0) return {
			ok: false,
			code: "job-path-invalid",
			error: "Unable to parse job path"
		};
		const data = await jenkinsJson(ctx, s, jobPath(segs) + "/api/json");
		return {
			ok: true,
			name: data.name || "",
			buildable: !!data.buildable,
			color: data.color || "",
			nextBuildNumber: data.nextBuildNumber || null,
			url: data.url || "",
			lastBuild: data.lastBuild ? {
				number: data.lastBuild.number,
				building: !!data.lastBuild.building,
				result: data.lastBuild.result || null
			} : null,
			params: extractParams(data.property),
			segments: segs
		};
	}
	if (op === "jobHistory") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ""));
		if (segs.length === 0) return {
			ok: false,
			code: "job-path-invalid",
			error: "Unable to parse job path"
		};
		return {
			ok: true,
			builds: ((await jenkinsJson(ctx, s, jobPath(segs) + "/api/json?tree=builds%5Bnumber%2Ctimestamp%2Cresult%2Cbuilding%2Cduration%2Curl%2Cdescription%2CdisplayName%5D")).builds || []).map((b) => ({
				number: b.number == null ? null : Number(b.number),
				timestamp: b.timestamp == null ? null : Number(b.timestamp),
				result: b.result == null ? null : String(b.result),
				building: !!b.building,
				duration: b.duration == null ? 0 : Number(b.duration),
				url: String(b.url || ""),
				description: String(b.description || ""),
				displayName: String(b.displayName || "")
			})),
			job: segs.join("/"),
			server: s.name
		};
	}
	if (op === "trigger") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ""));
		if (segs.length === 0) return {
			ok: false,
			code: "job-path-invalid",
			error: "Unable to parse job path"
		};
		const params = req.parameters && typeof req.parameters === "object" ? req.parameters : {};
		const hasParams = Object.keys(params).length > 0;
		const crumb = await getCrumb(ctx, s);
		const headers = {};
		if (crumb) headers[crumb.field] = crumb.value;
		const res = await jenkinsRequest(ctx, s, jobPath(segs) + (hasParams ? "/buildWithParameters" : "/build"), {
			method: "POST",
			form: hasParams ? params : null,
			headers
		});
		if (res.status >= 300 && res.status < 400) return {
			ok: false,
			code: "redirect",
			error: "Server returned a redirect (HTTP " + res.status + "); check that the URL is the final one (e.g. https://…)"
		};
		if (res.status >= 400) {
			const detail = (res.body || "").trim().slice(0, 300);
			return {
				ok: false,
				code: "trigger-http",
				status: res.status,
				detail,
				error: "Failed to trigger build (HTTP " + res.status + "): " + (detail || "no response body")
			};
		}
		const loc = headerValue(res.headers, "Location");
		const qm = loc ? String(loc).match(/\/queue\/item\/(\d+)/) : null;
		return {
			ok: true,
			queueId: qm ? Number(qm[1]) : null,
			location: loc || null
		};
	}
	if (op === "queueStatus") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const id = Number(req.queueId);
		if (!id) return {
			ok: false,
			code: "queue-id-missing",
			error: "Missing queue ID"
		};
		const data = await jenkinsJson(ctx, s, "/queue/item/" + id + "/api/json");
		const ex = data.executable;
		if (ex && ex.number) return {
			ok: true,
			state: "started",
			buildNumber: ex.number,
			buildUrl: ex.url || "",
			why: data.why || ""
		};
		if (data.cancelled) return {
			ok: true,
			state: "cancelled",
			why: data.why || ""
		};
		return {
			ok: true,
			state: "queued",
			why: data.why || "",
			blocked: !!data.blocked
		};
	}
	if (op === "buildStatus") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ""));
		if (segs.length === 0) return {
			ok: false,
			code: "job-path-invalid",
			error: "Unable to parse job path"
		};
		const num = Number(req.buildNumber);
		const path = jobPath(segs) + (num ? "/" + num : "/lastBuild") + "/api/json";
		try {
			const data = await jenkinsJson(ctx, s, path);
			return {
				ok: true,
				number: data.number || null,
				building: !!data.building,
				result: data.result || null,
				duration: data.duration || 0,
				timestamp: data.timestamp || 0,
				estimatedDuration: data.estimatedDuration || 0,
				url: data.url || "",
				displayName: data.displayName || ""
			};
		} catch (e) {
			const err = e;
			if (err && err.status === 404) return {
				ok: false,
				code: "build-not-found",
				error: "No build record found yet",
				notFound: true
			};
			throw e;
		}
	}
	if (op === "buildLog") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ""));
		if (segs.length === 0) return {
			ok: false,
			code: "job-path-invalid",
			error: "Unable to parse job path"
		};
		const num = Number(req.buildNumber);
		if (!num) return {
			ok: false,
			code: "build-not-found",
			error: "Missing build number"
		};
		const res = await jenkinsRequest(ctx, s, jobPath(segs) + "/" + num + "/consoleText");
		if (res.status === 404) return {
			ok: false,
			code: "build-not-found",
			error: "No build log found yet",
			notFound: true
		};
		if (res.status >= 400) return {
			ok: false,
			code: "log-failed",
			status: res.status,
			error: "Failed to fetch build log (HTTP " + res.status + ")"
		};
		const MAX_LOG = 512e3;
		const body = res.body || "";
		const truncated = body.length > MAX_LOG;
		return {
			ok: true,
			log: truncated ? body.slice(body.length - MAX_LOG) : body,
			truncated
		};
	}
	if (op === "cancel") {
		const s = findServer(String(req.serverId || ""));
		if (!s) return {
			ok: false,
			code: "server-missing",
			error: "Server not found"
		};
		const crumb = await getCrumb(ctx, s);
		const headers = {};
		if (crumb) headers[crumb.field] = crumb.value;
		const num = Number(req.buildNumber);
		if (num) {
			const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ""));
			if (segs.length === 0) return {
				ok: false,
				code: "job-path-invalid",
				error: "Unable to parse job path"
			};
			const res = await jenkinsRequest(ctx, s, jobPath(segs) + "/" + num + "/stop", {
				method: "POST",
				headers
			});
			if (res.status >= 400) return {
				ok: false,
				code: "cancel-failed",
				status: res.status,
				error: "Failed to stop build (HTTP " + res.status + ")"
			};
			return {
				ok: true,
				target: "build"
			};
		}
		const queueId = Number(req.queueId);
		if (queueId) {
			const res = await jenkinsRequest(ctx, s, "/queue/cancelItem?id=" + queueId, {
				method: "POST",
				headers
			});
			if (res.status >= 400) return {
				ok: false,
				code: "cancel-failed",
				status: res.status,
				error: "Failed to cancel queued build (HTTP " + res.status + ")"
			};
			return {
				ok: true,
				target: "queue"
			};
		}
		return {
			ok: false,
			code: "build-not-found",
			error: "Missing build number or queue id"
		};
	}
	if (op === "updateCheck") return {
		ok: true,
		update: await checkPluginUpdate()
	};
	if (op === "pluginUpdateStart") {
		const start = startPluginUpdate();
		return start.ok ? {
			ok: true,
			alreadyRunning: start.alreadyRunning === true
		} : {
			ok: false,
			code: "spawn-failed",
			error: start.error ?? "failed to spawn dsh"
		};
	}
	if (op === "pluginUpdateStatus") {
		const status = getPluginUpdateStatus();
		if (status.done) resetInstalledVersionCache();
		return {
			ok: true,
			status
		};
	}
	if (op === "cacheGet") return {
		ok: true,
		cache: deps.readCacheJson()
	};
	if (op === "cacheSet") {
		const key = String(req.key || "");
		if (key !== "lastParams" && key !== "history") return {
			ok: false,
			code: "cache-key-invalid",
			error: "Invalid cache key: " + key
		};
		const cache = deps.readCacheJson();
		cache[key] = req.value;
		await deps.writeCacheJson(cache);
		return { ok: true };
	}
	return {
		ok: false,
		code: "unknown-op",
		error: "Unknown operation: " + String(op)
	};
}
const STORE_FILE = "dsh-jenkins.json";
const KEY_FILE = "dsh-jenkins.key";
const ENC_PREFIX = "enc:v1:";
const KEY_ALGO = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const EMPTY_STORE = () => ({
	version: 1,
	servers: [],
	cache: {}
});
let cachedDir = null;
/**
* 解析插件数据目录。优先级：settings documentPath 目录 → $DSH_HOME → ~/.dsh。
* 结果进程内缓存（宿主运行期目录不会变化）。
*/
function resolveStoreDir(settingsDocPath) {
	if (cachedDir !== null) return cachedDir;
	if (settingsDocPath && settingsDocPath.trim().length > 0) {
		cachedDir = dirname(settingsDocPath);
		return cachedDir;
	}
	const env = process.env.DSH_HOME;
	cachedDir = env && env.trim().length > 0 ? env.trim() : join(homedir(), ".dsh");
	return cachedDir;
}
/** 读取密钥文件；不存在时生成新密钥并写入（权限收紧）。返回 null 表示无需密钥。 */
async function loadKey(dir) {
	const keyPath = join(dir, KEY_FILE);
	try {
		const raw = (await readFile(keyPath, "utf8")).trim();
		const key = Buffer.from(raw, "base64");
		if (key.length === KEY_BYTES) return key;
		console.warn(`[dsh-jenkins] key file corrupt (length=${key.length}), regenerating: ${keyPath}`);
	} catch {}
	const key = randomBytes(KEY_BYTES);
	await mkdir(dir, { recursive: true });
	await writeFile(keyPath, key.toString("base64"), { encoding: "utf8" });
	try {
		await chmod(keyPath, 384);
	} catch {}
	return key;
}
/** 加密 token：enc:v1:<ivBase64>:<tagBase64>:<cipherBase64>；空 token 原样返回。 */
function encryptToken(plain, key) {
	if (!plain) return "";
	const iv = randomBytes(IV_BYTES);
	const cipher = createCipheriv(KEY_ALGO, key, iv);
	const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `${ENC_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}
/** 解密 token；密钥缺失/损坏/被篡改时返回空串并告警（不崩溃）。 */
function decryptToken(sealed, key) {
	if (!sealed) return "";
	if (!sealed.startsWith(ENC_PREFIX)) return sealed;
	if (key === null) {
		console.warn("[dsh-jenkins] key file missing, token treated as empty; re-enter token in Settings");
		return "";
	}
	try {
		const rest = sealed.slice(7);
		const sep = rest.indexOf(":");
		if (sep === -1) throw new Error("bad sealed token");
		const tagSep = rest.indexOf(":", sep + 1);
		if (tagSep === -1) throw new Error("bad sealed token");
		const iv = Buffer.from(rest.slice(0, sep), "base64");
		const tag = Buffer.from(rest.slice(sep + 1, tagSep), "base64");
		const data = Buffer.from(rest.slice(tagSep + 1), "base64");
		const decipher = createDecipheriv(KEY_ALGO, key, iv);
		decipher.setAuthTag(tag);
		return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
	} catch (e) {
		console.warn("[dsh-jenkins] token decrypt failed, treated as empty; re-enter token in Settings", e instanceof Error ? e.message : String(e));
		return "";
	}
}
function sealStore(store, key) {
	const servers = store.servers.map((s) => ({
		...s,
		token: key !== null ? encryptToken(s.token, key) : s.token || ""
	}));
	return JSON.stringify({
		version: 1,
		servers,
		cache: store.cache ?? {}
	}, null, 2);
}
function openStore(raw, key) {
	const parsed = JSON.parse(raw);
	if (!parsed || typeof parsed !== "object") throw new Error("store root must be an object");
	return {
		version: 1,
		servers: Array.isArray(parsed.servers) ? parsed.servers.map((s) => ({
			id: String(s.id || ""),
			name: String(s.name || ""),
			baseUrl: String(s.baseUrl || ""),
			username: String(s.username || ""),
			token: decryptToken(String(s.token || ""), key),
			insecure: !!s.insecure,
			verified: !!s.verified
		})) : [],
		cache: parsed.cache && typeof parsed.cache === "object" && !Array.isArray(parsed.cache) ? parsed.cache : {}
	};
}
/**
* 读取数据文件。
* @returns 有效 store；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
*/
async function loadStore(dir) {
	const target = join(dir, STORE_FILE);
	let raw;
	try {
		raw = await readFile(target, "utf8");
	} catch (e) {
		const err = e;
		if (err && err.code === "ENOENT") return null;
		console.warn(`[dsh-jenkins] cannot read store file: ${target}`, e instanceof Error ? e.message : String(e));
		return null;
	}
	try {
		let key = null;
		try {
			const rawKey = (await readFile(join(dir, KEY_FILE), "utf8")).trim();
			const parsedKey = Buffer.from(rawKey, "base64");
			if (parsedKey.length === KEY_BYTES) key = parsedKey;
		} catch {}
		return openStore(raw, key);
	} catch (e) {
		try {
			await rename(target, target + ".bak");
		} catch {}
		console.warn(`[dsh-jenkins] store file corrupt, backed up to .bak and starting empty: ${target}`, e instanceof Error ? e.message : String(e));
		return null;
	}
}
let writeChain = Promise.resolve();
function doSave(dir, store) {
	return (async () => {
		await mkdir(dir, { recursive: true });
		const payload = sealStore(store, store.servers.some((s) => !!s.token) ? await loadKey(dir) : null);
		const tmp = join(dir, "dsh-jenkins.json.tmp");
		const target = join(dir, STORE_FILE);
		await writeFile(tmp, payload, { encoding: "utf8" });
		await rename(tmp, target);
	})();
}
/** 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。 */
function saveStore(dir, store) {
	const next = writeChain.then(() => doSave(dir, store));
	writeChain = next.catch(() => {});
	return next;
}
//#endregion
//#region src/host/index.ts
const name = "dsh-jenkins";
const inject = [
	"shell",
	"tools",
	"settings",
	"commands"
];
const ServerSchema = Schema.object({
	id: Schema.string().required(),
	name: Schema.string().required(),
	baseUrl: Schema.string().required(),
	username: Schema.string().required(),
	token: Schema.string().required(),
	insecure: Schema.boolean().default(false)
});
const Config = Schema.object({ servers: Schema.array(ServerSchema).default([]) });
/** 旧版 settings 命名空间（仅一次性迁移读取，迁移完成后不再读写）。 */
const LegacySettingsSchema = Schema.object({
	serversJson: Schema.string().default("[]"),
	cacheJson: Schema.string().default("{}")
});
const API_BODY_LIMIT = 1 << 20;
function writeApiJson(res, status, body) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(body));
}
function apply(ctx, config) {
	if (ctx.get("shell") === void 0) return;
	const settings = ctx.get("settings");
	const commands = ctx.get("commands");
	const storeDir = resolveStoreDir(settings?.documentPath);
	const mirror = EMPTY_STORE();
	let storeReady = Promise.resolve();
	let legacyScope = null;
	if (settings !== void 0) try {
		legacyScope = settings.register(settingsNamespace("dsh-jenkins"), LegacySettingsSchema, { base: {
			serversJson: JSON.stringify(config.servers || []),
			cacheJson: "{}"
		} });
	} catch {}
	/** 解析旧 settings 命名空间中的 JSON 字符串（容错返回空值）。 */
	const parseLegacyJson = (raw, fallback) => {
		if (typeof raw !== "string" || raw.trim().length === 0) return JSON.parse(fallback);
		try {
			return JSON.parse(raw);
		} catch {
			return JSON.parse(fallback);
		}
	};
	/** 读取旧 settings 命名空间数据（servers + cache），空则返回空值。 */
	const readLegacy = (scope) => {
		if (scope === null) return {
			servers: [],
			cache: {}
		};
		let servers = [];
		let cache = {};
		const value = scope.get();
		try {
			const parsed = parseLegacyJson(value && value.serversJson, "[]");
			servers = Array.isArray(parsed) ? parsed : [];
		} catch {}
		try {
			const parsed = parseLegacyJson(value && value.cacheJson, "{}");
			cache = parsed && typeof parsed === "object" ? parsed : {};
		} catch {}
		return {
			servers,
			cache
		};
	};
	/**
	* 清空旧 settings 命名空间（幂等）：迁移完成后调用；也处理「数据文件已存在
	* 但旧命名空间仍有残留」的场景（如上次进程在迁移中途退出）。旧数据已空时
	* 不写（避免每次启动都触发一次 settings 持久化）。
	*/
	const clearLegacy = async (scope) => {
		if (scope === null) return;
		const { servers, cache } = readLegacy(scope);
		if (!(servers.length > 0 || Object.keys(cache).length > 0)) return;
		await scope.update({
			serversJson: "[]",
			cacheJson: "{}"
		});
		console.log("[dsh-jenkins] cleared legacy settings namespace");
	};
	storeReady = (async () => {
		try {
			const loaded = await loadStore(storeDir);
			if (loaded !== null) {
				mirror.servers = loaded.servers;
				mirror.cache = loaded.cache;
			} else {
				const legacy = readLegacy(legacyScope);
				if (legacy.servers.length > 0 || Object.keys(legacy.cache).length > 0) {
					mirror.servers = legacy.servers;
					mirror.cache = legacy.cache;
					await saveStore(storeDir, mirror);
					console.log(`[dsh-jenkins] migrated legacy settings → ${storeDir}/dsh-jenkins.json`);
				}
			}
			await clearLegacy(legacyScope);
		} catch (e) {
			console.warn("[dsh-jenkins] store init failed, using in-memory only", e instanceof Error ? e.message : String(e));
		}
	})();
	storeReady.catch(() => {});
	const readServers = () => mirror.servers;
	const writeServers = async (servers) => {
		mirror.servers = servers;
		await saveStore(storeDir, mirror);
	};
	const readCacheJson = () => mirror.cache;
	const writeCacheJson = async (cache) => {
		mirror.cache = cache;
		await saveStore(storeDir, mirror);
	};
	const normUrl = (u) => String(u || "").trim().replace(/\/+$/, "");
	const findServer = (nameOrIdOrUrl) => {
		const ref = normUrl(nameOrIdOrUrl);
		return readServers().find((s) => s.name === nameOrIdOrUrl || s.id === nameOrIdOrUrl || normUrl(s.baseUrl) === ref);
	};
	const deps = {
		ctx,
		readServers,
		writeServers,
		findServer,
		readCacheJson,
		writeCacheJson,
		storeReady
	};
	const webServer = ctx.get("webServer");
	const webRuntime = ctx.get("webRuntime");
	if (webServer !== void 0) {
		const fence = (headers) => isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? []);
		try {
			webServer.register({
				kind: "exact",
				path: "/dsh-jenkins/api",
				handler: async (req, res) => {
					if (!fence(req.headers)) {
						writeApiJson(res, 403, {
							ok: false,
							error: {
								code: "forbidden",
								message: "forbidden"
							}
						});
						return;
					}
					if (req.method !== "POST") {
						writeApiJson(res, 405, {
							ok: false,
							error: {
								code: "method-error",
								message: "method not allowed"
							}
						});
						return;
					}
					const chunks = [];
					let total = 0;
					for await (const chunk of req) {
						const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
						total += buffer.length;
						if (total > API_BODY_LIMIT) {
							writeApiJson(res, 413, {
								ok: false,
								error: {
									code: "body-too-large",
									message: "request body too large"
								}
							});
							return;
						}
						chunks.push(buffer);
					}
					const text = Buffer.concat(chunks).toString("utf8");
					let request = { op: "" };
					if (text.trim().length > 0) try {
						request = JSON.parse(text);
					} catch {
						writeApiJson(res, 400, {
							ok: false,
							error: {
								code: "params-invalid",
								message: "Parameters must be JSON"
							}
						});
						return;
					}
					try {
						writeApiJson(res, 200, {
							ok: true,
							value: await runOp(deps, request)
						});
					} catch (e) {
						writeApiJson(res, 200, {
							ok: true,
							value: {
								ok: false,
								code: errCodeOfLocal(e),
								error: e instanceof Error ? e.message : String(e)
							}
						});
					}
				}
			});
		} catch {}
		const iconRoute = "/plugins/dsh-jenkins/assets/logo.svg";
		const iconPath = fileURLToPath(new URL("../assets/logo.svg", import.meta.url));
		let iconCache = null;
		let iconWarned = false;
		try {
			webServer.register({
				kind: "exact",
				path: iconRoute,
				handler: async (req, res) => {
					if (req.method !== "GET" && req.method !== "HEAD") {
						res.writeHead(405);
						res.end();
						return;
					}
					if (iconCache === null) try {
						iconCache = await readFile(iconPath);
					} catch (e) {
						if (!iconWarned) {
							iconWarned = true;
							console.warn(`[dsh-jenkins] footer icon missing: ${iconPath}`, e instanceof Error ? e.message : String(e));
						}
						res.writeHead(404);
						res.end();
						return;
					}
					res.writeHead(200, {
						"content-type": "image/svg+xml",
						"cache-control": "no-cache"
					});
					res.end(req.method === "HEAD" ? void 0 : iconCache);
				}
			});
		} catch {}
	}
	if (commands !== void 0) commands.register({
		name: "dsh-jenkins",
		description: "Jenkins CLI：管理服务器配置并触发/查询构建（设置界面/工作区入口调用）。Manage Jenkins servers and trigger/query builds (used by the settings UI and workspace entry). 参数为 JSON：{ \"op\": \"list|save|delete|test|jobs|jobDetail|jobHistory|trigger|queueStatus|buildStatus|buildLog|cancel|updateCheck|pluginUpdateStart|pluginUpdateStatus|cacheGet|cacheSet|workspaceConfig|workspaceTrigger|saveTemplate\", ... }。",
		input: { hint: "{\"op\":\"list\"}" },
		recordInput: true,
		handler: async (invocation) => {
			const raw = (invocation.rawInput ?? "").trim();
			let req = { op: "" };
			if (raw.length > 0) try {
				req = JSON.parse(raw);
			} catch {
				return {
					kind: "error",
					text: JSON.stringify({
						ok: false,
						code: "params-invalid",
						error: "Parameters must be JSON"
					})
				};
			}
			try {
				const payload = await runOp(deps, req);
				return {
					kind: "success",
					text: JSON.stringify(payload)
				};
			} catch (e) {
				return {
					kind: "error",
					text: JSON.stringify({
						ok: false,
						code: errCodeOfLocal(e),
						error: e instanceof Error ? e.message : String(e)
					})
				};
			}
		}
	});
	ctx.tools.register(defineTool({
		name: "dsh_jenkins_build",
		description: "根据配置的 Jenkins 服务器触发一个 Job 构建（可选参数），返回队列号/构建号与状态。Trigger a Jenkins job build with optional parameters (config-driven servers); returns queue/build info.",
		parameters: {
			server: {
				type: "string",
				required: true,
				description: "服务器名称（对应配置中的 name）/ Server name (as configured)"
			},
			job: {
				type: "string",
				required: true,
				description: "任务路径，如 build-app 或 folder/build-app / Job path, e.g. build-app or folder/build-app"
			},
			parameters: {
				type: "json",
				description: "可选参数键值对，如 {\"BRANCH\": \"main\"} / Optional key-value parameters"
			}
		},
		output: {
			schema: { type: "string" },
			render: (_args, value) => [{
				type: "text",
				text: String(value)
			}]
		},
		async execute(args) {
			await storeReady;
			const server = findServer(args.server);
			if (!server) {
				const names = readServers().map((s) => s.name).join("、");
				return "找不到服务器「" + args.server + "」。已配置：" + (names || "（无）") + " / Server \"" + args.server + "\" not found. Configured: " + (names || "(none)");
			}
			const result = await runOp(deps, {
				op: "trigger",
				serverId: server.id,
				segments: args.job.split("/").filter(Boolean),
				parameters: args.parameters || {}
			});
			if (!result.ok) return "触发失败：" + result.error + " / Trigger failed: " + result.error;
			return result.queueId ? `已触发构建：${args.job}（服务器 ${server.name}），队列 #${result.queueId}。可用 dsh_jenkins_status 查询状态。 / Build triggered: ${args.job} (server ${server.name}), queue #${result.queueId}. Use dsh_jenkins_status to check status.` : `已触发构建：${args.job}（服务器 ${server.name}），未获得队列编号。可用 dsh_jenkins_status 查询状态。 / Build triggered: ${args.job} (server ${server.name}), no queue number returned. Use dsh_jenkins_status to check status.`;
		}
	}));
	ctx.tools.register(defineTool({
		name: "dsh_jenkins_status",
		description: "查询 Jenkins Job 最近一次或指定编号构建的状态与结果。Query the latest (or a specific) build status/result of a Jenkins job.",
		parameters: {
			server: {
				type: "string",
				required: true,
				description: "服务器名称（对应配置中的 name）/ Server name (as configured)"
			},
			job: {
				type: "string",
				required: true,
				description: "任务路径，如 build-app 或 folder/build-app / Job path, e.g. build-app or folder/build-app"
			},
			buildNumber: {
				type: "number",
				description: "可选：构建编号，缺省查询最近一次构建 / Optional build number; defaults to the latest build"
			}
		},
		output: {
			schema: { type: "string" },
			render: (_args, value) => [{
				type: "text",
				text: String(value)
			}]
		},
		async execute(args) {
			await storeReady;
			const server = findServer(args.server);
			if (!server) {
				const names = readServers().map((s) => s.name).join("、");
				return "找不到服务器「" + args.server + "」。已配置：" + (names || "（无）") + " / Server \"" + args.server + "\" not found. Configured: " + (names || "(none)");
			}
			const result = await runOp(deps, {
				op: "buildStatus",
				serverId: server.id,
				segments: args.job.split("/").filter(Boolean),
				buildNumber: args.buildNumber
			});
			if (!result.ok) {
				if (result.notFound) return `任务 ${args.job} 尚未有构建记录 / Job ${args.job} has no build record yet`;
				return "查询失败：" + result.error + " / Query failed: " + result.error;
			}
			const dur = Math.round((Number(result.duration) || 0) / 1e3);
			return `任务 ${args.job} #${result.number}：${result.building ? "构建中" : `已完成，结果 ${result.result ?? "UNKNOWN"}`}（耗时 ${dur} 秒）\n${result.url || ""} / Job ${args.job} #${result.number}: ${result.building ? "building" : `done, result ${result.result ?? "UNKNOWN"}`} (elapsed ${dur}s)\n${result.url || ""}`;
		}
	}));
}
/** 命令 handler 内的本地化错误码（runOp 抛出的异常同样映射）。 */
function errCodeOfLocal(e) {
	const err = e;
	if (err && err.status === 401) return "auth-failed";
	if (err && err.status === 403) return "forbidden";
	if (err && err.status === 404) return "not-found";
	const msg = err && err.message || String(e);
	if (msg.indexOf("网络请求失败") !== -1) return "network-failed";
	if (msg.indexOf("无法解析任务路径") !== -1) return "job-path-invalid";
	if (msg.indexOf("缺少队列 ID") !== -1) return "queue-id-missing";
	if (msg.indexOf("缺少工作区路径") !== -1) return "cwd-missing";
	if (msg.indexOf("响应解析失败") !== -1) return "parse-failed";
}
//#endregion
export { Config, apply, inject, name };
