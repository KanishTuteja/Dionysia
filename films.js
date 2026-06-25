/* ===================================================================
   DIONYSIA — films.js
   Loads films.json once, caches, exposes helpers on window.dionysia.
   Use: <script src="films.js" defer></script>
   ================================================================= */
(function () {
  const FILE = 'films.json';
  let _cache = null;
  let _loading = null;

  async function getFilms() {
    if (_cache) return _cache;
    if (_loading) return _loading;
    _loading = fetch(FILE, { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error('films.json HTTP ' + r.status);
        return r.json();
      })
      .then(data => {
        _cache = Array.isArray(data) ? data : [];
        return _cache;
      })
      .catch(err => {
        console.warn('[films] load failed:', err);
        _cache = [];
        return _cache;
      })
      .finally(() => { _loading = null; });
    return _loading;
  }

  async function getFilm(id) {
    const all = await getFilms();
    return all.find(f => f.id === id || f.slug === id) || null;
  }

  async function getFilmsByFormat(format) {
    const all = await getFilms();
    return all.filter(f => f.format === format);
  }

  async function getLiveFilms() {
    const all = await getFilms();
    return all.filter(f => f.status === 'live');
  }

  async function getFilmCount() {
    const all = await getFilms();
    return all.filter(f => f.status === 'live').length;
  }

  // Public API
  window.dionysia = window.dionysia || {};
  Object.assign(window.dionysia, {
    getFilms,
    getFilm,
    getFilmsByFormat,
    getLiveFilms,
    getFilmCount
  });
})();
