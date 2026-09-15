(function(){
  "use strict";
  const S=window.OneLineStore,I=S.icon,root=document.getElementById('app');
  const state={
    screen:'home',products:S.getProducts(),b2bProducts:S.getB2BProducts(),categories:S.getCategories(),cart:S.getCart(),orders:S.getOrders(),
    category:'All',subcategories:[],options:[],filterOpen:false,selected:null,color:'',size:'',subItem:false,subSize:'',menu:false,toast:'',
    checkout:false,details:{name:'',phone:'',address:'',business:''},delivery:'Courier',payment:'Cash on delivery',orderReference:'',
    b2bLogged:sessionStorage.getItem('one-line-b2b')==='1',b2bCategory:'All',b2bSubcategories:[],b2bOptions:[],b2bFilterOpen:false,
    customReturn:'home',editingCartKey:null,installPrompt:null
  };

  const legalCopy={
    'About':['One-Line creates custom apparel and supplies ready-made garments for individuals, teams, institutions and businesses.','Ready-made products are ordered as listed. For printing or personalization, use the custom designer or contact the team on WhatsApp.'],
    'Terms & Conditions':['Product colours may vary slightly by screen and production batch. Customized orders enter production after final design confirmation.','Customers are responsible for confirming artwork, spelling, sizes and quantities before placing the order.'],
    'Privacy Policy':['Customer details are used to prepare orders, arrange delivery and provide support.','Uploaded artwork remains attached only to the customer design/order data stored by this website.'],
    'Shipping & Returns':['Delivery method is selected during checkout. Dispatch depends on stock and production requirements.','Customized products cannot be returned after production begins unless defective or different from the approved order.']
  };

  const totalQty=()=>state.cart.reduce((n,x)=>n+Number(x.qty||0),0);
  const subtotal=()=>state.cart.reduce((n,x)=>n+Number(x.price||0)*Number(x.qty||0),0);
  const retailProducts=()=>state.products.filter(p=>p.audience!=='b2b');
  function logo(compact){return '<div class="brand" aria-label="One-Line"><img class="brand-mark" src="one-line-mark.svg" alt="">'+(compact?'':'<span class="brand-copy"><b>One-Line</b><small>CUSTOM APPAREL STUDIO</small></span>')+'</div>';}
  function showToast(text){state.toast=text;render();setTimeout(()=>{if(state.toast===text){state.toast='';render();}},2200);}
  function go(screen){state.screen=screen;state.menu=false;state.filterOpen=false;state.b2bFilterOpen=false;window.scrollTo({top:0,behavior:'smooth'});render();}
  function saveCart(){if(state.cart.length)localStorage.setItem('custom-store-cart',JSON.stringify(state.cart));else localStorage.removeItem('custom-store-cart');}
  function addCart(item,navigate){
    if(state.editingCartKey&&item.custom){const i=state.cart.findIndex(x=>x.key===state.editingCartKey);if(i>=0)state.cart[i]=Object.assign({},item,{key:state.editingCartKey});else state.cart.push(item);state.editingCartKey=null;}
    else state.cart.push(item);
    saveCart(); if(navigate)go('cart'); else showToast('Added to cart');
  }
  function allOptions(products,category){return [...new Set(products.filter(p=>category==='All'||p.category===category).flatMap(p=>S.availableOptions(p)).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));}
  function filteredRetail(){
    return retailProducts().filter(p=>{
      if(state.category!=='All'&&p.category!==state.category)return false;
      if(state.subcategories.length&&!state.subcategories.includes(p.subcategory))return false;
      if(state.options.length&&!state.options.some(o=>S.availableOptions(p).includes(o)))return false;
      return true;
    });
  }
  function filteredB2B(){
    return state.b2bProducts.filter(p=>{
      if(state.b2bCategory!=='All'&&p.category!==state.b2bCategory)return false;
      if(state.b2bSubcategories.length&&!state.b2bSubcategories.includes(p.subcategory))return false;
      if(state.b2bOptions.length&&!state.b2bOptions.some(o=>S.availableOptions(p).includes(o)))return false;
      return true;
    });
  }
  function openCategory(name){state.category=name;state.subcategories=[];state.options=[];go('catalog');}
  function openProduct(id){
    const p=retailProducts().find(x=>String(x.id)===String(id));if(!p)return;
    state.selected=S.normalizeProduct(p);state.color=state.selected.colors?.[0]||'';state.size=availableSizes(state.selected,state.color)[0]||state.selected.sizes?.[0]||'Default';state.subItem=false;state.subSize=state.selected.subItem?.sizes?.[0]||'';go('product');
  }
  function availableSizes(p,color){if(p.type==='Colour + Option'){const g=p.colorGroups?.find(x=>x.color===color)||p.colorGroups?.[0];return (g?.sizes||[]).map(x=>typeof x==='string'?x:x.value);}return S.availableOptions(p);}
  function productImage(p,color,size){return S.productImage(p,color,size);}
  function discount(p){return p.mrp&&p.price&&p.mrp>p.price?Math.round((p.mrp-p.price)/p.mrp*100):0;}

  function productCard(p){
    const d=discount(p);return '<article class="product-card modern-product-card" tabindex="0" data-open-product="'+S.esc(p.id)+'"><div class="product-image-wrap"><img src="'+S.esc(p.image)+'" alt="'+S.esc(p.name)+'" class="product-image" loading="lazy">'+(d?'<span class="discount-tag">-'+d+'%</span>':'')+'<button class="quick-add" data-open-product="'+S.esc(p.id)+'" aria-label="Open '+S.esc(p.name)+'">'+I('arrow')+'</button></div><div class="product-info"><p>'+S.esc(p.category)+' · '+S.esc(p.subcategory)+'</p><h3>'+S.esc(p.name)+'</h3><div class="price-row"><strong>'+S.money(p.price)+'</strong>'+(p.mrp?'<s>'+S.money(p.mrp)+'</s>':'')+'</div><div class="stock-line"><span></span>'+(Number(p.stock)>20?'Available now':'Limited stock · '+Number(p.stock||0)+' left')+'</div></div></article>';
  }
  function b2bCard(p){return '<article class="product-card modern-product-card b2b-card"><div class="product-image-wrap"><img src="'+S.esc(p.image)+'" alt="'+S.esc(p.name)+'" class="product-image" loading="lazy"></div><div class="product-info"><p>'+S.esc(p.category)+' · '+S.esc(p.subcategory)+'</p><h3>'+S.esc(p.name)+'</h3><div class="b2b-stock">Bulk availability · '+Number(p.stock||0)+' units</div><p class="b2b-desc">'+S.esc(p.description||'')+'</p><button class="whatsapp-enquiry" data-b2b-enquiry="'+S.esc(p.id)+'">'+I('whatsapp')+' Ask for price</button></div></article>';}

  function header(){
    return '<div class="announcement"><span>CUSTOM APPAREL · READY-MADE CATALOGUE</span><b>B2B SUPPLY AVAILABLE</b></div><header class="site-header"><button class="mobile-menu" data-action="menu" aria-label="Open menu">'+I('menu')+'</button><button class="logo-button" data-go="home">'+logo(false)+'</button><nav class="'+(state.menu?'open':'')+'"><button data-go="home">Home</button><button data-go="catalog" data-reset-category>Ready-made</button><button data-go="customize">Customize</button><button data-go="b2b">B2B</button><button data-go="orders">My orders</button><button data-legal="About">About</button><button class="nav-install" data-action="install">'+I('download')+' Install app</button></nav><div class="header-actions"><button class="b2b-header" data-go="b2b">'+I('lock')+'<span>'+(state.b2bLogged?'B2B catalogue':'B2B login')+'</span></button><button class="install-link" data-action="install" aria-label="Install app">'+I('download')+'<span>Install</span></button><button data-go="cart" class="bag-link">'+I('bag')+'<span>'+totalQty()+'</span></button></div></header>';
  }
  function footer(){return '<footer><div class="footer-main">'+logo(false)+'<p>Custom apparel, ready-made garments and B2B supply from one simple catalogue.</p><div><b>SHOP</b><button data-go="catalog">Ready-made</button><button data-go="customize">Customize T-shirt</button><button data-go="b2b">B2B catalogue</button></div><div><b>INFORMATION</b>'+Object.keys(legalCopy).map(x=>'<button data-legal="'+x+'">'+x+'</button>').join('')+'</div><div><b>PORTALS</b><a href="admin.html">Admin panel</a><a href="receiver.html">Order receiving</a></div></div><div class="footer-bottom"><span>© 2026 One-Line</span><span>Simple catalogue · Exact custom design · Fast enquiry</span></div></footer>';}
  function bottom(){return '<nav class="mobile-bottom"><button data-go="home" class="'+(state.screen==='home'?'active':'')+'">'+I('home')+'Home</button><button data-go="catalog" class="'+(['catalog','product'].includes(state.screen)?'active':'')+'">'+I('package')+'Ready</button><button data-go="customize">'+I('plus')+'Create</button><button data-go="b2b" class="'+(state.screen==='b2b'?'active':'')+'">'+I('lock')+'B2B</button><button data-go="cart" class="'+(state.screen==='cart'?'active':'')+'">'+I('bag')+'<i>'+totalQty()+'</i>Cart</button></nav>';}
  function whatsappFloat(){const pos=S.load('one-line-whatsapp-pos',null);return '<button class="floating-whatsapp" data-whatsapp-float aria-label="WhatsApp enquiry" '+(pos?'style="left:'+Number(pos.x)+'px;top:'+Number(pos.y)+'px;right:auto;bottom:auto"':'')+'>'+I('whatsapp')+'<span>Enquire</span></button>';}

  function home(){
    return '<main class="screen screen-enter"><section class="hero updated-hero"><div class="hero-copy"><span class="eyebrow">ONE STORE · TWO SIMPLE WAYS</span><h1>Make it yours.<br><em>Or order it ready.</em></h1><p>Build your own T-shirt design, or choose ready-made uniforms, jerseys, shirts and apparel from the catalogue.</p><div class="hero-actions"><button class="primary" data-go="customize">Customize a T-shirt '+I('arrow')+'</button><button class="secondary" data-go="catalog" data-reset-category>Shop ready-made</button></div><div class="hero-proof"><span>'+I('shield')+' Design saved while you shop</span><span>'+I('whatsapp')+' Fast customization enquiry</span></div></div><div class="hero-visual"><div class="hero-grid-label">CUSTOM T-SHIRT STUDIO</div><div class="hero-product-orbit"><div class="orbit-ring"></div><img src="assets/crew-tee.webp" alt="Custom T-shirt"><div class="hero-brand-badge"><img src="one-line-mark.svg" alt=""><span>CREATE YOUR OWN</span></div></div><div class="floating-tool tool-a">'+I('type')+'<span>Text</span></div><div class="floating-tool tool-b">'+I('image')+'<span>Image</span></div><div class="floating-tool tool-c">'+I('sparkle')+'<span>Print</span></div><button class="visual-cta" data-go="customize"><span>OPEN CUSTOMIZER</span>'+I('arrow')+'</button></div></section>'+categoriesSection()+'<section class="products-section section-wrap"><div class="section-heading"><div><span class="eyebrow">READY-MADE</span><h2>Popular catalogue items.</h2></div><button data-go="catalog" data-reset-category>View catalogue '+I('arrow')+'</button></div><div class="product-grid">'+retailProducts().slice(0,4).map(productCard).join('')+'</div></section><section class="bulk-banner section-wrap"><div><span>BUSINESS / RESELLER / BULK BUYING</span><h2>Need blank garments or bulk supply?</h2><p>Use the B2B login to view business-only items. Prices are shared only by enquiry.</p></div><button data-go="b2b">Open B2B '+I('arrow')+'</button></section></main>';
  }
  function categoriesSection(){
    const cats=state.categories;return '<section class="category-section section-wrap"><div class="section-heading"><div><span class="eyebrow">SHOP BY CATEGORY</span><h2>Choose what you need.</h2></div><button data-go="catalog" data-reset-category>All products '+I('arrow')+'</button></div><div class="category-grid">'+cats.map((c,i)=>'<button class="category-block '+S.esc(c.tone||['acid','ink','blue','clay','paper'][i%5])+'" data-category="'+S.esc(c.name)+'"><span class="category-code">'+S.esc(c.code||String(i+1).padStart(2,'0'))+'</span><div class="category-photo"><img src="'+S.esc(c.image||'assets/crew-tee.webp')+'" alt="'+S.esc(c.name)+'" loading="lazy"></div><div><h3>'+S.esc(c.name)+'</h3><p>'+S.esc(c.sub||'')+'</p></div>'+I('arrow')+'</button>').join('')+'</div></section>';
  }

  function filterPanel(mode){
    const isB2B=mode==='b2b',products=isB2B?state.b2bProducts:retailProducts(),category=isB2B?state.b2bCategory:state.category,subs=isB2B?state.b2bSubcategories:state.subcategories,opts=isB2B?state.b2bOptions:state.options;
    const subList=S.availableSubcategories(products,category),optionList=allOptions(products,category);
    return '<div class="catalog-filter-panel"><div class="filter-panel-head"><div><span>FILTER CATALOGUE</span><h3>Show only what matches</h3></div><button data-action="close-filters">'+I('close')+'</button></div><section><label>Category</label><div class="filter-chips"><button data-filter-category="All" data-filter-mode="'+mode+'" class="'+(category==='All'?'active':'')+'">All</button>'+state.categories.map(c=>'<button data-filter-category="'+S.esc(c.name)+'" data-filter-mode="'+mode+'" class="'+(category===c.name?'active':'')+'">'+S.esc(c.name)+'</button>').join('')+'</div></section>'+(subList.length?'<section><label>Subcategory</label><div class="filter-checks">'+subList.map(x=>'<label><input type="checkbox" data-filter-sub="'+S.esc(x)+'" data-filter-mode="'+mode+'" '+(subs.includes(x)?'checked':'')+'><span>'+S.esc(x)+'</span></label>').join('')+'</div></section>':'')+(optionList.length?'<section><label>Available size / option</label><div class="filter-checks compact">'+optionList.map(x=>'<label><input type="checkbox" data-filter-option="'+S.esc(x)+'" data-filter-mode="'+mode+'" '+(opts.includes(x)?'checked':'')+'><span>'+S.esc(x)+'</span></label>').join('')+'</div></section>':'')+'<div class="filter-panel-actions"><button data-action="clear-'+mode+'-filters">Clear</button><button class="primary" data-action="close-filters">Show products</button></div></div>';
  }

  function catalog(){
    const list=filteredRetail();return '<main class="catalog-page section-wrap screen screen-enter"><div class="catalog-title"><div><span class="eyebrow">READY-MADE CATALOGUE / '+String(list.length).padStart(2,'0')+'</span><h1>'+(state.category==='All'?'All ready-made items':S.esc(state.category))+'</h1><p>These products are sold ready-made. For custom printing or personalization, use the WhatsApp enquiry or the custom T-shirt designer.</p></div><button class="filter-button" data-action="toggle-filters">'+I('sliders')+' Filters <span>'+((state.subcategories.length+state.options.length)+(state.category==='All'?0:1))+'</span></button></div>'+(state.filterOpen?filterPanel('retail'):'')+(list.length?'<div class="product-grid catalog-grid">'+list.map(productCard).join('')+'</div>':'<div class="empty-state">'+I('filter')+'<h2>No items match these filters</h2><p>Clear one or more filters to see products.</p><button data-action="clear-retail-filters">Clear filters</button></div>')+'</main>';
  }

  function product(){
    const p=state.selected;if(!p)return catalog();const sizes=availableSizes(p,state.color);if(sizes.length&&!sizes.includes(state.size))state.size=sizes[0];const image=productImage(p,state.color,state.size),price=Number(p.price||0)+(state.subItem?Number(p.subItem?.price||0):0);
    return '<main class="product-page section-wrap screen screen-enter"><button class="back-button" data-go="catalog">'+I('back')+' Back to catalogue</button><div class="product-detail"><div class="product-detail-image"><img src="'+S.esc(image)+'" alt="'+S.esc(p.name)+'"></div><div class="product-detail-copy"><span class="eyebrow">'+S.esc(p.category)+' / '+S.esc(p.subcategory)+'</span><h1>'+S.esc(p.name)+'</h1><div class="detail-price"><strong>'+S.money(price)+'</strong>'+(p.mrp?'<s>'+S.money(p.mrp)+'</s>':'')+'<span>tax included</span></div><p>'+S.esc(p.description)+'</p>'+(p.colors?.length?'<div class="selection-block"><label>Choose colour <b>'+S.esc(state.color)+'</b></label><div class="colour-options">'+p.colors.map(c=>'<button class="'+(state.color===c?'active':'')+'" data-product-color="'+S.esc(c)+'"><span style="background:'+(S.palette[c]||c)+'"></span>'+S.esc(c)+'</button>').join('')+'</div></div>':'')+'<div class="selection-block"><label>'+(p.optionTitle?S.esc(p.optionTitle):'Choose size')+' <b>'+S.esc(state.size)+'</b></label><div class="size-options">'+sizes.map(v=>'<button class="'+(state.size===v?'active':'')+'" data-product-size="'+S.esc(v)+'">'+S.esc(v)+'</button>').join('')+'</div></div>'+(p.subItem?'<div class="subitem-box"><label><input data-subitem type="checkbox" '+(state.subItem?'checked':'')+'><span><b>Add '+S.esc(p.subItem.name)+'</b><small>Optional matching item</small></span><strong>+'+S.money(p.subItem.price)+'</strong></label>'+(state.subItem?'<div class="size-options compact">'+p.subItem.sizes.map(v=>'<button class="'+(state.subSize===v?'active':'')+'" data-sub-size="'+S.esc(v)+'">'+S.esc(v)+'</button>').join('')+'</div>':'')+'</div>':'')+'<div class="ready-made-notice"><b>Ready-made item</b><span>Customer customization is not enabled on this product. Contact us if you want printing, logo, name or other changes.</span></div><div class="detail-actions-row"><button class="primary detail-add" data-action="add-product">Add to cart '+I('bag')+'</button><button class="whatsapp-enquiry outline" data-product-enquiry="'+S.esc(p.id)+'">'+I('whatsapp')+' Contact to customize</button></div><div class="detail-assurance"><span>'+I('shield')+' Quality checked</span><span>'+I('package')+' Colour image follows selected colour</span><span>'+I('truck')+' Flexible delivery</span></div></div></div></main>';
  }

  function cartItem(item){
    const thumb=item.customDesign?S.designPreview(item.customDesign,'front','cart-design-preview'):'<img src="'+S.esc(item.image||'assets/crew-tee.webp')+'" alt="">';
    return '<article class="cart-item">'+thumb+'<div class="cart-item-info"><span>'+(item.custom?'CUSTOM DESIGN':'READY-MADE')+'</span><h3>'+S.esc(item.name)+'</h3><p>'+[item.color,item.size,item.detail].filter(Boolean).map(S.esc).join(' · ')+'</p>'+(item.customDesign?'<small class="design-spec">'+S.esc(item.customDesign.printType)+' · '+S.designedSurfaces(item.customDesign).length+' print area'+(S.designedSurfaces(item.customDesign).length===1?'':'s')+'</small>':'')+'<strong>'+S.money(item.price)+'</strong>'+(item.custom?'<button class="edit-custom-link" data-edit-custom="'+S.esc(item.key)+'">'+I('edit')+' Edit design</button>':'')+'</div><div class="qty-control"><button data-qty="-1" data-key="'+S.esc(item.key)+'">'+I('minus')+'</button><span>'+item.qty+'</span><button data-qty="1" data-key="'+S.esc(item.key)+'">'+I('plus')+'</button></div><button class="cart-remove" data-remove-cart="'+S.esc(item.key)+'">'+I('trash')+'</button></article>';
  }
  function cart(){
    if(!state.cart.length)return '<main class="cart-page section-wrap screen screen-enter"><div class="empty-state cart-empty">'+I('bag')+'<h1>Your cart is empty</h1><p>Your custom design draft is still saved. You can return to it without starting again.</p><div class="empty-actions"><button class="primary" data-go="customize" data-custom-return="cart">Continue custom design</button><button data-go="catalog">Ready-made catalogue</button></div></div></main>';
    return '<main class="cart-page section-wrap screen screen-enter"><div class="cart-heading"><div><span class="eyebrow">YOUR ORDER</span><h1>Cart <sup>'+totalQty()+'</sup></h1></div><button data-go="catalog">Continue shopping</button></div><div class="cart-layout"><section class="cart-list">'+state.cart.map(cartItem).join('')+'</section><aside class="cart-summary"><span>ORDER SUMMARY</span><div><p>Subtotal <b>'+S.money(subtotal())+'</b></p><p>Delivery <b>Confirmed at checkout</b></p></div><strong><small>TOTAL</small>'+S.money(subtotal())+'</strong><button class="primary wide" data-action="open-checkout">Order now '+I('arrow')+'</button><button class="secondary wide" data-go="customize" data-custom-return="cart">Continue customising</button><small>Your custom design is cached and will not reset when you return from this cart.</small></aside></div>'+(state.checkout?checkoutDrawer():'')+'</main>';
  }

  function checkoutDrawer(){
    const delivery=S.getDelivery().filter(x=>x.active);return '<div class="overlay checkout-overlay"><aside class="checkout-drawer"><div class="drawer-head"><div><span>CHECKOUT</span><h2>Place your order</h2></div><button data-action="close-checkout">'+I('close')+'</button></div><div class="checkout-form"><label>Name<input data-detail="name" value="'+S.esc(state.details.name)+'" placeholder="Your name"></label><label>Phone<input data-detail="phone" value="'+S.esc(state.details.phone)+'" placeholder="Mobile number"></label><label>Business / team <small>optional</small><input data-detail="business" value="'+S.esc(state.details.business)+'" placeholder="Business or team name"></label><label>Delivery address<textarea data-detail="address" placeholder="Full delivery address">'+S.esc(state.details.address)+'</textarea></label><div class="checkout-choice"><span>Delivery</span>'+delivery.map(d=>'<label><input type="radio" name="delivery" data-delivery="'+S.esc(d.name)+'" '+(state.delivery===d.name?'checked':'')+'><b>'+S.esc(d.name)+'</b><small>'+S.esc(d.note)+'</small></label>').join('')+'</div><div class="checkout-choice"><span>Payment</span>'+['Cash on delivery','Pay after confirmation'].map(p=>'<label><input type="radio" name="payment" data-payment="'+p+'" '+(state.payment===p?'checked':'')+'><b>'+p+'</b></label>').join('')+'</div><div class="checkout-total"><span>Total</span><strong>'+S.money(subtotal())+'</strong></div><button class="primary wide" data-action="place-order">Confirm order '+I('arrow')+'</button></div></aside></div>';
  }

  function orders(){
    const orders=S.getOrders().filter(o=>Array.isArray(o.orderItems)&&o.orderItems.length);return '<main class="orders-page section-wrap screen screen-enter"><div class="catalog-title"><div><span class="eyebrow">ORDER HISTORY</span><h1>My orders</h1></div></div>'+(orders.length?'<div class="customer-orders">'+orders.map(o=>'<article><div><span>'+S.esc(o.status)+'</span><h3>#'+S.esc(o.id)+'</h3><p>'+S.esc(o.time)+' · '+o.items+' items · '+S.esc(o.delivery)+'</p></div><strong>'+S.money(o.total)+'</strong></article>').join('')+'</div>':'<div class="empty-state">'+I('orders')+'<h2>No orders yet</h2><p>Your confirmed website orders will appear here.</p><button data-go="catalog">Browse products</button></div>')+'</main>';
  }

  function b2b(){
    if(!state.b2bLogged)return '<main class="b2b-login-page screen screen-enter"><section class="b2b-login-card"><div class="b2b-login-art"><span>B2B</span><h1>Business catalogue</h1><p>For resellers, printers, teams and bulk buyers. Product prices are not displayed; use Ask for Price for a WhatsApp enquiry.</p></div><form data-b2b-login><span class="eyebrow">BUSINESS ACCESS</span><h2>Login to continue</h2><label>Login ID<input name="login" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p class="login-error" data-login-error></p><button class="primary wide" type="submit">Open B2B catalogue '+I('arrow')+'</button><button type="button" data-go="home">Back to customer site</button></form></section></main>';
    const list=filteredB2B();return '<main class="catalog-page b2b-page section-wrap screen screen-enter"><div class="catalog-title"><div><span class="eyebrow">B2B ONLY / '+String(list.length).padStart(2,'0')+'</span><h1>Business supply</h1><p>Business-only items are separate from the customer catalogue. Rates are shared through enquiry only.</p></div><div class="catalog-title-actions"><button class="filter-button" data-action="toggle-b2b-filters">'+I('sliders')+' Filters <span>'+((state.b2bSubcategories.length+state.b2bOptions.length)+(state.b2bCategory==='All'?0:1))+'</span></button><button data-action="b2b-logout">Logout</button></div></div>'+(state.b2bFilterOpen?filterPanel('b2b'):'')+(list.length?'<div class="product-grid catalog-grid">'+list.map(b2bCard).join('')+'</div>':'<div class="empty-state">'+I('filter')+'<h2>No B2B items match</h2><p>Clear the filters to see more business products.</p><button data-action="clear-b2b-filters">Clear filters</button></div>')+'</main>';
  }

  function legalModal(){if(!state.legal)return '';return '<div class="overlay legal-overlay"><section class="legal-card"><button data-action="close-legal">'+I('close')+'</button><span>ONE-LINE</span><h2>'+S.esc(state.legal)+'</h2>'+legalCopy[state.legal].map(x=>'<p>'+S.esc(x)+'</p>').join('')+'</section></div>';}
  function success(){return '<main class="success-page"><div class="success-icon">'+I('check')+'</div><span>ORDER CONFIRMED</span><h1>Thank you.</h1><p>Your order reference is <b>#'+S.esc(state.orderReference)+'</b>. The production/order team can now see the exact custom artwork saved with the order.</p><div><button class="primary" data-go="orders">My orders</button><button data-go="home">Back home</button></div></main>';}

  let designerInstance=null;
  function render(){
    state.products=S.getProducts();state.b2bProducts=S.getB2BProducts();state.categories=S.getCategories();state.cart=S.getCart();state.orders=S.getOrders();
    if(designerInstance){designerInstance.destroy?.();designerInstance=null;}
    if(state.screen==='customize'){
      root.innerHTML='<div id="designer-mount"></div>';const mount=root.querySelector('#designer-mount');
      designerInstance=window.OneLineDesigner.mount(mount,{onBack(){go(state.customReturn||'home');},onAdd(item){addCart(item,true);}});return;
    }
    const pages={home,catalog,product,cart,orders,b2b,success};const content=(pages[state.screen]||home)();
    const noChrome=['success'].includes(state.screen);root.innerHTML=(noChrome?'':header())+content+(noChrome?'':footer()+bottom()+whatsappFloat())+legalModal()+(state.toast?'<div class="toast">'+S.esc(state.toast)+'</div>':'');bind();
  }

  function enquiryForProduct(p,b2b){return (b2b?'B2B price enquiry':'Customization enquiry')+'\nProduct: '+p.name+'\nCategory: '+p.category+'\nSubcategory: '+p.subcategory+(b2b?'\nPlease share price and minimum order quantity.':'\nI want to customize this item. Please share the options and price.');}
  function openWhatsApp(message){window.open(S.whatsappUrl(message),'_blank','noopener');}
  function setDraftFromCart(item){
    if(!item?.customDesign)return;const d=item.customDesign;S.save('custom-store-designer-draft',{modelName:d.model,color:d.garmentColor,size:item.size,qty:item.qty,surface:'front',designs:d.surfaceDesigns||{front:S.surfaceDesign(d,'front'),back:S.surfaceDesign(d,'back'),rightSleeve:S.surfaceDesign(d,'rightSleeve'),leftSleeve:S.surfaceDesign(d,'leftSleeve')},printType:d.printType});
  }
  function placeOrder(){
    if(!state.details.name.trim()||!state.details.phone.trim()||!state.details.address.trim()){showToast('Enter name, phone and delivery address');return;}
    const id='OL-'+String(Date.now()).slice(-6),order={id,customer:state.details.name.trim(),phone:state.details.phone.trim(),total:subtotal(),items:totalQty(),delivery:state.delivery,payment:state.payment,status:'Confirmed',time:'Just now',address:state.details.address.trim(),business:state.details.business.trim(),orderItems:S.clone(state.cart)};
    localStorage.setItem('custom-store-orders',JSON.stringify([order,...S.getOrders()]));state.orderReference=id;state.cart=[];localStorage.removeItem('custom-store-cart');localStorage.removeItem('custom-store-designer-draft');state.checkout=false;state.screen='success';render();
  }

  function bindWhatsappDrag(){
    const btn=root.querySelector('[data-whatsapp-float]');if(!btn)return;let gesture=null;
    btn.addEventListener('pointerdown',e=>{e.preventDefault();const r=btn.getBoundingClientRect();gesture={id:e.pointerId,startX:e.clientX,startY:e.clientY,left:r.left,top:r.top,moved:false};btn.setPointerCapture(e.pointerId);});
    btn.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.startX,dy=e.clientY-gesture.startY;if(Math.hypot(dx,dy)>5)gesture.moved=true;const w=btn.offsetWidth,h=btn.offsetHeight,x=Math.max(8,Math.min(innerWidth-w-8,gesture.left+dx)),y=Math.max(8,Math.min(innerHeight-h-8,gesture.top+dy));btn.style.left=x+'px';btn.style.top=y+'px';btn.style.right='auto';btn.style.bottom='auto';});
    btn.addEventListener('pointerup',e=>{if(!gesture)return;const moved=gesture.moved;if(moved){const r=btn.getBoundingClientRect();S.save('one-line-whatsapp-pos',{x:Math.round(r.left),y:Math.round(r.top)});}gesture=null;if(!moved)openWhatsApp('Hello, I need help with an apparel order or customization.');});
    btn.addEventListener('pointercancel',()=>{gesture=null;});
  }

  function bind(){
    root.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.resetCategory!==undefined){state.category='All';state.subcategories=[];state.options=[];}if(el.dataset.customReturn)state.customReturn=el.dataset.customReturn;if(el.dataset.go==='customize'&&!el.dataset.customReturn)state.customReturn=state.screen==='cart'?'cart':'home';go(el.dataset.go);}));
    root.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>openCategory(el.dataset.category)));
    root.querySelectorAll('[data-open-product]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openProduct(el.dataset.openProduct);}));
    root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>{
      const a=el.dataset.action;
      if(a==='menu'){state.menu=!state.menu;render();}
      else if(a==='install'){if(state.installPrompt){state.installPrompt.prompt();state.installPrompt.userChoice.finally(()=>{state.installPrompt=null;});}else showToast('Install from your browser menu if the install button is not shown.');}
      else if(a==='toggle-filters'){state.filterOpen=!state.filterOpen;render();}
      else if(a==='toggle-b2b-filters'){state.b2bFilterOpen=!state.b2bFilterOpen;render();}
      else if(a==='close-filters'){state.filterOpen=false;state.b2bFilterOpen=false;render();}
      else if(a==='clear-retail-filters'){state.category='All';state.subcategories=[];state.options=[];render();}
      else if(a==='clear-b2b-filters'){state.b2bCategory='All';state.b2bSubcategories=[];state.b2bOptions=[];render();}
      else if(a==='open-checkout'){state.checkout=true;render();}
      else if(a==='close-checkout'){state.checkout=false;render();}
      else if(a==='place-order')placeOrder();
      else if(a==='close-legal'){state.legal='';render();}
      else if(a==='add-product'){
        const p=state.selected,price=Number(p.price||0)+(state.subItem?Number(p.subItem?.price||0):0),detail=(state.subItem?p.subItem.name+' '+state.subSize:'');
        addCart({key:'retail-'+Date.now(),name:p.name,price,qty:1,color:state.color,size:state.size,detail,image:productImage(p,state.color,state.size),custom:false,productId:p.id},false);
      }
      else if(a==='b2b-logout'){sessionStorage.removeItem('one-line-b2b');state.b2bLogged=false;render();}
    }));
    root.querySelectorAll('[data-legal]').forEach(el=>el.addEventListener('click',()=>{state.legal=el.dataset.legal;render();}));
    root.querySelectorAll('[data-product-color]').forEach(el=>el.addEventListener('click',()=>{state.color=el.dataset.productColor;const sizes=availableSizes(state.selected,state.color);if(!sizes.includes(state.size))state.size=sizes[0]||'';render();}));
    root.querySelectorAll('[data-product-size]').forEach(el=>el.addEventListener('click',()=>{state.size=el.dataset.productSize;render();}));
    root.querySelectorAll('[data-sub-size]').forEach(el=>el.addEventListener('click',()=>{state.subSize=el.dataset.subSize;render();}));
    const sub=root.querySelector('[data-subitem]');if(sub)sub.addEventListener('change',()=>{state.subItem=sub.checked;render();});
    root.querySelectorAll('[data-filter-category]').forEach(el=>el.addEventListener('click',()=>{const mode=el.dataset.filterMode;if(mode==='b2b'){state.b2bCategory=el.dataset.filterCategory;state.b2bSubcategories=[];state.b2bOptions=[];}else{state.category=el.dataset.filterCategory;state.subcategories=[];state.options=[];}render();}));
    root.querySelectorAll('[data-filter-sub]').forEach(el=>el.addEventListener('change',()=>{const arr=el.dataset.filterMode==='b2b'?state.b2bSubcategories:state.subcategories;const v=el.dataset.filterSub;if(el.checked&&!arr.includes(v))arr.push(v);if(!el.checked){const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);}render();}));
    root.querySelectorAll('[data-filter-option]').forEach(el=>el.addEventListener('change',()=>{const arr=el.dataset.filterMode==='b2b'?state.b2bOptions:state.options;const v=el.dataset.filterOption;if(el.checked&&!arr.includes(v))arr.push(v);if(!el.checked){const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);}render();}));
    root.querySelectorAll('[data-qty]').forEach(el=>el.addEventListener('click',()=>{const item=state.cart.find(x=>x.key===el.dataset.key);if(!item)return;item.qty=Math.max(1,Number(item.qty)+Number(el.dataset.qty));saveCart();render();}));
    root.querySelectorAll('[data-remove-cart]').forEach(el=>el.addEventListener('click',()=>{state.cart=state.cart.filter(x=>x.key!==el.dataset.removeCart);saveCart();render();}));
    root.querySelectorAll('[data-edit-custom]').forEach(el=>el.addEventListener('click',()=>{const item=state.cart.find(x=>x.key===el.dataset.editCustom);if(!item)return;setDraftFromCart(item);state.editingCartKey=item.key;state.customReturn='cart';go('customize');}));
    root.querySelectorAll('[data-detail]').forEach(el=>el.addEventListener('input',()=>{state.details[el.dataset.detail]=el.value;}));
    root.querySelectorAll('[data-delivery]').forEach(el=>el.addEventListener('change',()=>{state.delivery=el.dataset.delivery;}));
    root.querySelectorAll('[data-payment]').forEach(el=>el.addEventListener('change',()=>{state.payment=el.dataset.payment;}));
    root.querySelectorAll('[data-product-enquiry]').forEach(el=>el.addEventListener('click',()=>{const p=retailProducts().find(x=>String(x.id)===String(el.dataset.productEnquiry));if(p)openWhatsApp(enquiryForProduct(p,false));}));
    root.querySelectorAll('[data-b2b-enquiry]').forEach(el=>el.addEventListener('click',()=>{const p=state.b2bProducts.find(x=>String(x.id)===String(el.dataset.b2bEnquiry));if(p)openWhatsApp(enquiryForProduct(p,true));}));
    const b2bLogin=root.querySelector('[data-b2b-login]');if(b2bLogin)b2bLogin.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(b2bLogin),settings=S.getSettings();if(String(fd.get('login')).trim()===String(settings.b2bLoginId)&&String(fd.get('password'))===String(settings.b2bPassword)){sessionStorage.setItem('one-line-b2b','1');state.b2bLogged=true;render();}else{const error=root.querySelector('[data-login-error]');if(error)error.textContent='Incorrect login ID or password.';}});
    bindWhatsappDrag();
  }

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;});
  window.addEventListener('storage',()=>render());window.addEventListener('one-line-change',()=>{if(state.screen!=='customize')render();});
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  render();
})();
