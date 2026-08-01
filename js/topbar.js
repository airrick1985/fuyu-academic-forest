/* js/topbar.js */
(() => {
  // ===== 建案基本資料（全站唯一資料來源）=====
  // 頂部導覽列「基本資料」燈箱 + floor-plan.html 的燈箱／列印基本資料卡皆引用此處，維護統一。
  window.FY_BASIC_INFO = [
    { label: '投資興建', value: '富宇建設股份有限公司' },
    { label: '代銷公司', value: '一研九鼎廣告策劃有限公司' },
    { label: '基地位置', value: '新竹市東區長春街' },
    { label: '地號',     value: '新竹市長春段650-4地號等8筆' },
    { label: '建照號碼', value: '新竹市(114)府都建字第00082號' },
    { label: '基地面積', value: '約573坪　地上14F/B3' },
    { label: '規劃戶數', value: '住家 89戶' },
    { label: '停車位',   value: '汽車位 91個　機車位 110個' },
    { label: '公設比',   value: '34.8%' },
    { label: '樓高',     value: '住家 3.2米　一樓大廳挑高 7.4米' },
    { label: '電梯',     value: '15人份　速率 120 公尺/分鐘' },
    { label: '車位售價', value: 'B1-325　B2-300　B3-275' },
    { label: '管理費',   value: '住家 90/坪　車位 300/個' },
    { label: '學區',     value: '關埔國小、光武國中、竹科實中、康橋國際學校(規劃中)' },
    { label: '開工日',   value: '2026年5月' },
    { label: '交屋日',   value: '2034年第三季' }
  ];

  // 統一維護的全域 Topbar HTML 模板
  const topbarHTML = `
    <header class="topbar">
        <div class="topbar-logo">
            <a href="index.html">
                <img src="assets/images/xuesen_logo.webp" alt="富宇學森" class="topbar-logo-img">
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
                <a href="#basic-info" class="nav-link tb-basicinfo-link">基本資料</a>
            </div>
            <div class="nav-item">
                <a href="panorama.html" class="nav-link">地段環境</a>
                <div class="submenu">
                    <div class="submenu-item"><a href="panorama.html">全景</a></div>
                    <div class="submenu-item"><a href="location.html">360°環景</a></div>
                    <div class="submenu-item"><a href="google-map.html">Google地圖</a></div>
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
                <a href="materials.html" class="nav-link">建材設備</a>
            </div>
            <div class="nav-item">
                <a href="construction.html" class="nav-link">工法介紹</a>
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
      // 在 Electron 環境中使用 IPC，否則使用瀏覽器 API
      if (window.electron && window.electron.toggleFullscreen) {
        window.electron.toggleFullscreen();
      } else {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    });

    // 監聽全螢幕狀態改變
    if (!window._fullscreenChangeHandler) {
      window._fullscreenChangeHandler = () => {
        const btn = document.querySelector('.fullscreen-btn');
        if (btn) {
          btn.innerHTML = document.fullscreenElement ? exitIcon : enterIcon;
        }
      };
      document.addEventListener('fullscreenchange', window._fullscreenChangeHandler);
    }

    // 在 Electron 環境中監聽 IPC 全屏狀態改變
    if (window.electron && window.electron.onFullscreenChange) {
      window.electron.onFullscreenChange((isFullscreen) => {
        const btn = document.querySelector('.fullscreen-btn');
        if (btn) {
          btn.innerHTML = isFullscreen ? exitIcon : enterIcon;
        }
      });
    }
  }

  // ===== 全域快捷鍵（ESC 退出全螢幕，Ctrl+Q 關閉應用）=====
  if (!window._globalKeyboardHandler) {
    window._globalKeyboardHandler = (e) => {
      // ESC 鍵：退出全螢幕
      if (e.key === 'Escape') {
        e.preventDefault();
        // 在 Electron 環境中使用 IPC，否則使用瀏覽器 API
        if (window.electron && window.electron.exitFullscreen) {
          window.electron.exitFullscreen();
        } else if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen();
        }
      }

      // Ctrl+Q 或 Cmd+Q：關閉應用
      if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        if (window.electron && window.electron.closeApp) {
          window.electron.closeApp();
        } else if (typeof window !== 'undefined' && window.close) {
          window.close();
        }
      }
    };
    document.addEventListener('keydown', window._globalKeyboardHandler);
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
    window._globalBGM.volume = 0.2; // 預設音量 20%

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

  // ===== 全站「基本資料」燈箱（導覽列直達；資料同 window.FY_BASIC_INFO）=====
  (function initBasicInfoModal() {
    // 樣式只注入一次（設計沿用 floor-plan 基本資料卡：米白卡 + 金棕標題 + label/值分欄）
    if (!document.getElementById('tb-basicinfo-style')) {
      const style = document.createElement('style');
      style.id = 'tb-basicinfo-style';
      style.textContent = `
        .tb-basicinfo-modal{position:fixed;inset:0;z-index:1000000;display:flex;align-items:center;justify-content:center;padding:40px;background:rgba(28,24,18,.5);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s ease;pointer-events:none;}
        .tb-basicinfo-modal.open{opacity:1;visibility:visible;pointer-events:auto;}
        .tb-basicinfo-dialog{position:relative;display:flex;flex-direction:column;width:min(680px,94vw);max-height:86vh;background:#fdfbf5;border:1px solid rgba(180,165,130,.5);border-radius:22px;box-shadow:0 30px 90px rgba(28,22,12,.5);overflow:hidden;transform:translateY(18px) scale(.94);opacity:0;transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .4s ease;}
        .tb-basicinfo-modal.open .tb-basicinfo-dialog{transform:translateY(0) scale(1);opacity:1;}
        .tb-basicinfo-close{position:absolute;top:16px;right:16px;z-index:3;width:40px;height:40px;border-radius:50%;border:1px solid rgba(180,165,130,.5);background:rgba(255,255,255,.7);color:#8b6914;font-size:19px;line-height:1;cursor:pointer;transition:background .25s ease,color .25s ease,transform .35s ease;}
        .tb-basicinfo-close:hover{background:#8b6914;color:#fff;transform:rotate(90deg);}
        .tb-basicinfo-dialog .bi-head{flex:0 0 auto;padding:38px 44px 24px;text-align:center;background:linear-gradient(180deg,rgba(139,105,20,.09),rgba(139,105,20,0));}
        .tb-basicinfo-dialog .bi-eyebrow{display:block;font-size:13px;letter-spacing:8px;color:#b3924b;margin-bottom:12px;font-family:var(--font-sans,system-ui);}
        .tb-basicinfo-dialog .bi-title{margin:0;font-size:30px;font-weight:700;letter-spacing:12px;text-indent:12px;color:#6f5410;font-family:var(--font-sans,system-ui);}
        .tb-basicinfo-dialog .bi-title-en{display:block;margin-top:9px;font-size:12px;letter-spacing:4px;color:rgba(139,105,20,.55);font-family:var(--font-english-sans,'Arial',sans-serif);}
        .tb-basicinfo-dialog .bi-head-rule{display:block;width:56px;height:2px;margin:20px auto 0;background:linear-gradient(90deg,transparent,#c8a05a,transparent);}
        .tb-basicinfo-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;}
        .tb-basicinfo-body .bi-rows{padding:4px 48px 26px;}
        .tb-basicinfo-body .bi-row{display:grid;grid-template-columns:5em 1fr;align-items:baseline;column-gap:24px;padding:8px 4px;border-bottom:1px solid rgba(180,165,130,.28);}
        .tb-basicinfo-body .bi-row:last-child{border-bottom:none;}
        .tb-basicinfo-body .bi-lb{position:relative;color:#8b6914;font-weight:700;font-size:16px;letter-spacing:3px;white-space:nowrap;padding-left:14px;}
        .tb-basicinfo-body .bi-lb::before{content:"";position:absolute;left:0;top:.35em;bottom:.2em;width:3px;border-radius:2px;background:#c8a05a;}
        .tb-basicinfo-body .bi-val{color:#3a3a3a;font-size:17px;line-height:1.55;letter-spacing:.5px;overflow-wrap:break-word;text-wrap:pretty;}
      `;
      document.head.appendChild(style);
    }

    // 燈箱節點只建立一次（SPA 換頁若被清掉會自動重建）
    let modal = document.getElementById('tbBasicInfoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tbBasicInfoModal';
      modal.className = 'tb-basicinfo-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', '基本資料');
      const rows = window.FY_BASIC_INFO.map(r =>
        `<div class="bi-row"><span class="bi-lb">${r.label}</span><span class="bi-val">${r.value}</span></div>`
      ).join('');
      modal.innerHTML = `
        <div class="tb-basicinfo-dialog">
            <button class="tb-basicinfo-close" type="button" title="關閉">✕</button>
            <div class="bi-head">
                <span class="bi-eyebrow">富宇學森</span>
                <h3 class="bi-title">基本資料</h3>
                <span class="bi-title-en">PROJECT INFORMATION</span>
                <span class="bi-head-rule" aria-hidden="true"></span>
            </div>
            <div class="tb-basicinfo-body"><div class="bi-rows">${rows}</div></div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.tb-basicinfo-close').addEventListener('click', () => modal.classList.remove('open'));
      // 點遮罩空白處關閉
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    // ESC 關閉（全域只註冊一次）
    if (!window._tbBasicInfoEscHandler) {
      window._tbBasicInfoEscHandler = (e) => {
        const m = document.getElementById('tbBasicInfoModal');
        if (e.key === 'Escape' && m && m.classList.contains('open')) m.classList.remove('open');
      };
      document.addEventListener('keydown', window._tbBasicInfoEscHandler, true);
    }

    // 導覽列「基本資料」連結（topbar 每次重建都要重綁）
    const basicInfoLink = topbar.querySelector('.tb-basicinfo-link');
    if (basicInfoLink) {
      basicInfoLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 攔在 SPA 路由委派之前，避免被當成頁面導航
        modal.classList.add('open');
      });
    }
  })();

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

// ===== 全域導航事件委派 (SPA 路由) =====
// 攔截所有 topbar 導航鏈接的點擊事件，使用 SPA 導航而不是頁面刷新
(() => {
  if (!window._spaNavigationSetup) {
    window._spaNavigationSetup = true;

    document.addEventListener('click', (e) => {
      // 檢查是否點擊了導航鏈接（在 topbar 中的 nav-item 或 submenu-item）
      const navLink = e.target.closest('.topbar a[href]');

      if (navLink && !navLink.href.includes('http')) {
        // 防止默認頁面加載
        e.preventDefault();
        e.stopPropagation();

        const href = navLink.getAttribute('href');
        console.log('[Navigation] 點擊導航鏈接:', href);

        // 使用 SPA 導航（如果可用）
        if (typeof window.spaNavigate === 'function') {
          // 更新 URL（不刷新頁面）
          history.pushState(null, '', href);
          // 執行 SPA 導航
          window.spaNavigate(href);
        } else {
          // 備用方案：直接導航
          window.location.href = href;
        }
      }
    }, { passive: false });
  }
})();
