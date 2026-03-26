/* js/topbar.js */
(() => {
  const topbar = document.querySelector('.topbar');

  // Handle scroll event for topbar styling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  });

  // Extract current page to highlight nav
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const queryParams = new URLSearchParams(window.location.search);
  const pageParam = queryParams.get('page');

  const navItems = document.querySelectorAll('.nav-item');
  const submenuItems = document.querySelectorAll('.submenu-item');

  let matchFound = false;

  // Check submenus first
  submenuItems.forEach(item => {
    const link = item.querySelector('a').getAttribute('href');
    if (link === currentPage) {
      item.closest('.nav-item').classList.add('active');
      matchFound = true;
    }
  });

  // Check main nav items
  if (!matchFound) {
    navItems.forEach(item => {
      const linkEl = item.querySelector('.nav-link');
      if (linkEl) {
        let href = linkEl.getAttribute('href');
        if (currentPage === 'coming-soon.html' && pageParam) {
          if (href.includes('page=' + pageParam)) {
            item.classList.add('active');
          }
        } else if (href === currentPage && href !== '#') {
          item.classList.add('active');
        }
      }
    });
  }
})();
