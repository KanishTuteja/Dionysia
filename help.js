/* ===================================================================
   DIONYSIA — help.js
   Floating support widget. Drop <script src="help.js" defer></script>
   on any page. Self-contained (inline styles) so it works anywhere.
   For payment, sign-in, playback — or anything — a real person replies.
   ================================================================= */
(function () {
  if (document.getElementById('dion-help')) return;
  const EMAIL = 'kanishtuteja@gmail.com';

  const style = document.createElement('style');
  style.textContent = `
  #dion-help{position:fixed;right:20px;bottom:20px;z-index:9000;font-family:'Inter',system-ui,sans-serif}
  #dion-help-btn{display:flex;align-items:center;gap:8px;cursor:pointer;border:1px solid rgba(201,163,90,0.5);
    background:rgba(10,7,7,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#e0c386;border-radius:999px;
    padding:10px 16px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;
    box-shadow:0 12px 30px -12px rgba(0,0,0,0.7);transition:transform .25s,border-color .25s,color .25s}
  #dion-help-btn:hover{transform:translateY(-2px);border-color:#c9a35a;color:#f3eadd}
  #dion-help-panel{position:absolute;right:0;bottom:56px;width:290px;display:none;
    background:linear-gradient(180deg,#15100f,#0d0908);border:1px solid rgba(201,163,90,0.3);
    border-radius:8px;padding:20px;box-shadow:0 30px 70px -30px rgba(0,0,0,0.85)}
  #dion-help.open #dion-help-panel{display:block}
  #dion-help-panel h4{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:21px;color:#f3eadd;margin:0 0 6px}
  #dion-help-panel p{font-size:13px;line-height:1.55;color:#a99c8c;margin:0 0 14px}
  #dion-help-panel a.act{display:block;text-align:center;text-decoration:none;border-radius:3px;padding:11px;
    font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;transition:border-color .25s,transform .2s}
  #dion-help-panel a.act:hover{transform:translateY(-1px)}
  .dh-primary{background:linear-gradient(180deg,#d8b269,#b58a3f);color:#1a0a0d;font-weight:600}
  .dh-ghost{border:1px solid rgba(243,234,221,0.18);color:#f3eadd}
  .dh-ghost:hover{border-color:rgba(201,163,90,0.5)}
  #dion-help-close{position:absolute;top:9px;right:12px;cursor:pointer;color:#6f6457;font-size:18px;line-height:1;background:none;border:none}
  #dion-help-close:hover{color:#c9a35a}
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.id = 'dion-help';
  wrap.innerHTML =
    '<div id="dion-help-panel" role="dialog" aria-label="Help">' +
      '<button id="dion-help-close" aria-label="Close">×</button>' +
      '<h4>Need a hand?</h4>' +
      '<p>Trouble with payment, sign-in, or playback — or anything at all? Tell us and a real person will sort it out, fast.</p>' +
      '<a class="act dh-primary" href="mailto:' + EMAIL + '?subject=Dionysia%20%E2%80%94%20Help%20request">Email support</a>' +
      '<a class="act dh-ghost" href="account.html">Account &amp; billing</a>' +
    '</div>' +
    '<button id="dion-help-btn" aria-haspopup="dialog">? Help</button>';

  function mount(){
    document.body.appendChild(wrap);
    const btn = wrap.querySelector('#dion-help-btn');
    const close = wrap.querySelector('#dion-help-close');
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); wrap.classList.toggle('open'); });
    close.addEventListener('click', ()=> wrap.classList.remove('open'));
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') wrap.classList.remove('open'); });
    document.addEventListener('click', (e)=>{ if (!wrap.contains(e.target)) wrap.classList.remove('open'); });
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
