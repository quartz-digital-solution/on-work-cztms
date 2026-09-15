(function () {
  'use strict';
  const S = window.OneLineStore, E = S.esc;
  function mount(host, onSessionLost = () => location.reload()) {
    let query = '', selected = '', message = '', error = false;
    function render() {
      const account = S.getSession();
      if (!account || !['staff','admin','management'].includes(account.role)) return onSessionLost();
      const products = S.getProducts().filter(p => !p.customSection && S.matches(p,{},query,true));
      const q = query.trim().toLowerCase();
      host.innerHTML = `<section class="stock-desk"><div class="stock-desk-head"><div><span>STOCK / AVAILABILITY</span><h2>Quick stock desk</h2><p>Find an item. Select the exact option. Record the quantity.</p></div></div>
      <label class="stock-search">${S.icon('barcode')}<input data-stock-search type="search" value="${E(query)}" placeholder="Scan barcode, product ID, name or option" autocomplete="off"></label>
      ${message ? `<p role="status" class="stock-feedback ${error ? 'error' : ''}">${E(message)}</p>` : ''}
      <div class="stock-products">${products.map(p => {
        const exact = q && p.variants.find(v => v.barcode && v.barcode.toLowerCase() === q);
        const open = selected === String(p.id) || !!exact || products.length === 1;
        const rows = p.variants.length ? (exact ? [exact] : p.variants) : [{id:'',size:'',colour:'',stock:p.stock,barcode:p.barcode,available:p.available}];
        return `<article class="stock-product"><button class="stock-product-head" data-stock-open="${p.id}"><img src="${E(p.image)}" alt=""><span><b>${E(p.name)}</b><small>${E(p.sku)} · ${p.stock} units${p.active && p.available ? '' : ' · Unavailable'}</small></span>${S.icon(open ? 'minus' : 'plus')}</button>${open ? `<div class="stock-variant-list">${rows.map(v => `<div class="stock-variant" data-stock-row="${E(v.id)}" data-product="${p.id}"><div><b>${E([v.colour,v.size].filter(Boolean).join(' / ') || 'Simple item')}</b><small>${E(v.barcode || 'No variant barcode')}${v.available === false ? ' · Unavailable' : ''}</small></div><strong>${v.stock}</strong><label>Quantity<input data-stock-qty type="number" min="1" step="1" value="1" inputmode="numeric" aria-label="Quantity for ${E([v.colour,v.size].join(' ') || p.name)}"></label><div class="stock-row-actions"><button data-stock-delta="-1" ${!p.active || !p.available || !v.stock || v.available === false ? 'disabled' : ''}>Sold</button><button data-stock-delta="1">${S.icon('plus')} Add stock</button></div></div>`).join('')}</div>` : ''}</article>`;
      }).join('') || '<div class="empty-state"><h2>No matching products</h2><p>Try the full barcode or product ID.</p></div>'}</div></section>`;
      host.querySelector('[data-stock-search]').oninput = e => {query = e.target.value; selected = ''; message = ''; render(); const field = host.querySelector('[data-stock-search]'); field.focus();};
      host.querySelectorAll('[data-stock-open]').forEach(b => b.onclick = () => {selected = selected === b.dataset.stockOpen ? '' : b.dataset.stockOpen; render();});
      host.querySelectorAll('[data-stock-delta]').forEach(b => b.onclick = () => {
        const row = b.closest('[data-stock-row]'), n = Number(row.querySelector('[data-stock-qty]').value), delta = n * Number(b.dataset.stockDelta);
        try {
          if (!Number.isSafeInteger(n) || n < 1) throw new Error('Enter a whole quantity greater than zero.');
          const balance = S.adjustStock(row.dataset.product,row.dataset.stockRow,delta);
          selected = row.dataset.product; error = false; message = `${delta < 0 ? 'Sold' : 'Added'} ${n}. New stock: ${balance}.`;
        } catch (e) {error = true; message = e.message;}
        render();
      });
    }
    render(); return {refresh:render};
  }
  window.OneLineStockDesk = {mount};
})();
