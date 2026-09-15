(function () {
  'use strict';
  const S = window.OneLineStore, root = document.getElementById('staff-app');
  let desk, error = '';
  function render() {
    const account = S.getSession('staff');
    if (!account) {
      root.innerHTML = `<main class="portal-login-page"><section class="portal-login"><div>${S.icon('barcode')}<span>STAFF</span><h1>Stock made simple.</h1><p>Find the exact item. Record sold quantities or add stock.</p></div><form data-login><label>Username<input name="username" required autocomplete="username"></label><label>Password<input name="password" type="password" required autocomplete="current-password"></label><p role="alert">${S.esc(error)}</p><button>Sign in</button><small>Demo: staff / staff123</small></form></section></main>`;
      root.querySelector('form').onsubmit = e => {e.preventDefault(); const f = new FormData(e.target), a = S.authenticate('staff',f.get('username'),f.get('password')); if (!a) {error = 'Incorrect login or suspended account.'; render(); return;} S.setSession(a); error = ''; render();}; return;
    }
    root.innerHTML = `<main class="staff-stock-page"><header><a href="index.html"><img src="one-line-mark.svg" alt="One-Line"></a><div><h1>Staff</h1><small>${S.esc(account.name)}</small></div><button data-logout>${S.icon('logout')} Sign out</button></header><div id="stock-root"></div></main>`;
    root.querySelector('[data-logout]').onclick = () => {S.setSession(null); render();};
    desk = window.OneLineStockDesk.mount(root.querySelector('#stock-root'),render);
  }
  window.addEventListener('storage', () => S.getSession('staff') && desk ? desk.refresh() : render());
  render();
})();
