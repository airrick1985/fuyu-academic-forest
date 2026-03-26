/* js/topbar.js */
(() => {
  // 統一維護的全域 Topbar HTML 模板
  const topbarHTML = `
    <header class="topbar">
        <div class="topbar-logo">
            <a href="index.html">
                <img src="assets/images/xuesen_logo.png" alt="富宇學森" class="topbar-logo-img">
            </a>
        </div>
        <nav class="topbar-nav">
            <div class="nav-item">
                <a href="brand-fuyu.html" class="nav-link">品牌介紹</a>
                <div class="submenu">
                    <div class="submenu-item"><a href="brand-fuyu.html">富宇機構</a></div>
                    <div class="submenu-item"><a href="brand-team.html">建築團隊</a></div>
                </div>
            </div>
            <div class="nav-item">
                <a href="panorama.html" class="nav-link">地段環境</a>
                <div class="submenu">
                    <div class="submenu-item"><a href="panorama.html">全景</a></div>
                    <div class="submenu-item"><a href="location.html">360°環景</a></div>
                </div>
            </div>
            <div class="nav-item">
                <a href="exterior-3d.html" class="nav-link">建築規劃</a>
                <div class="submenu">
                    <div class="submenu-item"><a href="exterior-3d.html">外觀3D</a></div>
                    <div class="submenu-item"><a href="public-3d.html">公設3D</a></div>
                    <div class="submenu-item"><a href="floor-plan.html">平面規劃</a></div>
                </div>
            </div>
            <div class="nav-item">
                <a href="coming-soon.html?page=materials" class="nav-link">建材設備</a>
            </div>
            <div class="nav-item">
                <a href="coming-soon.html?page=construction" class="nav-link">工法介紹</a>
            </div>
        </nav>
        <div class="topbar-actions">
            <!-- BGM 按鈕與音量控制 -->
            <div class="bgm-control">
                <button class="bgm-btn" title="音樂開關">
                    <svg class="icon-sound-on" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    <svg class="icon-sound-off" style="display: none;" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                </button>
                <div class="bgm-volume-slider">
                    <input type="range" class="volume-range" min="0" max="1" step="0.05" value="0.5" title="音量">
                </div>
            </div>
            <button class="fullscreen-btn" title="切換全螢幕">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
            <button class="refresh-btn" onclick="location.reload()" title="重新整理">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
            </button>
        </div>
    </header>
    `;

  // 全螢幕切換用的圖示
  const enterIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
  const exitIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;

  // 尋找 HTML 頁面中的佔位元素並替換
  const topbarRoot = document.getElementById('topbar-root');
  if (topbarRoot) {
    topbarRoot.innerHTML = topbarHTML;
  }

  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  // ===== 全螢幕按鈕邏輯 =====
  const fullscreenBtn = topbar.querySelector('.fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });

    // 監聽全螢幕狀態改變（例如按 Esc 鍵退出）
    if (!window._fullscreenChangeHandler) {
      window._fullscreenChangeHandler = () => {
        const btn = document.querySelector('.fullscreen-btn');
        if (btn) {
          btn.innerHTML = document.fullscreenElement ? exitIcon : enterIcon;
        }
      };
      document.addEventListener('fullscreenchange', window._fullscreenChangeHandler);
    }
  }

  // ===== 滾動偵測：背景樣式 =====
  if (!window._topbarScrollHandler) {
    window._topbarScrollHandler = () => {
      const currentTopbar = document.querySelector('.topbar');
      if (currentTopbar) {
        // 非首頁（環景、全景、品牌、即將推出等）預設維持 scrolled 背景色
        const isNonHomePage = document.body.classList.contains('pano-page') ||
          document.body.classList.contains('brand-page') ||
          document.querySelector('.coming-soon-page');
        if (window.scrollY > 50 || isNonHomePage) {
          currentTopbar.classList.add('scrolled');
        } else {
          currentTopbar.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', window._topbarScrollHandler);
  }
  // 初始執行一次檢查
  window._topbarScrollHandler();

  // ===== 全域 BGM 邏輯 =====
  if (!window._globalBGM) {
    window._globalBGM = new Audio('assets/sound/BGM.mp3');
    window._globalBGM.loop = true;
    window._globalBGM.volume = 0.5; // 預設音量 50%

    // 嘗試自動播放
    const playPromise = window._globalBGM.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 瀏覽器阻擋自動播放，等待使用者第一次互動
        const playOnInteraction = () => {
          if (window._globalBGM.paused) {
            window._globalBGM.play().catch(e => console.warn('BGM play failed:', e));
          }
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('keydown', playOnInteraction, { once: true });
      });
    }

    // 替 Audio 註冊全域事件，這樣 SPA 切換頁面後，新的 topbar 按鈕圖示也會自動同步
    window._globalBGM.addEventListener('play', () => {
      const btn = document.querySelector('.bgm-btn');
      if (btn && window._globalBGM.volume > 0) {
        btn.querySelector('.icon-sound-on').style.display = 'block';
        btn.querySelector('.icon-sound-off').style.display = 'none';
      }
    });
    window._globalBGM.addEventListener('pause', () => {
      const btn = document.querySelector('.bgm-btn');
      if (btn) {
        btn.querySelector('.icon-sound-on').style.display = 'none';
        btn.querySelector('.icon-sound-off').style.display = 'block';
      }
    });
    window._globalBGM.addEventListener('volumechange', () => {
      const btn = document.querySelector('.bgm-btn');
      if (btn) {
        if (window._globalBGM.volume === 0 || window._globalBGM.paused) {
          btn.querySelector('.icon-sound-on').style.display = 'none';
          btn.querySelector('.icon-sound-off').style.display = 'block';
        } else {
          btn.querySelector('.icon-sound-on').style.display = 'block';
          btn.querySelector('.icon-sound-off').style.display = 'none';
        }
      }
      const range = document.querySelector('.volume-range');
      if (range && parseFloat(range.value) !== window._globalBGM.volume) {
        range.value = window._globalBGM.volume;
      }
    });
  }

  // 綁定當前頁面的 BGM 按鈕與音量條事件
  const bgmBtn = document.querySelector('.bgm-btn');
  const volumeRange = document.querySelector('.volume-range');

  if (bgmBtn) {
    // 設定初始圖示狀態
    if (window._globalBGM.paused || window._globalBGM.volume === 0) {
      bgmBtn.querySelector('.icon-sound-on').style.display = 'none';
      bgmBtn.querySelector('.icon-sound-off').style.display = 'block';
    }

    bgmBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 避免觸發解除靜音的 global handler
      if (window._globalBGM.paused) {
        // 如果音量是 0 的時候按播放，自動給一半音量才有聲音
        if (window._globalBGM.volume === 0) window._globalBGM.volume = 0.5;
        window._globalBGM.play();
      } else {
        window._globalBGM.pause();
      }
    });
  }

  if (volumeRange) {
    volumeRange.value = window._globalBGM.volume;

    // 拖動滑桿時不觸發父層任何事件
    volumeRange.addEventListener('pointerdown', e => e.stopPropagation());

    volumeRange.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      window._globalBGM.volume = vol;

      if (vol > 0 && window._globalBGM.paused) {
        // 拉動音量時，若原本暫停就自動開始播
        window._globalBGM.play().catch(e => console.warn('Auto play on volume change blocked', e));
      }
    });
  }

  // ===== 導覽列 Active 高亮 =====
  let currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPath === '') currentPath = 'index.html';
  currentPath = currentPath.split('#')[0];

  const queryParams = new URLSearchParams(window.location.search);
  const pageParam = queryParams.get('page');

  const navItems = document.querySelectorAll('.nav-item');
  const submenuItems = document.querySelectorAll('.submenu-item');

  let matchFound = false;

  // 先清除所有 active (防呆 SPA 殘留)
  navItems.forEach(item => item.classList.remove('active'));

  // Check submenus first
  submenuItems.forEach(item => {
    const link = item.querySelector('a').getAttribute('href');
    if (link === currentPath) {
      item.closest('.nav-item').classList.add('active');
      matchFound = true;
    }
  });

  if (!matchFound) {
    navItems.forEach(item => {
      const linkEl = item.querySelector('.nav-link');
      if (linkEl) {
        let href = linkEl.getAttribute('href');
        if (currentPath.includes('coming-soon.html') && pageParam) {
          if (href.includes('page=' + pageParam)) {
            item.classList.add('active');
          }
        } else if (href === currentPath && href !== '#') {
          item.classList.add('active');
        }
      }
    });
  }

  // ===== 全域閒置自動返回首頁邏輯 =====
  if (!window._idleTimerInitialized) {
    window._idleTimerInitialized = true;

    let idleTimeout;
    const IDLE_LIMIT = 20 * 60 * 1000; // 靜止超過 20 分鐘後自動返回首頁

    function resetIdleTimer() {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(onIdleTimeout, IDLE_LIMIT);
    }

    function onIdleTimeout() {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const isHomePage = (currentPath === '' || currentPath === 'index.html');
      const hasPageQuery = window.location.search.includes('page=');

      // 1. 嘗試自動進入全螢幕
      // 注意：一般瀏覽器基於安全性會阻擋非使用者互動觸發的全螢幕。
      // 若此建案導覽系統在 Windows 上以 Chrome 執行，請考慮加上啟動參數 --kiosk (例如: chrome.exe --kiosk "http://localhost:5173")
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('自動全螢幕被瀏覽器阻擋 (缺少即時的使用者互動):', err);
        });
      }

      // 2. 若不在純首頁，就跳轉回首頁
      if (!isHomePage || hasPageQuery) {
        if (typeof window.spaNavigate === 'function') {
          // 使用 SPA 無縫跳轉，完全不會打斷已綁定的全螢幕狀態
          history.pushState(null, '', 'index.html');
          window.spaNavigate('index.html');
        } else {
          // Fallback
          window.location.href = 'index.html';
        }
      }
    }

    // 綁定所有可能的使用者互動事件以延後閒置時間
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(evt => {
      document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // 開始第一次讀秒
    resetIdleTimer();
  }

  // ===== ANXI 安熙智慧設計 專屬廣告 (彩蛋與水印) =====
  if (!window._anxiAdLoaded) {
    window._anxiAdLoaded = true;

    // 1. Console 開發者浪漫
    console.log(
      '%c ANXI 安熙智慧設計 %c \n電子表版與科技行銷整合專家\n官方網站: https://anxismart.com \n歡迎優秀的建案合作！',
      'background: #111; color: #f5c518; font-size: 20px; padding: 5px 10px; border-radius: 4px;',
      'color: #666; font-size: 14px; line-height: 2;'
    );

    // 2. 畫面右下角隱形水印 (Hover展開)
    const watermarkHTML = `
          <div id="anxi-watermark" style="
              position: fixed; bottom: 0; right: 0;
              padding: 10px 15px; font-size: 11px; font-family: sans-serif;
              color: rgba(255, 255, 255, 0.05); text-align: right;
              z-index: 999999; cursor: default; pointer-events: auto;
              transition: all 0.5s ease;
          ">
              <div style="font-weight: 500; letter-spacing: 1px;">
                  <span style="opacity: 0.3;">v1.0</span> <span class="anxi-brand-text">ANXI</span>
              </div>
              <div class="anxi-brand-full" style="
                  max-height: 0; overflow: hidden; opacity: 0;
                  margin-top: 0px; transition: all 0.5s ease;
              ">
                  <div style="margin-top: 6px; color: #ddd;">電子表版由 <span style="color: #dbae32; font-weight: bold;">ANXI安熙智慧設計</span></div>
                  <div style="margin-top: 4px; color: #aaa; letter-spacing: 1.5px;">anxismart.com/#/</div>
              </div>
          </div>
      `;
    document.body.insertAdjacentHTML('beforeend', watermarkHTML);

    // 互動邏輯 (Hover超時才展開，避免誤觸)
    const mark = document.getElementById('anxi-watermark');
    const fullDetails = mark.querySelector('.anxi-brand-full');
    let hoverTimer = null;

    mark.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => {
        mark.style.backgroundColor = 'rgba(10, 10, 10, 0.85)';
        mark.style.backdropFilter = 'blur(5px)';
        mark.style.borderTopLeftRadius = '12px';
        mark.style.color = '#fff';
        mark.style.boxShadow = '0 -5px 20px rgba(0,0,0,0.3)';
        fullDetails.style.maxHeight = '50px';
        fullDetails.style.opacity = '1';
        mark.querySelector('span:first-child').style.display = 'none'; // 隱藏 v1.0
      }, 800); // 800毫秒
    });

    mark.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      mark.style.backgroundColor = 'transparent';
      mark.style.backdropFilter = 'none';
      mark.style.boxShadow = 'none';
      mark.style.color = 'rgba(255, 255, 255, 0.05)';
      fullDetails.style.maxHeight = '0';
      fullDetails.style.opacity = '0';
      setTimeout(() => {
        mark.querySelector('span:first-child').style.display = 'inline';
      }, 500);
    });
  }
})();
