(function () {
  'use strict';
  const S = window.OneLineStore, E = S.esc;
  function mount(host, initial, onSave, onCancel) {
    let draft = initial ? S.clone(initial) : {id:'',sku:'',name:'',categoryId:'',subcategoryId:'',category:'',subcategory:'',productType:'simple',optionName:'Size',price:0,mrp:0,stock:0,active:true,available:true,barcodeEnabled:false,barcode:'',customerVisible:true,b2bEnabled:true,askForPrice:false,description:'',keywords:[],image:'',gallery:[],variants:[],colorImages:{}};
    let busy = false, error = '', groupImage = '', group = {colour:'',values:'',qty:0,price:null};
    const option = (value,label,selected) => `<option value="${E(value)}" ${value === selected ? 'selected' : ''}>${E(label)}</option>`;
    const input = (name,label,value,type='text',extra='') => `<label>${label}<input name="${name}" value="${E(value)}" type="${type}" ${extra}></label>`;
    function capture() {
      const form = host.querySelector('form'); if (!form) return;
      const f = new FormData(form);
      for(const key of ['colour','values','qty','price']){const el=host.querySelector('[data-group-'+key+']');if(el)group[key]=el.value;}
      ['sku','name','categoryId','subcategoryId','productType','optionName','barcode','description'].forEach(k => draft[k] = String(f.get(k) || '').trim());
      ['price','mrp','stock'].forEach(k => draft[k] = Number(f.get(k) || 0));
      ['active','available','barcodeEnabled','customerVisible','b2bEnabled','askForPrice'].forEach(k => draft[k] = f.has(k));
      draft.keywords = String(f.get('keywords') || '').split(',').map(x => x.trim()).filter(Boolean);
      host.querySelectorAll('[data-variant-row]').forEach(row => {
        const v = draft.variants.find(v => v.id === row.dataset.variantRow);
        ['size','colour','barcode'].forEach(k => {const el = row.querySelector(`[data-v="${k}"]`); if (el) v[k] = el.value.trim();});
        ['stock','price'].forEach(k => v[k] = Number(row.querySelector(`[data-v="${k}"]`).value));
        v.available = row.querySelector('[data-v="available"]').checked;
      });
    }
    function render() {
      const p = draft, categories = S.getCategories(), subs = S.getSubcategories(p.categoryId);
      host.innerHTML = `<div class="overlay receiver-overlay"><aside class="admin-drawer wide-drawer product-editor-drawer" role="dialog" aria-modal="true" aria-label="Product editor">
        <div class="drawer-head"><div><span>PRODUCT EDITOR</span><h2>${p.id ? 'Edit product' : 'Add product'}</h2></div><button type="button" data-cancel aria-label="Close editor">${S.icon('close')}</button></div>
        <form class="wellone-product-form" data-ready-product-form>
        <section class="editor-section form-grid">
          <label>Category<select name="categoryId" required>${option('','Select category',p.categoryId)}${categories.map(c => option(c.id,c.name,p.categoryId)).join('')}</select></label>
          <label>Subcategory<select name="subcategoryId" ${p.categoryId ? '' : 'disabled'}>${option('','Select subcategory',p.subcategoryId)}${subs.map(s => option(s.id,s.name,p.subcategoryId)).join('')}</select></label>
          ${input('name','Product name',p.name,'text','required')}${input('sku','Product ID',p.sku,'text','required')}
          <label class="full">Search keywords <small>Hidden from customers · separate with commas</small><textarea name="keywords" placeholder="cotton shirt, office wear, school uniform">${E((p.keywords || []).join(', '))}</textarea></label>
          <label class="full">Description<textarea name="description" rows="3">${E(p.description)}</textarea></label>
        </section>
        <section class="editor-section inventory-box"><h3>Inventory & barcode</h3><div class="editor-switches">
          <label><input type="checkbox" name="barcodeEnabled" ${p.barcodeEnabled ? 'checked' : ''}> Barcode identification</label>
          <label><input type="checkbox" name="available" ${p.available ? 'checked' : ''}> Available for sale</label></div>
          ${p.barcodeEnabled ? input('barcode','Product barcode',p.barcode,'text','autocomplete="off"') : '<input name="barcode" type="hidden" value="'+E(p.barcode)+'">'}
          ${p.productType === 'simple' ? input('stock','Available quantity',p.stock,'number','min="0" step="1" required') : `<p class="editor-help">Total stock: <b>${p.variants.reduce((n,v) => n + v.stock,0)}</b> · managed per option below</p>`}
        </section>
        <section class="editor-section"><h3>Product type & options</h3><label>Product type<select name="productType">${option('simple','Simple item',p.productType)}${option('option','One Option',p.productType)}${option('color_option','Colour + Option',p.productType)}</select></label>
          <p class="editor-help">${p.productType === 'simple' ? 'One sellable item with a single stock quantity.' : p.productType === 'option' ? 'Each size or option has its own image, stock and optional barcode.' : 'Every colour + option combination has its own stock. A colour image applies to all its sizes.'}</p>
          <div class="editor-gallery">${(p.gallery || []).map((src,i) => `<div><img src="${E(src)}" alt="Product image ${i+1}"><button type="button" data-remove-image="${i}" aria-label="Remove image">${S.icon('close')}</button><small>${i === 0 ? 'Main image' : 'Gallery'}</small></div>`).join('')}
          <label class="editor-upload">${S.icon('upload')}<b>Add images</b><small>3:4 display · camera or gallery</small><input type="file" accept="image/*" multiple data-images></label></div>
          <div class="form-grid">${input('mrp','MRP / crossed price',p.mrp,'number','min="0" step="0.01"')}${input('price','Final price',p.price,'number','min="0" step="0.01" required')}</div>
          ${p.productType !== 'simple' ? `<div class="option-builder">${input('optionName','Option title',p.optionName,'text','required placeholder="Size / Type / Pack"')}
          <div class="form-grid">${p.productType === 'color_option' ? `<label>Colour<input data-group-colour placeholder="Blue" value="${E(group.colour)}"></label>` : ''}<label>Option values<input data-group-values placeholder="S, M, L, XL" value="${E(group.values)}"></label><label>Quantity each<input data-group-qty type="number" min="0" step="1" value="${E(group.qty)}"></label><label>Price each<input data-group-price type="number" min="0" step="0.01" value="${E(group.price??p.price)}"></label></div>
          <label class="group-upload">${groupImage ? '<img src="'+E(groupImage)+'" alt="Option group image">' : S.icon('image')}<span>${p.productType === 'color_option' ? 'Image for this colour / all sizes' : 'Image for these options'}<small>Optional; each row can override it</small></span><input type="file" accept="image/*" data-group-image></label>
          <button type="button" class="secondary wide" data-add-group>${S.icon('plus')} Add option group</button></div>
          <div class="variant-editor-list">${p.variants.map(v => `<article data-variant-row="${E(v.id)}"><div class="variant-row-head"><b>${E([v.colour,v.size].filter(Boolean).join(' / '))}</b><button type="button" data-delete-variant="${E(v.id)}" aria-label="Delete variant">${S.icon('trash')}</button></div><div class="variant-row-fields">
          ${p.productType === 'color_option' ? `<label>Colour<input data-v="colour" value="${E(v.colour)}" required></label>` : ''}<label>${E(p.optionName || 'Option')}<input data-v="size" value="${E(v.size)}" required></label><label>Stock<input data-v="stock" type="number" min="0" step="1" value="${v.stock}" required></label><label>Price<input data-v="price" type="number" min="0" step="0.01" value="${v.price}" required></label>
          ${p.barcodeEnabled ? `<label>Barcode<input data-v="barcode" value="${E(v.barcode || '')}"></label>` : ''}<label class="check-label"><input data-v="available" type="checkbox" ${v.available !== false ? 'checked' : ''}> Available</label></div>
          <label class="variant-image-upload">${v.image ? '<img src="'+E(v.image)+'" alt="Variant image">' : S.icon('image')}<span>Variant image<small>${v.image ? 'Change image' : 'Uses product image'}</small></span><input data-variant-image="${E(v.id)}" type="file" accept="image/*"></label>
          ${p.productType === 'color_option' && v.image ? `<button type="button" class="text-button" data-share-image="${E(v.id)}">Use image for all ${E(v.colour)} options</button>` : ''}</article>`).join('')}</div>` : ''}
        </section>
        <section class="editor-section"><h3>Visibility & enquiries</h3><div class="editor-switches">${[['active','Active product'],['customerVisible','Visible to retail customers'],['b2bEnabled','Visible in B2B'],['askForPrice','Ask For Price (retail enquiry only)']].map(([key,label]) => `<label><input type="checkbox" name="${key}" ${p[key] ? 'checked' : ''}> ${label}</label>`).join('')}</div><p class="editor-help">B2B always uses WhatsApp enquiries without displaying prices.</p></section>
        ${error ? `<p class="form-error" role="alert">${E(error)}</p>` : ''}<div class="drawer-actions"><button type="button" data-cancel>Cancel</button><button class="admin-primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Preparing images…' : 'Save product'}</button></div></form></aside></div>`;
      bind();
    }
    async function upload(input, cb, max = 1200) {
      if (!input.files?.length) return;
      capture(); busy = true;
      host.querySelector('[type="submit"]').disabled = true;
      try {const images = await Promise.all([...input.files].map(f => S.compressImage(f,max,.84))); cb(images); error = '';}
      catch (e) {error = e.message;}
      busy = false; render();
    }
    function bind() {
      host.querySelectorAll('[data-cancel]').forEach(b => b.onclick = onCancel);
      host.querySelector('[name="categoryId"]').onchange = () => {capture(); draft.subcategoryId = ''; render();};
      host.querySelector('[name="barcodeEnabled"]').onchange = () => {capture(); render();};
      host.querySelector('[name="productType"]').onchange = e => {
        const old = draft.productType, next = e.target.value;
        if (draft.variants.length && !confirm('Changing product type clears its option rows. Continue?')) {e.target.value = old; return;}
        capture(); draft.productType = next; draft.variants = []; draft.colors = []; draft.sizes = []; render();
      };
      host.querySelector('[name="optionName"]')?.addEventListener('change', () => {capture(); render();});
      host.querySelector('[data-images]').onchange = e => upload(e.target, images => {draft.gallery.push(...images); draft.image = draft.gallery[0];});
      host.querySelectorAll('[data-remove-image]').forEach(b => b.onclick = () => {capture(); draft.gallery.splice(Number(b.dataset.removeImage),1); draft.image = draft.gallery[0] || ''; render();});
      host.querySelector('[data-group-image]')?.addEventListener('change', e => upload(e.target, images => {groupImage = images[0];},900));
      host.querySelector('[data-add-group]')?.addEventListener('click', () => {
        const colour = host.querySelector('[data-group-colour]')?.value.trim() || '', values = [...new Set(host.querySelector('[data-group-values]').value.split(',').map(x => x.trim()).filter(Boolean))], stock = Number(host.querySelector('[data-group-qty]').value), price = Number(host.querySelector('[data-group-price]').value);
        capture();
        if (!values.length || draft.productType === 'color_option' && !colour) {error = 'Enter a colour and option values, or option values for One Option.'; render(); return;}
        if (!Number.isSafeInteger(stock) || stock < 0 || !Number.isFinite(price) || price < 0) {error = 'Use a non-negative whole quantity and valid price.'; render(); return;}
        values.forEach(size => {if (!draft.variants.some(v => v.colour.toLowerCase() === colour.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())) draft.variants.push({id:S.uid('v'),colour,size,stock,price,image:groupImage,available:true,barcode:''});});
        error = ''; groupImage = ''; group={colour:'',values:'',qty:0,price:null};render();
      });
      host.querySelectorAll('[data-delete-variant]').forEach(b => b.onclick = () => {capture(); if (!confirm('Remove this option and its stock entry?')) return; draft.variants = draft.variants.filter(v => v.id !== b.dataset.deleteVariant); render();});
      host.querySelectorAll('[data-variant-image]').forEach(input => input.onchange = () => upload(input, images => {draft.variants.find(v => v.id === input.dataset.variantImage).image = images[0];},900));
      host.querySelectorAll('[data-share-image]').forEach(b => b.onclick = () => {capture(); const v = draft.variants.find(v => v.id === b.dataset.shareImage); draft.variants.filter(x => x.colour === v.colour).forEach(x => x.image = v.image); render();});
      host.querySelector('form').onsubmit = e => {
        e.preventDefault(); if (busy) return; capture();
        try {
          if (draft.productType !== 'simple' && !draft.variants.length) throw new Error('Add at least one option group.');
          draft.colors = draft.productType === 'color_option' ? [...new Set(draft.variants.map(v => v.colour))] : [];
          draft.sizes = draft.productType !== 'simple' ? [...new Set(draft.variants.map(v => v.size))] : [];
          draft.colourOptions = []; draft.customSection = false; draft.customizable = false; draft.enquiryOnly = draft.askForPrice;
          const saved = S.saveProduct(draft); onSave(saved);
        } catch (e) {error = e.message; render(); host.querySelector('.form-error')?.scrollIntoView({block:'center'});}
      };
    }
    render();
  }
  window.OneLineProductEditor = {mount};
})();
