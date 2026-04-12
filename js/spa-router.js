/* js/spa-router.js */
if (!window._spaRouterInitialized) {
    window._spaRouterInitialized = true;

    // 更新導航欄 active 狀態（在 SPA 導航後調用）
    function updateNavigationActive() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const finalPath = currentPath === '' ? 'index.html' : currentPath.split('#')[0];

        const navItems = document.querySelectorAll('.nav-item');
        const submenuItems = document.querySelectorAll('.submenu-item');
        let matchFound = false;

        // 清除所有 active
        navItems.forEach(item => item.classList.remove('active'));

        // 檢查 submenu 項
        submenuItems.forEach(item => {
            const link = item.querySelector('a')?.getAttribute('href');
            if (link === finalPath) {
                item.closest('.nav-item')?.classList.add('active');
                matchFound = true;
            }
        });

        // 檢查主導航項
        if (!matchFound) {
            navItems.forEach(item => {
                const linkEl = item.querySelector('.nav-link');
                if (linkEl) {
                    const href = linkEl.getAttribute('href');
                    if (href === finalPath && href !== '#') {
                        item.classList.add('active');
                    }
                }
            });
        }
    }

    window.spaNavigate = navigate;

    async function navigate(url) {
        // 取得加載覆蓋層（整個函數中重用）
        const loadingOverlay = document.getElementById('pwa-loading-overlay');

        try {
            // 顯示加載覆蓋層
            if (loadingOverlay) {
                loadingOverlay.classList.remove('hidden');
                console.log('[SPA Router] 顯示加載覆蓋層');
            }

            const response = await fetch(url);
            // 強制使用 UTF-8 解碼，避免繁體中文因編碼判斷錯誤而變成亂碼
            const buffer = await response.arrayBuffer();
            const html = new TextDecoder('utf-8').decode(buffer);

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Update title
            document.title = doc.title;

            // Merge Stylesheets
            const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
            const newLinks = doc.querySelectorAll('link[rel="stylesheet"]');

            newLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!existingLinks.includes(href)) {
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.href = href;
                    document.head.appendChild(newLink);
                }
            });

            // 保留 topbar（全局頂部導航）不讓它被替換
            const topbarRoot = document.getElementById('topbar-root');
            const topbarBackup = topbarRoot ? topbarRoot.cloneNode(true) : null;

            // Update body class and content
            document.body.className = doc.body.className;
            document.body.innerHTML = doc.body.innerHTML;

            // 恢復 topbar 到新頁面（確保常駐在頂部）
            if (topbarBackup) {
                const newTopbarRoot = document.getElementById('topbar-root');
                if (newTopbarRoot) {
                    // 用備份替換新的 topbar-root，保持 topbar 內容和全局狀態
                    newTopbarRoot.replaceWith(topbarBackup);
                } else {
                    // 新頁面沒有 topbar-root 時，在 body 開頭插入
                    document.body.insertBefore(topbarBackup, document.body.firstChild);
                }
            }

            // 更新導航欄高亮狀態（適應新頁面）
            updateNavigationActive();
            if (window._topbarScrollHandler) {
                window._topbarScrollHandler();
            }

            // 重新初始化動畫（如果頁面使用了 fade-in 動畫）
            // 延遲執行以確保 CSS 樣式表已加載完成
            if (window.initFadeInAnimations) {
                setTimeout(() => {
                    window.initFadeInAnimations();
                }, 50);
            }

            // 重新初始化 Google Maps（如果頁面是 google-map.html）
            if (window.initializeGoogleMap && url.includes('google-map')) {
                // 等待 DOM 完全更新後再初始化
                setTimeout(() => {
                    window.initializeGoogleMap();
                }, 100);
            }

            // 重新獲取加載覆蓋層（因為 innerHTML 替換後元素已更新）
            const newLoadingOverlay = document.getElementById('pwa-loading-overlay');

            // Re-evaluate scripts sequentially (external scripts must load before inline scripts run)
            // 追蹤已加載的外部腳本，避免重複加載
            const loadedScripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);

            const scripts = Array.from(document.body.querySelectorAll('script'));
            for (const oldScript of scripts) {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));

                if (oldScript.src) {
                    // 跳過已加載的外部腳本（如 Google Maps API, topbar.js）
                    const scriptSrc = oldScript.src.split('?')[0]; // 移除查詢字串
                    const isAlreadyLoaded = loadedScripts.some(src => src.split('?')[0] === scriptSrc);

                    if (isAlreadyLoaded) {
                        console.log(`[SPA Router] 跳過已加載的腳本: ${oldScript.src}`);
                        oldScript.parentNode.removeChild(oldScript);
                    } else {
                        // 外部腳本：等待載入完成後再繼續下一個
                        await new Promise((resolve, reject) => {
                            newScript.onload = resolve;
                            newScript.onerror = reject;
                            oldScript.parentNode.replaceChild(newScript, oldScript);
                        });
                    }
                } else {
                    // 內聯腳本：直接替換執行
                    if (oldScript.innerHTML) {
                        newScript.innerHTML = oldScript.innerHTML;
                    }
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            }

            // 清除可能殘留的滾動鎖定 (例如從 pano-page 或 lightbox 離開)
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            window.scrollTo(0, 0);

            // 隱藏加載覆蓋層（使用更新後的引用）
            if (newLoadingOverlay) {
                newLoadingOverlay.classList.add('hidden');
                console.log('[SPA Router] 隱藏加載覆蓋層');
            }
        } catch (err) {
            console.error('SPA Navigation failed:', err);

            // 隱藏加載覆蓋層（失敗時也要隱藏）
            const errorOverlay = document.getElementById('pwa-loading-overlay');
            if (errorOverlay) {
                errorOverlay.classList.add('hidden');
            }

            // Fallback to normal navigation if fetch fails
            window.location.href = url;
        }
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (
            a &&
            a.href &&
            a.origin === location.origin &&
            a.target !== '_blank' &&
            !a.getAttribute('href').startsWith('#')
        ) {
            e.preventDefault();
            // 從完整 URL 中提取路徑（移除基礎路徑前綴）
            const url = new URL(a.href);
            let pathname = url.pathname;

            // 處理 GitHub Pages 子路徑（移除 /fuyu-academic-forest 前綴）
            if (pathname.includes('/fuyu-academic-forest/')) {
                pathname = pathname.replace('/fuyu-academic-forest/', '');
            } else if (pathname.startsWith('/')) {
                pathname = pathname.substring(1);
            }

            history.pushState(null, '', pathname);
            navigate(a.href);
        }
    });

    window.addEventListener('popstate', () => {
        navigate(location.href);
    });
}
