/**
 * Debug 面板通用行為：標題列拖曳移動 + 收合/展開 (位置與收合狀態記憶於 localStorage)
 *
 * 用法 (於各頁面 inline script 中呼叫，SPA 導航時 inline script 會重跑，本檔僅載入一次)：
 *   window.initDebugPanel(document.getElementById('fpHotspotDebugPanel'), { storageKey: 'fpHotspotDebugPanel' });
 */
(() => {
    'use strict';

    const STYLE_ID = 'dbg-panel-style';
    const EDGE_KEEP = 48; // 拖出視窗時至少保留可見的像素

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .dbg-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin: 0 0 12px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                cursor: grab;
                touch-action: none;
                user-select: none;
                -webkit-user-select: none;
            }
            .dbg-panel-header:active { cursor: grabbing; }
            .dbg-panel-header h3 {
                flex: 1;
                margin: 0 !important;
                padding-bottom: 0 !important;
                border-bottom: none !important;
            }
            .dbg-panel-toggle {
                flex: 0 0 auto;
                width: 26px;
                height: 26px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 6px;
                color: #f0f0f0;
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .dbg-panel-toggle:hover { background: rgba(255, 255, 255, 0.22); }
            .dbg-panel-body { display: block; }
            .dbg-panel-collapsed .dbg-panel-body { display: none; }
            .dbg-panel-collapsed .dbg-panel-header {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }
            .dbg-panel-dragging { transition: none !important; }
        `;
        document.head.appendChild(style);
    }

    function loadState(key) {
        if (!key) return null;
        try {
            return JSON.parse(localStorage.getItem('dbgPanel:' + key) || 'null');
        } catch (e) {
            return null;
        }
    }

    function saveState(key, state) {
        if (!key) return;
        try {
            localStorage.setItem('dbgPanel:' + key, JSON.stringify(state));
        } catch (e) {
            /* 忽略 (私密模式 / 配額不足) */
        }
    }

    function initDebugPanel(panel, options) {
        if (!panel || panel.dataset.dbgReady === '1') return;
        panel.dataset.dbgReady = '1';
        injectStyle();

        const opts = options || {};
        const storageKey = opts.storageKey || panel.id || '';
        const state = loadState(storageKey) || {};

        // --- 組出 header (標題 + 收合鈕) 與 body (其餘內容) ---
        const title = panel.querySelector('h3');
        const header = document.createElement('div');
        header.className = 'dbg-panel-header';
        const body = document.createElement('div');
        body.className = 'dbg-panel-body';

        const children = Array.from(panel.childNodes);
        panel.appendChild(header);
        panel.appendChild(body);
        children.forEach(node => {
            (node === title ? header : body).appendChild(node);
        });
        if (!title) {
            const fallback = document.createElement('h3');
            fallback.textContent = opts.title || 'Debug';
            header.insertBefore(fallback, header.firstChild);
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'dbg-panel-toggle';
        header.appendChild(toggleBtn);

        function setCollapsed(collapsed) {
            panel.classList.toggle('dbg-panel-collapsed', collapsed);
            toggleBtn.textContent = collapsed ? '▢' : '—';
            toggleBtn.title = collapsed ? '展開面板' : '收合面板';
            state.collapsed = collapsed;
            saveState(storageKey, state);
        }

        setCollapsed(!!state.collapsed);

        toggleBtn.addEventListener('pointerdown', e => e.stopPropagation());
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setCollapsed(!panel.classList.contains('dbg-panel-collapsed'));
        });
        header.addEventListener('dblclick', () => {
            setCollapsed(!panel.classList.contains('dbg-panel-collapsed'));
        });

        // --- 位置：拖曳移動 ---
        function applyPosition(left, top, persist) {
            panel.style.left = left + 'px';
            panel.style.top = top + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            state.left = left;
            state.top = top;
            if (persist) saveState(storageKey, state);
        }

        function clamp() {
            if (typeof state.left !== 'number' || typeof state.top !== 'number') return;
            const w = panel.offsetWidth;
            const h = panel.offsetHeight;
            if (!w || !h) return; // 面板隱藏中，等顯示後再校正
            const maxLeft = Math.max(0, window.innerWidth - EDGE_KEEP);
            const maxTop = Math.max(0, window.innerHeight - EDGE_KEEP);
            const left = Math.min(Math.max(state.left, EDGE_KEEP - w), maxLeft);
            const top = Math.min(Math.max(state.top, 0), maxTop);
            applyPosition(left, top, false);
        }

        if (typeof state.left === 'number' && typeof state.top === 'number') {
            applyPosition(state.left, state.top, false);
            clamp();
        }

        let dragging = false;
        let grabX = 0;
        let grabY = 0;

        header.addEventListener('pointerdown', (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            const rect = panel.getBoundingClientRect();
            dragging = true;
            grabX = e.clientX - rect.left;
            grabY = e.clientY - rect.top;
            panel.classList.add('dbg-panel-dragging');
            header.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        header.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const w = panel.offsetWidth;
            const maxLeft = Math.max(0, window.innerWidth - EDGE_KEEP);
            const maxTop = Math.max(0, window.innerHeight - EDGE_KEEP);
            const left = Math.min(Math.max(e.clientX - grabX, EDGE_KEEP - w), maxLeft);
            const top = Math.min(Math.max(e.clientY - grabY, 0), maxTop);
            applyPosition(left, top, false);
        });

        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            panel.classList.remove('dbg-panel-dragging');
            if (e && e.pointerId !== undefined && header.hasPointerCapture(e.pointerId)) {
                header.releasePointerCapture(e.pointerId);
            }
            saveState(storageKey, state);
        }

        header.addEventListener('pointerup', endDrag);
        header.addEventListener('pointercancel', endDrag);

        window.addEventListener('resize', clamp);

        // 面板由隱藏轉為顯示時 (class 變動) 重新校正位置
        new MutationObserver(() => {
            if (!dragging && panel.offsetWidth) clamp();
        }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    }

    window.initDebugPanel = initDebugPanel;
})();
