/* ===================================================================
   DIONYSIA — watchlist.js
   Per-device watchlist stored in localStorage.
   Exposes window.dionysia.watchlist with: list, has, add, remove,
   toggle, count, on(callback).
   Use: <script src="watchlist.js" defer></script>
   =================================================================== */
(function () {
  const KEY = 'dionysia.watchlist.v1';
  const EVT = 'dionysia:watchlist-change';

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  function write(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr || [])); } catch (_) {}
    try { document.dispatchEvent(new CustomEvent(EVT, { detail: { list: arr.slice() } })); } catch (_) {}
  }

  function list()      { return read(); }
  function has(id)     { return read().indexOf(id) !== -1; }
  function count()     { return read().length; }
  function add(id) {
    if (!id) return read();
    const arr = read();
    if (arr.indexOf(id) === -1) { arr.push(id); write(arr); }
    return arr;
  }
  function remove(id) {
    if (!id) return read();
    const arr = read().filter(x => x !== id);
    write(arr);
    return arr;
  }
  function toggle(id) {
    return has(id) ? remove(id) : add(id);
  }
  function on(cb) {
    if (typeof cb !== 'function') return () => {};
    const handler = (e) => cb((e && e.detail && e.detail.list) || read());
    document.addEventListener(EVT, handler);
    // Cross-tab sync via storage event
    const storageHandler = (e) => { if (e.key === KEY) cb(read()); };
    window.addEventListener('storage', storageHandler);
    return () => {
      document.removeEventListener(EVT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }

  window.dionysia = window.dionysia || {};
  window.dionysia.watchlist = { list, has, add, remove, toggle, count, on };
})();
