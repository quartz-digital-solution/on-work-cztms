/* Shared domain layer. UI callers use this boundary for the future remote adapter. */
(function () {
  'use strict';
  const S = window.OneLineStore, originalProducts = S.getProducts;
  const uid = prefix => prefix + '-' + crypto.randomUUID();
  const words = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  const unique = list => [...new Set(list.map(x => String(x).trim()).filter(Boolean))];
  const qty = value => Math.max(0, Math.floor(Number(value) || 0));
  const price = value => Math.max(0, Number(value) || 0);
  S.BUILD = 'one-line-20260915-r7';
  S.KEYS.schema = 'one-line-schema';
  S.KEYS.subcategories = 'one-line-subcategories-v1';
  function normalize(p) {
    p = S.clone(p);
    p.productType ||= p.variants?.length ? (p.variants.some(v => v.colour) ? 'color_option' : 'option') : p.colors?.length > 1 ? 'color_option' : p.sizes?.filter(s => s !== 'Default').length ? 'option' : 'simple';
    p.optionName ||= 'Size';
    p.customerVisible = p.customerVisible ?? !p.b2bOnly;
    p.available = p.available !== false;
    p.askForPrice = p.askForPrice ?? !!p.enquiryOnly;
    p.keywords = Array.isArray(p.keywords) ? p.keywords : String(p.keywords || '').split(',').map(x => x.trim()).filter(Boolean);
    p.gallery = unique(p.gallery?.length ? p.gallery : [p.image, p.backImage, p.rightSleeveImage, p.leftSleeveImage].filter(Boolean));
    if (!p.customSection && p.productType !== 'simple' && !p.variants?.length) {
      const colors = p.productType === 'color_option' ? (p.colors?.length ? p.colors : ['Default']) : [''];
      const sizes = p.sizes?.length ? p.sizes : ['Default'];
      // Preserve aggregate legacy stock; allocate remaining units deterministically.
      let index = 0, total = qty(p.stock), count = colors.length * sizes.length;
      p.variants = colors.flatMap(colour => sizes.map((size, j) => {
        const c = p.colourOptions?.find(v => v.colour === colour);
        const stock = c ? Math.floor(qty(c.stock) / sizes.length) + (j < qty(c.stock) % sizes.length ? 1 : 0) : Math.floor(total / count) + (index < total % count ? 1 : 0);
        index++;
        return {id: uid('variant'), colour, size, stock, price: price(c?.price ?? p.price), barcode: j === 0 ? c?.barcode || '' : '', available: true, image: c?.image || p.colorImages?.[colour] || ''};
      }));
    }
    if (p.productType === 'simple' && !p.customSection) { p.variants = []; p.colors = []; p.sizes = []; }
    p.variants = (p.variants || []).map(v => ({...v, id: v.id || uid('variant'), stock: qty(v.stock), available: v.available !== false, price: price(v.price ?? p.price), size: String(v.size || v.option || ''), colour: String(v.colour || '')}));
    if (p.variants.length) {
      p.stock = p.variants.reduce((n, v) => n + v.stock, 0);
      p.colors = unique(p.variants.map(v => v.colour));
      p.sizes = unique(p.variants.map(v => v.size));
    } else p.stock = qty(p.stock);
    return p;
  }
  S.getProducts = () => originalProducts().map(normalize);
  S.getSubcategories = (categoryId, activeOnly = false) => S.load(S.KEYS.subcategories, []).filter(x => (!categoryId || x.categoryId === categoryId) && (!activeOnly || x.active));
  S.categoryFor = p => S.getCategories().find(c => c.id === p.categoryId || c.name === p.category);
  S.categoryVisible = p => {
    const c = S.categoryFor(p); if (!c || !c.active) return false;
    const sub = S.getSubcategories(c.id).find(x => x.id === p.subcategoryId || x.name === p.subcategory);
    return !p.subcategory || !!sub?.active;
  };
  S.categoriesForCustomer = () => S.getCategories().filter(c => c.active).sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => ({...c, sub: S.getSubcategories(c.id, true).map(x => x.name).join(' · ')}));
  S.findVariant = (p, colour, size) => p?.variants?.find(v => v.colour === (colour || '') && v.size === (size || ''));
  S.productStock = (p, colour, size) => {
    if (!p || !p.active || p.available === false) return 0;
    if (p.variants?.length) {const v = S.findVariant(p, colour, size); return v?.available ? qty(v.stock) : 0;}
    return qty(p.stock);
  };
  S.productPrice = (p, colour, size) => price(S.findVariant(p, colour, size)?.price ?? p?.price);
  const originalImage = S.productImage;
  S.productImage = (p, colour, side, size) => {
    if ((!side || side === 'front') && size != null) {
      const v = S.findVariant(p, colour, size);
      if (v?.image) return v.image;
    }
    return originalImage(p, colour, side);
  };
  S.availableRows = p => p.variants?.length ? p.variants.filter(v => p.active && p.available && v.available && v.stock > 0) : p.active && p.available && p.stock > 0 ? [{colour:'',size:'',stock:p.stock}] : [];
  S.matches = (p, filters = {}, query = '', internal = false) => {
    const c = filters.categories || [], sub = filters.subcategories || [], sizes = filters.sizes || [], colors = filters.colors || [];
    if (c.length && !c.includes(p.categoryId) && !c.includes(p.category)) return false;
    if (sub.length && !sub.includes(p.subcategoryId) && !sub.includes(p.subcategory)) return false;
    const rows = S.availableRows(p);
    // Size AND colour must match the same available variant. Values in each group are OR.
    if ((sizes.length || colors.length) && !rows.some(v => (!sizes.length || sizes.includes(v.size)) && (!colors.length || colors.includes(v.colour)))) return false;
    if (filters.availability === 'available' && !rows.length) return false;
    if (filters.availability === 'unavailable' && rows.length) return false;
    const q = words(query); if (!q) return true;
    const publicTerms = [p.name,p.category,p.subcategory,p.sku,p.id,...(p.keywords || [])];
    const terms = internal ? [...publicTerms,p.barcode,...(p.variants || []).flatMap(v => [v.barcode,v.colour,v.size,v.id])] : publicTerms;
    const exact = terms.some(t => words(t) === q);
    if (exact) return true;
    const text = words(terms.filter(Boolean).join(' '));
    return q.split(' ').every(token => text.includes(token));
  };
  S.enquiryMessage = (p, colour, size, quantity = 1, b2b = false) => [
    'Hello, I am interested in this product.', '', 'Product: ' + p.name, 'Product ID: ' + (p.sku || p.id),
    'Category: ' + p.category + (p.subcategory ? ' / ' + p.subcategory : ''),
    'Selected colour: ' + (colour || 'Not applicable'), 'Selected ' + (p.optionName || 'size') + ': ' + (size || 'Not applicable'),
    'Quantity: ' + Math.max(1, qty(quantity)), '', b2b ? 'Please send wholesale/B2B price.' : 'Please send the price and availability.'
  ].join('\n');
  S.getSession = role => {
    try {
      const value = JSON.parse(sessionStorage.getItem(S.KEYS.session) || 'null');
      const row = value && S.getAccounts().find(a => a.id === value.id && a.active && a.role === value.role && (a.authVersion || 0) === (value.authVersion || 0));
      return row && (!role || row.role === role) ? {id:row.id,role:row.role,name:row.name,username:row.username,business:row.business || '',authVersion:row.authVersion || 0} : null;
    } catch (_) { return null; }
  };
  S.requireRole = S.getSession;
  S.setSession = account => {
    const safe = account ? {id:account.id,role:account.role,name:account.name,username:account.username,business:account.business || '',authVersion:account.authVersion || 0} : null;
    safe ? sessionStorage.setItem(S.KEYS.session, JSON.stringify(safe)) : sessionStorage.removeItem(S.KEYS.session);
    return safe;
  };
  S.authorize = roles => {const a = S.getSession(); if (!a || !roles.includes(a.role)) throw new Error('Please sign in with an authorized account.'); return a;};
  S.saveProduct = value => {
    const actor = S.authorize(['admin','management']);
    if (value.customSection && actor.role !== 'admin') throw new Error('Only Admin can configure customization.');
    let p = normalize(value); p.id ||= uid('product');
    if (!p.name?.trim() || !p.sku?.trim()) throw new Error('Enter a product name and product ID.');
    const c = S.getCategories().find(c => c.id === p.categoryId);
    const sub = S.getSubcategories(p.categoryId).find(s => s.id === p.subcategoryId);
    if (!p.customSection && (!c || (p.subcategoryId && !sub))) throw new Error('Choose a valid category and subcategory.');
    if (c) p.category = c.name;
    if (sub) p.subcategory = sub.name;
    if (!p.customSection && !p.subcategoryId) p.subcategory = '';
    if (!p.image) throw new Error('Add a main product image.');
    if (!p.customSection && p.productType !== 'simple' && !p.variants.length) throw new Error('Add at least one option group.');
    const rows = S.getProducts(), others = rows.filter(x => String(x.id) !== String(p.id));
    if (others.some(x => words(x.sku) === words(p.sku))) throw new Error('Product ID already exists.');
    const combinations = p.variants.map(v => words(v.colour) + '|' + words(v.size));
    if (new Set(combinations).size !== combinations.length) throw new Error('Remove duplicate colour/option combinations.');
    const barcodes = p.barcodeEnabled ? [p.barcode,...p.variants.map(v => v.barcode)].map(words).filter(Boolean) : [];
    if (new Set(barcodes).size !== barcodes.length) throw new Error('Each barcode must identify just one product or variant.');
    const occupied = others.filter(x => x.barcodeEnabled).flatMap(x => [x.barcode,...x.variants.map(v => v.barcode)]).map(words).filter(Boolean);
    if (barcodes.some(b => occupied.includes(b))) throw new Error('This barcode is already used by another product.');
    p.b2bOnly = !p.customerVisible && p.b2bEnabled;
    S.save(S.KEYS.products, [...others,p], actor); return p;
  };
  S.adjustStock = (productId, variantId, delta) => {
    const actor = S.authorize(['admin','management','staff']);
    if (!Number.isSafeInteger(delta) || delta === 0) throw new Error('Enter a whole quantity greater than zero.');
    const products = S.getProducts(), p = products.find(p => String(p.id) === String(productId));
    if (!p || p.customSection) throw new Error('Product no longer exists.');
    const row = p.variants.length ? p.variants.find(v => String(v.id) === String(variantId)) : p;
    if (!row) throw new Error('Choose the exact variant.');
    if (delta < 0 && (!p.active || !p.available || row.available === false)) throw new Error('This item is unavailable for sale.');
    if (row.stock + delta < 0) throw new Error('Not enough stock. Available: ' + row.stock);
    row.stock += delta;
    if (p.variants.length) p.stock = p.variants.reduce((n, v) => n + v.stock, 0);
    S.save(S.KEYS.products, products);
    S.log(actor, `${delta < 0 ? 'Sold' : 'Added stock'} ${Math.abs(delta)} · ${p.sku} · ${row.colour || ''} ${row.size || ''} · balance ${row.stock}`);
    return row.stock;
  };
  S.saveAccount = a => {
    const actor = S.authorize(['admin']); const list = S.getAccounts();
    if (!['admin','management','staff','b2b'].includes(a.role)) throw new Error('Choose an account role.');
    a.username = String(a.username || '').trim(); a.name = String(a.name || '').trim();
    if (!a.username || !a.name || String(a.password || '').length < 6) throw new Error('Name, username and a password of at least 6 characters are required.');
    if (list.some(x => x.id !== a.id && words(x.username) === words(a.username))) throw new Error('That username is already in use.');
    const old = list.find(x => x.id === a.id);
    if (a.id === actor.id && (a.role !== 'admin' || !a.active)) throw new Error('You cannot suspend or change the role of your own admin account.');
    a.id ||= uid('account');
    a.authVersion = (old?.authVersion || 0) + (old && (old.password !== a.password || old.role !== a.role) ? 1 : 0);
    S.save(S.KEYS.accounts, [...list.filter(x => x.id !== a.id),a], actor);
    if (a.id === actor.id) S.setSession(a);
    return a;
  };
  S.saveCategory = (value, isSub = false) => {
    const actor = S.authorize(['admin']), key = isSub ? S.KEYS.subcategories : S.KEYS.categories;
    const rows = isSub ? S.getSubcategories() : S.getCategories(); const v = {...value, name:String(value.name || '').trim()};
    if (!v.name) throw new Error('Enter a name.');
    if (isSub && !S.getCategories().some(c => c.id === v.categoryId)) throw new Error('Select a parent category.');
    if (rows.some(x => x.id !== v.id && words(x.name) === words(v.name) && (!isSub || x.categoryId === v.categoryId))) throw new Error('That name already exists.');
    const old = rows.find(x => x.id === v.id); v.id ||= uid(isSub ? 'sub' : 'cat');
    if (!isSub) {v.subcategories = old?.subcategories || []; v.code ||= String(rows.length + 1).padStart(2,'0'); v.tone ||= 'paper';}
    S.save(key,[...rows.filter(x => x.id !== v.id),v],actor);
    if (old) {
      const products = S.getProducts();
      products.forEach(p => {if (isSub && (p.subcategoryId === old.id || p.categoryId === old.categoryId && p.subcategory === old.name)) {p.subcategory = v.name; p.subcategoryId = v.id; p.categoryId = v.categoryId; p.category = S.getCategories().find(c => c.id === v.categoryId).name;} else if (!isSub && (p.categoryId === old.id || p.category === old.name)) {p.category = v.name; p.categoryId = v.id;}});
      S.save(S.KEYS.products,products);
    }
    return v;
  };
  S.deleteCategory = (id, isSub) => {
    const actor = S.authorize(['admin']);
    const products = S.getProducts();
    if (products.some(p => isSub ? p.subcategoryId === id : p.categoryId === id)) throw new Error('Reassign products before deleting this ' + (isSub ? 'subcategory.' : 'category.'));
    if (!isSub && S.getSubcategories(id).length) throw new Error('Move or delete its subcategories first.');
    S.save(isSub ? S.KEYS.subcategories : S.KEYS.categories, (isSub ? S.getSubcategories() : S.getCategories()).filter(x => x.id !== id),actor);
  };
  // Run once, preserving v3 records, uploaded images and aggregate inventory.
  if (S.load(S.KEYS.schema, 0) < 7) {
    const categories = S.getCategories();
    const subs = categories.flatMap(c => (c.subcategories || []).map((name,i) => ({id:c.id+'-sub-'+i,categoryId:c.id,name,active:true,image:'',order:i})));
    S.save(S.KEYS.subcategories,subs);
    const products = S.getProducts().map(p => {const c = categories.find(c => c.name === p.category); return {...p,categoryId:c?.id || '',subcategoryId:subs.find(s => s.categoryId === c?.id && s.name === p.subcategory)?.id || ''};});
    const fabrics = S.getFabrics();
    ['Cotton','Polyester','Dry Fit','Premium Cotton','Uniform Fabric'].forEach((name,i) => {if (!fabrics.some(f => words(f.name) === words(name))) fabrics.push({id:'cloth-'+i,name,description:['Soft natural cotton','Durable everyday fabric','Lightweight performance fabric','Soft heavyweight cotton','Easy-care uniform fabric'][i],price:0,active:true});});
    const studio = products.find(p => p.customSection);
    if (studio) {if (!studio.allowedFabricIds.length) studio.allowedFabricIds = ['cloth-0','cloth-2','cloth-3'];
      [[4,'Custom Polo Studio'],[3,'Custom Shirt Studio'],[2,'Custom Jersey Studio']].forEach(([source,name],i) => {const base = products.find(p => p.id === source); if (base) products.push({...S.clone(base),id:901+i,sku:'OL-CUSTOM-00'+(i+2),name,customSection:true,customizable:true,productType:'simple',variants:[],colourOptions:[],stock:9999,customColourMode:'changeable',allowedFabricIds:['cloth-0','cloth-1','cloth-2','cloth-4'],customColorValues:Object.fromEntries(base.customizerColours.map(c => [c,S.colourValue(base,c)]))});});
    }
    const prints = S.getPrints(); if (!prints.some(p => p.id === 'vinyl')) prints.push({id:'vinyl',name:'Vinyl',price:150,textPrice:100,note:'Clean lettering and solid-colour logos.',active:true,lightOnly:false});
    const accounts = S.getAccounts(); if (!accounts.some(a => a.role === 'management')) accounts.push({id:'management-1',role:'management',name:'Store Management',username:'manager',password:'manager123',active:true});
    S.save(S.KEYS.products,products); S.save(S.KEYS.fabrics,fabrics); S.save(S.KEYS.prints,prints); S.save(S.KEYS.accounts,accounts); S.save(S.KEYS.schema,7);
  }

  const originalSave = S.save;
  S.save = (key, value, actor) => {
    if(actor && ['admin','management','staff'].includes(actor.role)) {
      const current=S.getSession(actor.role);
      if(!current || current.id!==actor.id) throw new Error('Your session expired or your account was suspended. Sign in again.');
      const adminOnly=[S.KEYS.accounts,S.KEYS.categories,S.KEYS.subcategories,S.KEYS.fabrics,S.KEYS.prints,S.KEYS.offers,S.KEYS.settings,S.KEYS.delivery];
      if(adminOnly.includes(key) && current.role!=='admin') throw new Error('Only Admin can change this setting.');
      if(key===S.KEYS.products && !['admin','management'].includes(current.role)) throw new Error('Use the stock desk to update staff stock.');
    }
    try{return originalSave(key,value,actor);}catch(e){if(e.name==='QuotaExceededError')throw new Error('Browser storage is full. Remove unused large images or export a backup before adding more.');throw e;}
  };


  S.commitOrder = (value, actor) => {
    if(actor?.role==='b2b')throw new Error('B2B orders use WhatsApp enquiries.');
    const products=S.getProducts(), items=S.clone(value.orderItems||[]), grouped=new Map();
    if(!items.length)throw new Error('No items selected.');
    items.forEach(item=>{
      if(!Number.isSafeInteger(item.qty)||item.qty<1)throw new Error('Enter valid whole quantities.');
      const p=products.find(p=>String(p.id)===String(item.productId));
      if(!p||!p.active||p.available===false)throw new Error('An item is no longer available.');
      if(item.custom){if(!p.customSection)throw new Error('Custom model is no longer available.');return;}
      if(p.askForPrice||p.enquiryOnly)throw new Error('This product requires a price enquiry.');
      const k=JSON.stringify([String(p.id),item.color||'',item.size||'']);
      const total=(grouped.get(k)?.qty||0)+item.qty;
      if(S.productStock(p,item.color,item.size)<total)throw new Error('Stock changed for '+p.name+'. Review your selection.');
      grouped.set(k,{p,colour:item.color,size:item.size,qty:total});
    });
    grouped.forEach(({p,colour,size,qty})=>{const row=p.variants.length?S.findVariant(p,colour,size):p;row.stock-=qty;if(p.variants.length)p.stock=p.variants.reduce((n,v)=>n+v.stock,0);});
    const orders=S.getOrders(),order={...value,id:S.uid('OL'),createdAt:new Date().toISOString(),orderItems:items,status:value.status||'Confirmed'};
    const previousProducts=localStorage.getItem(S.KEYS.products),previousOrders=localStorage.getItem(S.KEYS.orders);
    try {localStorage.setItem(S.KEYS.products,JSON.stringify(products));localStorage.setItem(S.KEYS.orders,JSON.stringify([order,...orders]));}
    catch(e){if(previousProducts==null)localStorage.removeItem(S.KEYS.products);else localStorage.setItem(S.KEYS.products,previousProducts);if(previousOrders==null)localStorage.removeItem(S.KEYS.orders);else localStorage.setItem(S.KEYS.orders,previousOrders);throw new Error('The order could not be saved. Your stock has not been changed.');}
    window.dispatchEvent(new CustomEvent('one-line-change',{detail:{key:S.KEYS.orders}}));
    return order;
  };

  S.repository = {mode:'local-demo',entities:['products','product_variants','product_images','categories','subcategories','customization_models','cloth_types','print_types','accounts','orders','stock_movements'],products:{list:S.getProducts,save:S.saveProduct},stock:{adjust:S.adjustStock},categories:{list:S.getCategories,save:S.saveCategory},subcategories:{list:S.getSubcategories},accounts:{list:S.getAccounts,save:S.saveAccount}};
  S.isLightColour = c => {const hex=S.palette[c]||c;if(/^#[0-9a-f]{6}$/i.test(hex)){const n=parseInt(hex.slice(1),16);return (((n>>16)&255)*.2126+((n>>8)&255)*.7152+(n&255)*.0722)>155;}return !S.darkColours.includes(c);};

  S.customizerPrintArea = (p, side) => {
    if(p.customPrintAreas?.[side])return p.customPrintAreas[side];
    if(side==='front')return {x:50,y:47,width:31,height:43,rotation:0};
    if(side==='back')return {x:50,y:47,width:33,height:45,rotation:0};
    const src=p.customizerSleeveImage||'';
    const area=/sports-jersey-sleeve/.test(src)?{x:68,y:34,width:14,height:20,rotation:-16}:/uniform-shirt-sleeve/.test(src)?{x:60,y:35,width:14,height:22,rotation:-7}:/polo-shirt-sleeve/.test(src)?{x:56,y:35,width:14,height:22,rotation:0}:{x:54,y:35,width:16,height:24,rotation:0};
    return side==='rightSleeve'?{...area,x:100-area.x,rotation:-area.rotation}:area;
  };
  S.printAreaStyle = a => `left:${a.x}%!important;top:${a.y}%!important;width:${a.width}%!important;height:${a.height}%!important;transform:translate(-50%,-50%) rotate(${a.rotation||0}deg)!important;`;
  const originalPreview=S.designPreview;
  S.designPreview=(design,side='front',cls)=>{let html=originalPreview(design,side,cls);const area=design.printAreas?.[side];if(area)html=html.replace(`class="garment-print-zone zone-${side}"`,`class="garment-print-zone zone-${side}" style="${S.printAreaStyle(area)}"`);return html;};

  S.uid = uid; S.normalizeProduct = normalize;
})();
