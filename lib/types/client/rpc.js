/**
 * dsh-jenkins —— 浏览器半边：与宿主通信（commands.execute → JSON 文本 → 结果载荷）。
 */
import { t } from "./i18n.js";
export function makeRun(ctx) {
    return async function run(sessionId, op) {
        try {
            const execution = await ctx.remote.commands.execute(sessionId || '', '/dsh-jenkins ' + JSON.stringify(op));
            const value = execution && execution.ok === true
                ? execution.value
                : undefined;
            const text = value && value.result
                && typeof value.result.text === 'string'
                ? value.result.text
                : null;
            if (text === null || text.length === 0)
                return { ok: false, error: t('cmdNoResult') };
            try {
                return JSON.parse(text);
            }
            catch {
                return { ok: false, error: text.slice(0, 200) };
            }
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    };
}
