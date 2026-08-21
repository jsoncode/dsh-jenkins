import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 统一弹框「入口配置」tab：侧边栏底部入口（footer 按钮）的设置。
 */
import { useEffect } from 'react';
import { t } from "../i18n.js";
export function EntryConfigTab({ run, sessionId, footerOrderStore }) {
    const footerOrder = footerOrderStore.useValue();
    // 打开 tab 时同步宿主持久化值；切换即时生效并写回宿主。
    useEffect(() => {
        run(sessionId, { op: 'footerOrderGet' }).then((r) => {
            const v = r && r.ok ? r.footerOrder : undefined;
            if (v === 'front' || v === 'back')
                footerOrderStore.store.set(v);
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const changeFooterOrder = (v) => {
        footerOrderStore.store.set(v);
        run(sessionId, { op: 'footerOrderSet', footerOrder: v }).catch(() => { });
    };
    return (_jsx("div", { className: "dshj-settings", children: _jsxs("div", { className: "dshj-card", children: [_jsxs("div", { className: "dshj-card-main", children: [_jsx("div", { className: "dshj-card-name", children: t('footerOrder') }), _jsx("div", { className: "dshj-card-meta", children: t('footerOrderHint') })] }), _jsxs("div", { className: "dshj-card-ops", children: [_jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small' + (footerOrder === 'front' ? ' dshj-btn-active' : ''), onClick: () => changeFooterOrder('front'), children: t('footerOrderFront') }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small' + (footerOrder === 'back' ? ' dshj-btn-active' : ''), onClick: () => changeFooterOrder('back'), children: t('footerOrderBack') })] })] }) }));
}
