/* js/spa-router.js */
if (!window._spaRouterInitialized) {
    window._spaRouterInitialized = true;

    async function navigate(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();

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
            const scripts = Array.from(document.body.querySelectorAll('script'));
            for (const oldScript of scripts) {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));

                if (oldScript.src) {
                    // 外部腳本：等待載入完成後再繼續下一個
                    await new Promise((resolve, reject) => {
                        newScript.onload = resolve;
                        newScript.onerror = reject;
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                } else {
                    // 內聯腳本：直接替換執行
                    if (oldScript.innerHTML) {
                        newScript.innerHTML = oldScript.innerHTML;
                    }
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            }

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
