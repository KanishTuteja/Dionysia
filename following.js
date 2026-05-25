/* ===================================================================
   DIONYSIA — following.js
   Per-device list of creators (filmmakers) the viewer follows,
   stored in localStorage. A "creator" is keyed by their name.
   Exposes window.dionysia.following with: list, has, add, remove,
   toggle, count, on(callback).
   Use: <script src="following.js" defer></script>
   =================================================================== */
(function () {
  const KEY = 'dionysia.following.v1';
  const EVT = 'dionysia:following-change';

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

  // Normalise a creator name so "Andre Surya " and "Andre Surya" match.
  function norm(name) { return String(name == null ? '' : name).trim(); }

  function list()       { return read(); }
  function has(name)    { return read().indexOf(norm(name)) !== -1; }
  function count()      { return read().length; }
  function add(name) {
    const id = norm(name);
    if (!id) return read();
    const arr = read();
    if (arr.indexOf(id) === -1) { arr.push(id); write(arr); }
    return arr;
  }
  function remove(name) {
    const id = norm(name);
    if (!id) return read();
    const arr = read().filter(x => x !== id);
    write(arr);
    return arr;
  }
  function toggle(name) {
    return has(name) ? remove(name) : add(name);
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
  window.dionysia.following = { list, has, add, remove, toggle, count, on };
})();
