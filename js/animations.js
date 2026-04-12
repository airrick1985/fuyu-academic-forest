/* js/animations.js */
(() => {
    // 初始化 Scroll reveal animation（可重複調用，供 SPA 路由使用）
    window.initFadeInAnimations = function() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 清除舊的 visible 類（防止 SPA 導航後重複），然後監聽新元素
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => {
            el.classList.remove('visible');
            observer.observe(el);
        });

        console.log('[Animations] 已初始化 fade-in 動畫，共', fadeElements.length, '個元素');
    };

    // 頁面首次加載時執行
    window.initFadeInAnimations();
})();
