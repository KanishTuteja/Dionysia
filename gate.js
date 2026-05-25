/* ===================================================================
   DIONYSIA — gate.js
   Paste-in auth gate for protected app pages.
   Usage: <script src="gate.js"></script> in <head> of every protected page.
   Loads Supabase JS, checks session, redirects to /login.html if missing.
   ================================================================= */
(function () {
  // ============ CONFIG ============
  const SUPABASE_URL    = "https://zjdraojepoaajgwrstkj.supabase.co";
  const SUPABASE_ANON   = "sb_publishable_bCodjhel8DZq00LRRApvWA_xamIhN_F";
  const LOGIN_URL       = "/login.html";
  const CHECK_ALLOWLIST = true;   // set false to skip allowed_emails check
  // ================================

  // Hide page until auth check passes (prevents flash of protected content)
  const HIDE_STYLE_ID = '__dionysia_gate_hide';
  if (!document.getElementById(HIDE_STYLE_ID)) {
    const s = document.createElement('style');
    s.id = HIDE_STYLE_ID;
    s.textContent = 'html{visibility:hidden!important}html.__dionysia_unlocked{visibility:visible!important}';
    document.documentElement.appendChild(s);
  }

  function unlock(){ document.documentElement.classList.add('__dionysia_unlocked'); }
  function bounce(reason){
    if (reason) try { sessionStorage.setItem('__dionysia_gate_reason', reason); } catch(_){}
    location.replace(LOGIN_URL);
  }

  function loadSupabase(cb){
    if (window.supabase && window.supabase.createClient) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.async = false;
    s.onload = cb;
    s.onerror = () => bounce('supabase-load-failed');
    document.head.appendChild(s);
  }

  function runGate(){
    try {
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

      sb.auth.getSession().then(async ({ data, error }) => {
        if (error || !data.session) return bounce('no-session');

        // Optional close-circle allowlist check
        if (CHECK_ALLOWLIST) {
          const userEmail = (data.session.user.email || '').toLowerCase();
          try {
            const { data: allowed, error: allowedErr } = await sb
              .from('allowed_emails')
              .select('email')
              .eq('email', userEmail)
              .maybeSingle();
            if (allowedErr) {
              // Fail open if RLS blocks or table missing — log + continue
              console.warn('[gate] allowlist check failed, failing open:', allowedErr.message);
            } else if (!allowed) {
              await sb.auth.signOut();
              return bounce('not-allowlisted');
            }
          } catch (e) {
            console.warn('[gate] allowlist exception, failing open:', e);
          }
        }

        // Expose session globally for pages that want it
        window.__dionysia_session = data.session;
        window.__dionysia_user    = data.session.user;
        window.__dionysia_supabase = sb;

        // Sign out helper (any page can call window.dionysiaSignOut())
        window.dionysiaSignOut = async () => {
          try { await sb.auth.signOut(); } finally { location.replace(LOGIN_URL); }
        };

        unlock();
        document.dispatchEvent(new CustomEvent('dionysia:session', { detail: data.session }));
      }).catch(err => {
        console.error('[gate] session check failed:', err);
        bounce('session-error');
      });
    } catch (e) {
      console.error('[gate] runtime error:', e);
      bounce('runtime-error');
    }
  }

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadSupabase(runGate));
  } else {
    loadSupabase(runGate);
  }

  // Safety: if anything stalls more than 6s, bounce so user isn't stuck on blank screen
  setTimeout(() => {
    if (!document.documentElement.classList.contains('__dionysia_unlocked')) {
      console.warn('[gate] timeout — bouncing');
      bounce('timeout');
    }
  }, 6000);
})();
