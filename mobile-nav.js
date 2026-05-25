/* ===================================================================
   DIONYSIA — mobile-nav.js
   Drop-in hamburger + drawer for any app page.
   Usage: <script src="mobile-nav.js" defer></script>
   Auto-injects styles, button, drawer. Visible only below 768px.
   ================================================================= */
(function () {
  // ============ NAV LINKS — single source of truth ============
  const LINKS = [
    { href: 'discover.html',  label: 'Discover'  },
    { href: 'movies.html',    label: 'Films'     },
    { href: 'series.html',    label: 'Series'    },
    { href: 'shorts.html',    label: 'Shorts'    },
    { href: 'watchlist.html', label: 'Watchlist' },
    { href: 'account.html',   label: 'Account'   },
    { href: 'dashboard.html', label: 'Creator dashboard' }
  ];
  // ============================================================

  if (document.getElementById('__dion_mobile_nav_styles')) return; // idempotent

  const css = `
  #__dion_hamburger{
    position:fixed;top:1.2em;right:1.2em;z-index:9998;
    width:44px;height:44px;display:none;align-items:center;justify-content:center;
    background:rgba(10,7,7,0.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    border:1px solid rgba(201,163,90,0.25);border-radius:3px;
    cursor:pointer;transition:all 200ms ease;
  }
  #__dion_hamburger:hover{border-color:rgba(201,163,90,0.55);background:rgba(10,7,7,0.92)}
  #__dion_hamburger svg{width:20px;height:20px;stroke:#c9a35a;stroke-width:1.6;fill:none;stroke-linecap:square}
  @media (max-width:767px){
    #__dion_hamburger{display:flex}
  }

  #__dion_drawer{
    position:fixed;inset:0;z-index:9999;
    background:rgba(10,7,7,0.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    transform:translateX(100%);transition:transform 320ms cubic-bezier(0.32,0.72,0,1);
    display:flex;flex-direction:column;
    overflow-y:auto;
  }
  #__dion_drawer.__open{transform:translateX(0)}
  #__dion_drawer::before{
    content:"";position:absolute;inset:0;pointer-events:none;opacity:0.05;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>");
    mix-blend-mode:overlay;
  }
  #__dion_drawer .__head{
    display:flex;align-items:center;justify-content:space-between;
    padding:1.2em 1.4em;border-bottom:1px solid rgba(243,234,221,0.06);
  }
  #__dion_drawer .__mark{display:flex;align-items:center;gap:0.6em}
  #__dion_drawer .__mark svg{width:24px;height:24px}
  #__dion_drawer .__mark .__word{
    font-family:'Cormorant Garamond',serif;font-size:15px;letter-spacing:0.28em;color:#f3eadd;
  }
  #__dion_drawer .__close{
    width:38px;height:38px;display:flex;align-items:center;justify-content:center;
    background:transparent;border:none;color:#c9a35a;cursor:pointer;font-size:24px;
    font-family:'Cormorant Garamond',serif;line-height:1;
  }
  #__dion_drawer nav{
    flex:1;display:flex;flex-direction:column;justify-content:center;gap:0.2em;padding:2em 1.6em;
    position:relative;z-index:1;
  }
  #__dion_drawer nav a{
    display:block;padding:0.6em 0;
    font-family:'Cormorant Garamond',serif;font-weight:400;font-size:30px;letter-spacing:0.01em;
    color:#f3eadd;text-decoration:none;border-bottom:1px solid rgba(243,234,221,0.04);
    transition:color 200ms ease,padding-left 240ms ease;
  }
  #__dion_drawer nav a:hover,#__dion_drawer nav a:focus{
    color:#c9a35a;padding-left:0.4em;outline:none;
  }
  #__dion_drawer nav a.__active{color:#c9a35a}
  #__dion_drawer nav a.__active::before{content:"\\2014  ";color:#c9a35a;letter-spacing:-0.1em}
  #__dion_drawer .__foot{
    padding:1.4em 1.6em;border-top:1px solid rgba(243,234,221,0.06);
    text-align:center;
    font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#6f6457;
    position:relative;z-index:1;
  }
  #__dion_drawer .__foot a{color:#c9a35a;text-decoration:none;border-bottom:1px solid rgba(201,163,90,0.3)}

  body.__dion_no_scroll{overflow:hidden}

  /* The hamburger owns the top-right corner on mobile — hide each page's
     own nav search + account icons so they don't collide beneath it.
     Account stays reachable from inside the drawer below. */
  @media (max-width:767px){
    header [aria-label="Search"],
    header [aria-label="Account"]{display:none !important}
  }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = '__dion_mobile_nav_styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Hamburger button
  const ham = document.createElement('button');
  ham.id = '__dion_hamburger';
  ham.setAttribute('aria-label', 'Open menu');
  ham.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';

  // Drawer
  const drawer = document.createElement('aside');
  drawer.id = '__dion_drawer';
  drawer.setAttribute('aria-label', 'Site navigation');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const linkHTML = LINKS.map(l => {
    const active = l.href.toLowerCase() === here ? ' class="__active"' : '';
    return `<a href="${l.href}"${active}>${l.label}</a>`;
  }).join('');

  drawer.innerHTML = `
    <div class="__head">
      <a href="discover.html" class="__mark">
        <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 275 L126 275 L76 183 Z" fill="#6b1220"/>
          <path d="M160 92 L244 240 L76 240 Z" stroke="#c9a35a" stroke-width="10" fill="none" stroke-linejoin="miter"/>
          <path d="M160 30 L290 275 L126 275 L76 183 Z" stroke="#f3eadd" stroke-width="12" fill="none" stroke-linejoin="miter"/>
        </svg>
        <span class="__word">DIONYSIA</span>
      </a>
      <button class="__close" aria-label="Close menu">&times;</button>
    </div>
    <nav>${linkHTML}</nav>
    <div class="__foot">
      <a href="#" id="__dion_signout">Sign out</a> &nbsp;&middot;&nbsp; <em>"Hand-set, frame by frame."</em>
    </div>
  `;

  function attach(){
    if (!document.body) return setTimeout(attach, 30);
    document.body.appendChild(ham);
    document.body.appendChild(drawer);

    function open(){
      drawer.classList.add('__open');
      document.body.classList.add('__dion_no_scroll');
      ham.setAttribute('aria-expanded','true');
    }
    function close(){
      drawer.classList.remove('__open');
      document.body.classList.remove('__dion_no_scroll');
      ham.setAttribute('aria-expanded','false');
    }

    ham.addEventListener('click', open);
    drawer.querySelector('.__close').addEventListener('click', close);

    // Close on link click
    drawer.querySelectorAll('nav a').forEach(a => {
      a.addEventListener('click', close);
    });

    // Sign out
    const out = drawer.querySelector('#__dion_signout');
    out.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.dionysiaSignOut === 'function') {
        window.dionysiaSignOut();
      } else {
        location.href = '/login.html';
      }
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('__open')) close();
    });

    // Resize cleanup
    let lastIsMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 768;
      if (lastIsMobile && !isMobile) close();
      lastIsMobile = isMobile;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
