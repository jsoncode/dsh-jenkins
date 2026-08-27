/**
 * dsh-jenkins —— 宿主半边：执行插件更新命令（后台进程 + 输出缓冲）。
 *
 * 浏览器半边点击「更新」胶囊 → 确认弹框 → 大日志弹框：本模块以子进程后台
 * 执行 `dsh plugin --profile web update dsh-jenkins`，stdout/stderr 实时
 * 追加进环形缓冲；客户端轮询 pluginUpdateStatus op 拉取累计输出与运行状态
 * （done / exitCode）。同一时刻只允许一个更新进程；进程内缓冲有上限防膨胀。
 * 更新进程结束（done）后客户端会再查一次 updateCheck；update.ts 为实时读取
 * （无缓存），因此新版本号立即生效（客户端据此隐藏「更新」胶囊）。
 */
import { spawn } from 'node:child_process';
/** 被更新的插件包名（dsh plugin --profile web update <包名>）。 */
const PLUGIN_NAME = 'dsh-jenkins';
/** 输出缓冲上限（超过则截掉最旧内容，只留尾部）。 */
const MAX_OUTPUT = 512 * 1024;
let run = null;
function appendOutput(rec, text) {
    rec.output = (rec.output + text).slice(-MAX_OUTPUT);
}
/**
 * 启动更新进程。已在运行则返回 alreadyRunning=true（不重复启动）；
 * 上次已结束则丢弃旧记录重新开始。
 */
export function startPluginUpdate() {
    if (run !== null && run.running)
        return { ok: true, alreadyRunning: true };
    run = null;
    let child;
    try {
        // Windows 下 dsh 是 .cmd 脚本，需经 shell 解析 PATH（含 pnpm 全局 bin）；
        // 非 Windows 直接 spawn，命令缺失会触发 'error' 事件写入日志。
        child = spawn('dsh', ['plugin', '--profile', 'web', 'update', PLUGIN_NAME], {
            shell: process.platform === 'win32',
            windowsHide: true,
        });
    }
    catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    const rec = { child, output: '', running: true, exitCode: null, error: '' };
    run = rec;
    child.stdout.on('data', (d) => appendOutput(rec, d.toString()));
    child.stderr.on('data', (d) => appendOutput(rec, d.toString()));
    child.on('error', (err) => {
        appendOutput(rec, `\n[spawn error] ${err.message}\n`);
        rec.error = err.message;
        rec.exitCode = -1;
        rec.running = false;
    });
    child.on('close', (code) => {
        appendOutput(rec, `\n[exit code ${code ?? 'null'}]\n`);
        rec.exitCode = code;
        rec.running = false;
    });
    return { ok: true };
}
/** 轮询用：当前更新进程（或最近一次已结束进程）的状态与累计输出。 */
export function getPluginUpdateStatus() {
    if (run === null)
        return { running: false, done: false, output: '', exitCode: null, error: '' };
    return {
        running: run.running,
        done: !run.running,
        output: run.output,
        exitCode: run.exitCode,
        error: run.error,
    };
}
