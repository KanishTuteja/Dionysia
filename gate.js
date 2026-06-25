/* ===================================================================
   DIONYSIA — gate.js
   Paste-in auth + membership gate for protected app pages.
   Usage: <script src="gate.js"></script> in <head> of every protected page.
   Lets in: comped founders (allowlist) OR active/trialing subscribers —
   both resolved server-side by the has_access() RPC.
     • not signed in        → /login.html
     • signed in, no access  → /membership.html  (go subscribe)
     • signed in, has access → page unlocks
   ================================================================= */
(function () {
  // ============ CONFIG ============
  const SUPABASE_URL   = "https://zjdraojepoaajgwrstkj.supabase.co";
  const SUPABASE_ANON  = "sb_publishable_bCodjhel8DZq00LRRApvWA_xamIhN_F";
  const LOGIN_URL      = "/login.html";
  const MEMBERSHIP_URL = "/membership.html";
  // ================================

  // Hide page until the check passes (prevents a flash of protected content).
  const HIDE_STYLE_ID = '__dionysia_gate_hide';
  if (!document.getElementById(HIDE_STYLE_ID)) {
    const s = document.createElement('style');
    s.id = HIDE_STYLE_ID;
    s.textContent = 'html{visibility:hidden!important}html.__dionysia_unlocked{visibility:visible!important}';
    document.documentElement.appendChild(s);
  }

  function unlock(){ document.documentElement.classList.add('__dionysia_unlocked'); }
  function go(url, reason){
    if (reason) try { sessionStorage.setItem('__dionysia_gate_reason', reason); } catch(_){}
    location.replace(url);
  }

  function loadSupabase(cb){
    if (window.supabase && window.supabase.createClient) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.async = false;
    s.onload = cb;
    s.onerror = () => go(LOGIN_URL, 'supabase-load-failed');
    document.head.appendChild(s);
  }

  function runGate(){
    try {
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

      sb.auth.getSession().then(async ({ data, error }) => {
        if (error || !data.session) return go(LOGIN_URL, 'no-session');

        // Authoritative access check: allowlisted founder OR live subscription.
        let hasAccess = false, rpcErrored = false;
        try {
          const { data: ok, error: rpcErr } = await sb.rpc('has_access');
          if (rpcErr) { rpcErrored = true; console.warn('[gate] has_access error:', rpcErr.message); }
          else hasAccess = !!ok;
        } catch (e) { rpcErrored = true; console.warn('[gate] has_access exception:', e); }

        // Freshly-paid users land on account.html?welcome=1 and the Stripe
        // webhook may take a second or two to flip them to "active". Let them
        // onto the account page (which shows "activating…" and polls) rather
        // than bouncing them away right after they paid.
        const isWelcome = new URLSearchParams(location.search).get('welcome') === '1';
        const onAccount = /account\.html$/.test(location.pathname);
        const allow = hasAccess || (isWelcome && onAccount);

        // Definitive "not a member" → send to membership page to subscribe.
        // Transient RPC error → fail open so a DB blip can't lock out real members.
        if (!allow && !rpcErrored) return go(MEMBERSHIP_URL, 'not-a-member');

        // Expose session globally for pages that want it.
        window.__dionysia_session  = data.session;
        window.__dionysia_user     = data.session.user;
        window.__dionysia_supabase = sb;
        window.dionysiaSignOut = async () => {
          try { await sb.auth.signOut(); } finally { location.replace(LOGIN_URL); }
        };

        unlock();
        document.dispatchEvent(new CustomEvent('dionysia:session', { detail: data.session }));
      }).catch(err => {
        console.error('[gate] session check failed:', err);
        go(LOGIN_URL, 'session-error');
      });
    } catch (e) {
      console.error('[gate] runtime error:', e);
      go(LOGIN_URL, 'runtime-error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadSupabase(runGate));
  } else {
    loadSupabase(runGate);
  }

  // Safety: if anything stalls past 6s, bounce so the user isn't stuck on a blank screen.
  setTimeout(() => {
    if (!document.documentElement.classList.contains('__dionysia_unlocked')) {
      console.warn('[gate] timeout — bouncing');
      go(LOGIN_URL, 'timeout');
    }
  }, 6000);
})();
