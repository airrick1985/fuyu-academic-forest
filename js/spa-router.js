/* js/spa-router.js */
if (!window._spaRouterInitialized) {
    window._spaRouterInitialized = true;

    window.spaNavigate = navigate;

    async function navigate(url) {
        try {
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

            // Update body class and content
            document.body.className = doc.body.className;
            document.body.innerHTML = doc.body.innerHTML;

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
        } catch (err) {
            console.error('SPA Navigation failed:', err);
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
            history.pushState(null, '', a.href);
            navigate(a.href);
        }
    });

    window.addEventListener('popstate', () => {
        navigate(location.href);
    });
}
