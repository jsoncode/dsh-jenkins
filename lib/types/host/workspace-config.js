/**
 * dsh-jenkins —— 工作区配置文件（dsh-jenkins.{json,js,ts}）解析。
 *
 * 数组形式，每个元素 = 一个发布目标（job + server + environments 参数）。
 * .json 直接解析；.js / .ts 用 node 子进程求值（.ts 需 tsx 加载器）。
 * 另提供按「文件内容」解析（parseConfigFromContent），供发布 tab「选择配置」
 * 从文件管理器任意选取的配置文件使用。
 */
import { psQuote } from "./jenkins.js";
/** 在工作区根目录查找配置文件（按 json → js → ts 顺序）。 */
async function findConfigFile(fsService, cwd) {
    const names = ['dsh-jenkins.json', 'dsh-jenkins.js', 'dsh-jenkins.ts'];
    for (const name of names) {
        try {
            const target = await fsService.resolve(name, { cwd });
            const info = await fsService.stat(target);
            if (info !== undefined)
                return { name, target };
        }
        catch { /* try next candidate */ }
    }
    return null;
}
/** 解析配置文件内容（json 直读；js/ts 经 node 子进程求值 default 导出）。 */
async function parseConfigFile(fsService, shell, found) {
    const { name, target } = found;
    if (name.endsWith('.json')) {
        const text = await fsService.readText(target);
        return JSON.parse(text);
    }
    // .js / .ts：用 node 子进程求值（ESM default 导出；.ts 需 tsx 加载器）。
    const abs = fsService.processPath(target);
    const script = "import('file:///'+process.argv[1].replace(/\\\\/g,'/')).then(m=>process.stdout.write(JSON.stringify(m.default??m))).catch(e=>{process.stderr.write(String((e&&e.message)||e));process.exit(1)})";
    const tsFlag = name.endsWith('.ts') ? '--import tsx/esm ' : '';
    const command = `node ${tsFlag}--input-type=module -e ${psQuote(script)} ${psQuote(abs)}`;
    const spec = shell.resolve({ command, timeoutMs: 20000, stdoutMaxBytes: 2 * 1024 * 1024 });
    const res = await shell.run(spec);
    if (res.exitCode !== 0 && res.exitCode !== null) {
        const detail = ((res.stderr && res.stderr.text) || '').trim().slice(0, 300);
        throw new Error('配置文件解析失败：' + (detail || `node 退出码 ${res.exitCode}`));
    }
    return JSON.parse((res.stdout && res.stdout.text) || '{}');
}
/** 校验并归一化配置（数组格式，每个元素 = { job, server, parameters }）。 */
export function normalizeConfig(raw) {
    // 新格式：数组，每个元素 = 一个发布目标（job + server + environments 参数表）。
    if (!Array.isArray(raw))
        throw new Error('配置文件需导出数组（每个元素一个发布目标：{ job, server, environments }）');
    if (raw.length === 0)
        throw new Error('配置文件数组不能为空');
    const entries = raw.map((e, i) => {
        if (!e || typeof e !== 'object' || Array.isArray(e)) {
            throw new Error('配置第 ' + (i + 1) + ' 项需为对象');
        }
        const record = e;
        const job = String(record.job || '').trim();
        if (!job)
            throw new Error('配置第 ' + (i + 1) + ' 项缺少 job（Jenkins 任务路径）');
        const server = String(record.server || '').trim();
        if (!server)
            throw new Error('配置第 ' + (i + 1) + ' 项缺少 server（服务器名称或地址）');
        const parameters = (record.environments && typeof record.environments === 'object' && !Array.isArray(record.environments))
            ? record.environments
            : {};
        return { job, server, parameters };
    });
    return { format: 'array', entries };
}
/** 加载工作区配置（不存在返回 null）。 */
export async function loadWorkspaceConfig(fsService, shell, cwd) {
    const found = await findConfigFile(fsService, cwd);
    if (found === null)
        return null;
    const raw = await parseConfigFile(fsService, shell, found);
    const config = normalizeConfig(raw);
    return { ...config, file: found.name };
}
/**
 * 按「文件内容」解析配置（发布 tab「选择配置」经文件管理器任意选文件时使用）。
 *
 * 内容已在浏览器侧读取，故不受宿主文件沙箱 / 工作区根限制：
 * - .json：直接 JSON.parse；
 * - .js / .cjs / .mjs / .ts：把内容写入系统临时目录下的独立文件，用 node 动态 import
 *   求值 default 导出（.ts 经 tsx 加载器），随后删除临时目录。
 *   .js 按内容判定模块体系：出现 ESM 语法（import/export）用 .mjs，否则按 CommonJS 用 .cjs
 *   （与内置模板约定一致）。仅适合自包含数组导出；含相对 / 包导入的高级配置会求值失败并回传错误。
 */
export async function parseConfigFromContent(shell, filename, content) {
    const name = String(filename || '').trim().toLowerCase();
    const text = String(content || '').replace(/^\uFEFF/, ''); // 去 UTF-8 BOM
    if (!(name.endsWith('.json') || name.endsWith('.js') || name.endsWith('.cjs') || name.endsWith('.mjs') || name.endsWith('.ts'))) {
        throw new Error('仅支持 dsh-jenkins 的 .json / .js / .ts 配置文件');
    }
    let raw;
    if (name.endsWith('.json')) {
        raw = JSON.parse(text);
    }
    else {
        let ext;
        if (name.endsWith('.ts'))
            ext = '.ts';
        else if (name.endsWith('.mjs'))
            ext = '.mjs';
        else if (name.endsWith('.cjs'))
            ext = '.cjs';
        else
            ext = /(^|\n)\s*(import|export)[\s{*]/.test(text) ? '.mjs' : '.cjs';
        const b64 = Buffer.from(text, 'utf8').toString('base64');
        const tsFlag = ext === '.ts' ? '--import tsx/esm ' : '';
        const script = "import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL as U} from 'node:url';" +
            "const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dshj-'));const file=path.join(dir,'config'+" + JSON.stringify(ext) + ");" +
            "fs.writeFileSync(file,Buffer.from(process.argv[1],'base64'));" +
            "import(U(file).href).then(m=>process.stdout.write(JSON.stringify(m.default??m)))" +
            ".catch(e=>{process.stderr.write(String((e&&e.message)||e));process.exit(1)})" +
            ".finally(()=>{try{fs.rmSync(dir,{recursive:true,force:true})}catch{}})";
        const command = `node ${tsFlag}--input-type=module -e ${psQuote(script)} ${psQuote(b64)}`;
        const spec = shell.resolve({ command, timeoutMs: 20000, stdoutMaxBytes: 2 * 1024 * 1024 });
        const res = await shell.run(spec);
        if (res.exitCode !== 0 && res.exitCode !== null) {
            const detail = ((res.stderr && res.stderr.text) || '').trim().slice(0, 300);
            throw new Error('配置文件解析失败：' + (detail || `node 退出码 ${res.exitCode}`));
        }
        raw = JSON.parse((res.stdout && res.stdout.text) || '{}');
    }
    const config = normalizeConfig(raw);
    return { ...config, file: filename };
}
