(function(){
  "use strict";
  const S=window.OneLineStore,I=S.icon,root=document.getElementById('app');
  const clone=v=>typeof structuredClone==="function"?structuredClone(v):JSON.parse(JSON.stringify(v));
  const state={
    screen:'home',products:S.getProducts(),categories:S.getCategories(),cart:S.getCart(),orders:S.getOrders(),settings:S.getSettings(),
    filterCategories:[],filterSubs:[],filterOptions:[],filterOpen:false,filterDraft:null,selected:null,previewImage:'',color:'',size:'',subItem:false,subColor:'',subSize:'',menu:false,
    toast:'',legal:'',checkoutStep:1,details:{name:'',phone:'',address:'',business:''},delivery:'Courier',payment:'Cash on delivery',paymentDemo:false,
    orderPlaced:false,orderReference:'',installPrompt:null,zoomImage:'',zoomAlt:'',zoomImages:[],zoomIndex:0,zoomScale:1,zoomX:0,zoomY:0,b2bAuthed:sessionStorage.getItem('one-line-b2b-auth')==='1',b2bError:''
  };
  const filterKey='one-line-catalog-filters-v1';
  try{const saved=JSON.parse(localStorage.getItem(filterKey)||'null');if(saved){state.filterCategories=Array.isArray(saved.categories)?saved.categories:[];state.filterSubs=Array.isArray(saved.subs)?saved.subs:[];state.filterOptions=Array.isArray(saved.options)?saved.options:[];}}catch(_){}
  const legalCopy={
    'About':['One-Line combines a dedicated custom apparel designer with a separate ready-made catalogue. Ready-made products are ordered as listed; custom work is handled through the designer or enquiry.','B2B items are kept separate from the customer catalogue and do not publish wholesale prices.'],
    'Terms & Conditions':['Product colours may vary slightly across screens and production batches. Customized orders enter production only after the selected design and order details are confirmed.','Customers are responsible for confirming spelling, artwork placement, sizes and quantities before approval.'],
    'Privacy Policy':['Customer details are used only to prepare the order, arrange delivery and provide support.','Uploaded design files belong to the customer and should contain only material they have permission to reproduce.'],
    'Shipping & Returns':['Delivery methods and charges are confirmed during checkout or enquiry. Dispatch timing depends on stock and customization quantity.','Customized and printed items cannot be returned after production begins unless defective or different from the approved design.']
  };
  const WHATSAPP_LOGO='https://upload.wikimedia.org/wikipedia/commons/4/4c/WhatsApp_Logo_green.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original';
  const whatsappLogo=()=>'<img class="whatsapp-logo" src="'+WHATSAPP_LOGO+'" alt="" aria-hidden="true">';

  const totalQty=()=>state.cart.reduce((n,x)=>n+Number(x.qty||0),0);
  const subtotal=()=>state.cart.reduce((n,x)=>n+Number(x.price||0)*Number(x.qty||0),0);
  const retailProducts=()=>state.products.filter(p=>(p.audience||'retail')!=='b2b');
  const b2bProducts=()=>state.products.filter(p=>p.audience==='b2b');
  const img=(src,alt,cls,fallback)=>'<img src="'+S.esc(src||fallback||'assets/crew-tee.webp')+'" alt="'+S.esc(alt||'')+'" class="'+S.esc(cls||'')+'" loading="lazy" onerror="this.onerror=null;this.src=\''+S.esc(fallback||'assets/crew-tee.webp')+'\'">';
  function logo(compact){return '<div class="brand" aria-label="One-Line"><img class="brand-mark" src="one-line-mark.svg" alt="">'+(compact?'':'<span class="brand-copy"><b>One-Line</b><small>CUSTOM APPAREL STUDIO</small></span>')+'</div>';}
  function showToast(text){state.toast=text;render();setTimeout(()=>{if(state.toast===text){state.toast='';render();}},2200);}
  function rememberScroll(){
    try{if(history.state?.oneLine)history.replaceState({...history.state,scrollY:window.scrollY},'',location.href);}catch(_){}
  }
  function go(screen,options){
    options=options||{};
    state.menu=false;state.filterOpen=false;state.filterDraft=null;
    if(screen===state.screen&&!options.force){window.scrollTo(0,0);render();return;}
    rememberScroll();state.screen=screen;
    if(!options.fromHistory){try{history.pushState({oneLine:true,oneLineGuard:true,screen,scrollY:0},'',location.pathname+location.search+'#'+screen);}catch(_){}}
    window.scrollTo(0,0);render();
  }
  function navigateBack(fallback){
    if(state.screen==='home'){window.scrollTo(0,0);return;}
    if(history.state?.oneLine){history.back();return;}
    go(fallback||'home');
  }
  function saveCart(){if(state.cart.length)S.save('custom-store-cart-v3',state.cart);else localStorage.removeItem('custom-store-cart-v3');}
  function addCart(item,navigate){state.cart.push(item);saveCart();if(navigate)go('cart');else showToast('Added to your cart');}
  function optionValues(p){return S.productOptions(p);}
  function filterPool(audience){return audience==='b2b'?b2bProducts():retailProducts();}
  function filtered(audience){
    return filterPool(audience).filter(p=>{
      if(state.filterCategories.length&&!state.filterCategories.includes(p.category))return false;
      if(state.filterSubs.length&&!state.filterSubs.includes(p.subcategory))return false;
      if(state.filterOptions.length&&!optionValues(p).some(v=>state.filterOptions.includes(v)))return false;
      return true;
    });
  }
  function filterChoices(audience){
    const pool=filterPool(audience);
    const cats=[...new Set(pool.map(p=>p.category).filter(Boolean))];
    const scopedCat=state.filterDraft?.categories?.length?state.filterDraft.categories:state.filterCategories;
    const catPool=scopedCat.length?pool.filter(p=>scopedCat.includes(p.category)):pool;
    const subs=[...new Set(catPool.map(p=>p.subcategory).filter(Boolean))].sort();
    const scopedSubs=state.filterDraft?.subs?.length?state.filterDraft.subs:state.filterSubs;
    const subPool=scopedSubs.length?catPool.filter(p=>scopedSubs.includes(p.subcategory)):catPool;
    const options=[...new Set(subPool.flatMap(optionValues).filter(Boolean))];
    return{cats,subs,options};
  }
  function saveFilters(){try{localStorage.setItem(filterKey,JSON.stringify({categories:state.filterCategories,subs:state.filterSubs,options:state.filterOptions}));}catch(_){}}
  function shareUrl(kind,value,extra){
    const url=new URL(location.href);url.searchParams.delete('product');url.searchParams.delete('category');url.searchParams.delete('subcategory');url.searchParams.delete('audience');
    if(kind==='product'){url.searchParams.set('product',String(value));if(extra==='b2b')url.searchParams.set('audience','b2b');url.hash=extra==='b2b'?'b2bProduct':'product';}
    else if(kind==='category'){url.searchParams.set('category',String(value));url.hash='catalog';}
    else if(kind==='subcategory'){if(extra)url.searchParams.set('category',String(extra));url.searchParams.set('subcategory',String(value));url.hash='catalog';}
    else{url.hash='catalog';}
    return url.toString();
  }
  async function shareItem(kind,value,label,extra){
    const url=shareUrl(kind,value,extra),title=label||'One-Line catalogue';
    try{if(navigator.share){await navigator.share({title,text:title,url});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);showToast('Share link copied');return;}}catch(err){if(err?.name==='AbortError')return;}
    try{const ta=document.createElement('textarea');ta.value=url;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast('Share link copied');}catch(_){showToast('Copy this page URL to share');}
  }
  function resetFilters(category){state.filterCategories=category&&category!=='All'?[category]:[];state.filterSubs=[];state.filterOptions=[];saveFilters();}
  function commitFilterDraft(){if(!state.filterDraft)return;state.filterCategories=clone(state.filterDraft.categories||[]);state.filterSubs=clone(state.filterDraft.subs||[]);state.filterOptions=clone(state.filterDraft.options||[]);saveFilters();}
  function closeFilter(applyDraft){if(applyDraft===true)commitFilterDraft();state.filterOpen=false;state.filterDraft=null;render();}
  function openProduct(id,audience){
    const p=state.products.find(x=>String(x.id)===String(id));if(!p)return;
    state.selected=p;state.previewImage='';state.color=p.colors?.[0]||p.colorVariants?.[0]?.color||'';
    const sizes=state.color?p.colorVariants?.find(v=>v.color===state.color)?.sizes:p.sizes;state.size=(sizes||p.sizes||[])[0]||'';
    state.subItem=false;state.subColor=p.subItem?.colors?.[0]||p.subItem?.colorVariants?.[0]?.color||'';
    const subSizes=state.subColor?p.subItem?.colorVariants?.find(v=>String(v.color).toLowerCase()===String(state.subColor).toLowerCase())?.sizes:p.subItem?.sizes;
    state.subSize=(subSizes||p.subItem?.sizes||[])[0]||'';
    go(audience==='b2b'?'b2bProduct':'product');
  }
  function selectedProductImage(p){return state.previewImage||(state.color?S.productImageForColor(p,state.color):(p.images?.[0]||p.image));}
  function currentSizes(p){const row=p.colorVariants?.find(v=>String(v.color).toLowerCase()===String(state.color).toLowerCase());return row?.sizes?.length?row.sizes:(p.sizes||[]);}
  function currentSubSizes(p){const sub=p?.subItem;if(!sub)return[];const row=sub.colorVariants?.find(v=>String(v.color).toLowerCase()===String(state.subColor).toLowerCase());return row?.sizes?.length?row.sizes:(sub.sizes||[]);}
  function currentSubImage(p){const sub=p?.subItem;if(!sub)return'';const row=sub.colorVariants?.find(v=>String(v.color).toLowerCase()===String(state.subColor).toLowerCase());return row?.image||sub.image||sub.images?.[0]||p.image||'assets/crew-tee.webp';}
  function productImages(p){
    if(!p)return ['assets/crew-tee.webp'];
    const images=[p.image,...(Array.isArray(p.images)?p.images:[]),...(Array.isArray(p.colorVariants)?p.colorVariants.map(v=>v&&v.image):[])].filter(Boolean);
    return [...new Set(images)].slice(0,10);
  }
  function productGallery(p){const preferred=state.color?S.productImageForColor(p,state.color):selectedProductImage(p);return [...new Set([preferred,...productImages(p)].filter(Boolean))];}
  function resetZoomState(){state.zoomImage='';state.zoomAlt='';state.zoomImages=[];state.zoomIndex=0;state.zoomScale=1;state.zoomX=0;state.zoomY=0;}
  function openZoom(src,alt){
    const gallery=state.selected?productGallery(state.selected):[src];
    const images=(gallery||[]).filter(Boolean);let index=Math.max(0,images.indexOf(src));if(index<0)index=0;
    state.zoomImages=images.length?images:[src];state.zoomIndex=index;state.zoomImage=state.zoomImages[index]||src;state.zoomAlt=alt||'Product image';state.zoomScale=1;state.zoomX=0;state.zoomY=0;
    try{
      if(history.state?.oneLineZoom)history.replaceState({...history.state,zoomIndex:index,zoomSrc:state.zoomImage,zoomAlt:state.zoomAlt},'',location.href);
      else{history.replaceState({...history.state,scrollY:window.scrollY},'',location.href);history.pushState({...history.state,oneLine:true,oneLineGuard:true,oneLineZoom:true,screen:state.screen,scrollY:window.scrollY,zoomIndex:index,zoomSrc:state.zoomImage,zoomAlt:state.zoomAlt},'',location.href);}
    }catch(_){}
    render();
  }
  function changeZoomImage(step){
    const images=state.zoomImages||[];if(images.length<2)return;
    state.zoomIndex=(state.zoomIndex+step+images.length)%images.length;state.zoomImage=images[state.zoomIndex];state.zoomAlt=(state.selected?.name||'Product image')+' '+(state.zoomIndex+1);state.zoomScale=1;state.zoomX=0;state.zoomY=0;
    try{if(history.state?.oneLineZoom)history.replaceState({...history.state,zoomIndex:state.zoomIndex,zoomSrc:state.zoomImage,zoomAlt:state.zoomAlt},'',location.href);}catch(_){}
    render();
  }
  function closeZoom(){if(history.state?.oneLineZoom){history.back();return;}resetZoomState();render();}
  function detailSlider(images,name){
    images=(images||[]).filter(Boolean);if(!images.length)images=['assets/crew-tee.webp'];
    return '<div class="detail-slider" data-detail-slider><div class="detail-slider-frame"><div class="product-slide-track detail-slide-track">'+images.map((src,i)=>'<div class="product-slide detail-slide" data-detail-index="'+i+'"><button type="button" class="detail-zoom-target" data-zoom-image="'+S.esc(src)+'" data-zoom-alt="'+S.esc(name+' '+(i+1))+'" aria-label="Open product image">'+img(src,name+' '+(i+1),'product-image','assets/crew-tee.webp')+'<span>'+I('zoom')+'</span></button></div>').join('')+'</div></div>'+(images.length>1?'<div class="product-slide-progress detail-slide-progress">'+images.map((_,i)=>'<i class="'+(i===0?'active':'')+'"></i>').join('')+'</div>':'<div class="product-slide-progress detail-slide-progress single"><i class="active"></i></div>')+'</div>';
  }
  function productCard(p,audience){
    const isB2B=audience==='b2b',slides=productImages(p),discount=p.mrp&&p.price?Math.max(0,Math.round((p.mrp-p.price)/p.mrp*100)):0;
    return '<article class="product-card wellone-card" tabindex="0" data-open-product="'+S.esc(p.id)+'" data-audience="'+(isB2B?'b2b':'retail')+'"><button type="button" class="card-share-button" data-share-kind="product" data-share-value="'+S.esc(p.id)+'" data-share-extra="'+(isB2B?'b2b':'retail')+'" data-share-label="'+S.esc(p.name)+'" aria-label="Share '+S.esc(p.name)+'">'+I('share')+'</button><div class="product-image-wrap ratio-3x4 product-card-slider" data-card-slider="'+S.esc(p.id)+'" data-slider-audience="'+(isB2B?'b2b':'retail')+'"><div class="product-slide-track">'+slides.map((src,i)=>'<div class="product-slide" data-slide-index="'+i+'">'+img(src,p.name+' '+(i+1),'product-image')+'</div>').join('')+'</div>'+(discount?'<span class="discount-tag">-'+discount+'%</span>':'')+'</div>'+(slides.length>1?'<div class="product-slide-progress" aria-hidden="true">'+slides.map((_,i)=>'<i class="'+(i===0?'active':'')+'"></i>').join('')+'</div>':'<div class="product-slide-progress single" aria-hidden="true"><i class="active"></i></div>')+'<div class="product-info"><p>'+S.esc(p.subcategory||p.category)+'</p><h3>'+S.esc(p.name)+'</h3>'+(isB2B?'<div class="ask-price-row"><strong>Ask for price</strong><span>Wholesale enquiry</span></div>':'<div class="price-row"><strong>'+S.money(p.price)+'</strong>'+(p.mrp?'<s>'+S.money(p.mrp)+'</s>':'')+'</div>')+'</div></article>';
  }
  function orderedCategoryNames(list){
    const available=[...new Set(list.map(p=>p.category).filter(Boolean))],configured=state.categories.map(c=>c.name).filter(n=>available.includes(n));
    available.forEach(n=>{if(!configured.includes(n))configured.push(n);});
    return configured.sort((a,b)=>{const at=/t[- ]?shirts?/i.test(a)?0:1,bt=/t[- ]?shirts?/i.test(b)?0:1;return at-b;});
  }
  function groupedProductSections(list,audience){
    return orderedCategoryNames(list).map((name,index)=>{const items=list.filter(p=>p.category===name);if(!items.length)return'';const subs=[...new Set(items.map(p=>p.subcategory).filter(Boolean))];return '<section class="catalog-category-group '+(index===0?'first-category-group':'')+'"><div class="catalog-category-heading"><div><span class="eyebrow">'+(index===0?'FIRST CATEGORY':'CATEGORY '+String(index+1).padStart(2,'0'))+'</span><h2>'+S.esc(name)+'</h2>'+(subs.length?'<p class="category-subline">'+subs.map(S.esc).join(' · ')+'</p>':'')+'</div><div class="category-heading-actions"><small>'+items.length+' item'+(items.length===1?'':'s')+'</small></div></div><div class="product-grid catalog-grid responsive-catalog-grid">'+items.map(p=>productCard(p,audience)).join('')+'</div></section>';}).join('');
  }
  function header(){return '<div class="announcement"><span>CUSTOM APPAREL · READY-MADE ESSENTIALS</span><b>PRINT YOUR IDEA</b></div><header class="site-header"><button class="mobile-menu" data-action="menu" aria-label="Open menu">'+I('menu')+'</button><button class="logo-button" data-go="home">'+logo(false)+'</button><nav class="'+(state.menu?'open':'')+'"><button data-go="home">Home</button><button data-go="catalog">Ready made</button><button data-go="customize">Customize</button><button data-go="b2b">B2B</button><button data-go="orders">My orders</button><button class="nav-install" data-action="install">'+I('download')+' Install app</button><button data-legal="About">About</button></nav><div class="header-actions"><button class="b2b-head-link" data-go="b2b">B2B</button><button class="install-link" data-action="install" aria-label="Install app">'+I('download')+'<span>Install</span></button><button data-go="cart" class="bag-link">'+I('bag')+'<span>'+totalQty()+'</span></button></div></header>'+(state.menu?'<button class="menu-scrim" data-action="close-menu" aria-label="Close menu"></button>':'');}
  function footer(){return '<footer><div class="footer-main">'+logo(false)+'<p>Custom apparel designer plus a separate ready-made catalogue for T-shirts, uniforms, sportswear, shirts and labels.</p><div><b>SHOP</b><button data-go="catalog">Ready-made catalogue</button><button data-go="customize">Custom designer</button><button data-go="b2b">B2B catalogue</button></div><div><b>INFORMATION</b>'+Object.keys(legalCopy).map(x=>'<button data-legal="'+x+'">'+x+'</button>').join('')+'</div><div><b>PORTALS</b><a href="admin.html">Admin</a><a href="staff.html">Staff</a><a href="management.html">Management</a><a href="receiver.html">Order receiving</a></div></div><div class="footer-bottom"><span>© 2026 One-Line</span><span>Ready-made and custom ordering kept separate</span></div></footer>';}
  function bottom(){return '<nav class="mobile-bottom"><button data-go="home" class="'+(state.screen==='home'?'active':'')+'">'+I('home')+'Home</button><button data-go="catalog" class="'+(state.screen==='catalog'||state.screen==='product'?'active':'')+'">'+I('filter')+'Catalog</button><button data-go="customize">'+I('plus')+'Create</button><button data-go="b2b" class="'+(state.screen.startsWith('b2b')?'active':'')+'">'+I('box')+'B2B</button><button data-go="cart" class="'+(state.screen==='cart'?'active':'')+'">'+I('bag')+'<i>'+totalQty()+'</i>Cart</button></nav>';}
  function home(){
    const popular=retailProducts().slice(0,5);
    return '<main class="screen screen-enter"><section class="hero"><div class="hero-copy"><span class="eyebrow">MADE FOR YOUR NAME, TEAM OR BUSINESS</span><h1>Wear your<br><em>own idea.</em></h1><p>Design one custom garment in the studio or order ready-made products from a clean mobile-friendly catalogue.</p><div class="hero-actions"><button class="primary" data-go="customize">Start customizing '+I('arrow')+'</button><button class="secondary" data-go="catalog">Shop ready-made</button></div><div class="hero-proof"><span>'+I('shield')+' Exact print position saved</span><span>'+I('package')+' Cart keeps your design</span></div></div><div class="hero-visual"><div class="hero-grid-label">ONE-LINE CUSTOM STUDIO</div><div class="hero-product-orbit"><div class="orbit-ring"></div><img src="assets/crew-tee.webp" alt="Premium blank T-shirt"><div class="hero-brand-badge"><img src="one-line-mark.svg" alt=""><span>BUILD YOUR OWN</span></div></div><div class="floating-tool tool-a">'+I('type')+'<span>Add text</span></div><div class="floating-tool tool-b">'+I('image')+'<span>Upload image</span></div><div class="floating-tool tool-c">'+I('sparkle')+'<span>Choose print</span></div><button class="visual-cta" data-go="customize"><span>OPEN DESIGNER</span>'+I('arrow')+'</button></div></section>'+categoriesSection()+processSection()+'<section class="products-section section-wrap"><div class="section-heading"><div><span class="eyebrow">READY TO ORDER</span><h2>Popular essentials.</h2></div><button data-go="catalog">See full catalogue '+I('arrow')+'</button></div><div class="product-grid home-product-grid">'+popular.map(p=>productCard(p,'retail')).join('')+'</div></section><section class="bulk-banner section-wrap uniform-order-banner"><div><span>BULK / TEAMS / INSTITUTIONS</span><h2>Need a custom uniform order?</h2><p>Build the garment, colour, print area and artwork in the customizer, then add the exact design to your cart.</p></div><button class="uniform-customize-button" data-go="customize"><span>Customize uniform</span>'+I('arrow')+'</button></section></main>';
  }
  function categoriesSection(){
    const cats=[...state.categories].sort((a,b)=>{const at=/t[- ]?shirts?/i.test(a.name||'')?0:1,bt=/t[- ]?shirts?/i.test(b.name||'')?0:1;return at-b;});
    return '<section class="category-section section-wrap borderless-categories"><div class="section-heading"><div><span class="eyebrow">SHOP BY CATEGORY</span><h2>Ready-made catalogue.</h2></div><div class="section-heading-actions"><button class="catalog-view-button" data-go="catalog">View all products '+I('arrow')+'</button></div></div><div class="category-grid real-category-grid">'+cats.map((c,i)=>'<article class="category-block '+S.esc(c.tone||'paper')+' real-category-card" data-category="'+S.esc(c.name)+'" tabindex="0"><span class="category-code">'+String(i+1).padStart(2,'0')+'</span><div class="category-photo">'+img(c.image,c.name,'','assets/crew-tee.webp')+'</div><div><h3>'+S.esc(c.name)+'</h3><p>'+S.esc(c.sub||'Ready-made products')+'</p></div><span class="category-arrow">'+I('arrow')+'</span></article>').join('')+'</div></section>';
  }
  function processSection(){const rows=[['sliders','Choose','Select apparel type, cloth quality, garment colour and size.'],['move','Create','Move only your print layers while the garment stays locked.'],['sparkle','Print','Select the print method; sublimation is disabled on dark garments.'],['truck','Receive','Add the exact saved design to cart and complete the order.']];return '<section class="process-section"><div class="section-wrap"><span class="eyebrow light">CUSTOM ORDER PROCESS</span><h2>From blank garment<br>to finished piece.</h2><div class="process-grid">'+rows.map((x,i)=>'<article><b>0'+(i+1)+'</b>'+I(x[0])+'<h3>'+x[1]+'</h3><p>'+x[2]+'</p></article>').join('')+'</div><button class="acid-button" data-go="customize">Design an apparel now '+I('arrow')+'</button></div></section>';}
  function activeFilterChips(){const all=[...state.filterCategories.map(v=>['category',v]),...state.filterSubs.map(v=>['sub',v]),...state.filterOptions.map(v=>['option',v])];return all.length?'<div class="active-filter-chips">'+all.map(([k,v])=>'<button data-remove-filter="'+k+'" data-value="'+S.esc(v)+'">'+S.esc(v)+' <b>×</b></button>').join('')+'</div>':'';}
  function catalog(){
    const list=filtered('retail');
    const selectedCategory=state.filterCategories.length===1?state.filterCategories[0]:'';
    const categoryShare=selectedCategory?'<button type="button" class="inline-share-button selected-category-share" data-share-kind="category" data-share-value="'+S.esc(selectedCategory)+'" data-share-label="'+S.esc(selectedCategory)+' category" aria-label="Share '+S.esc(selectedCategory)+' category">'+I('share')+'</button>':'';
    return '<main class="catalog-page section-wrap screen screen-enter wellone-catalog grouped-catalog"><div class="catalog-title compact-catalog-title"><div><span class="eyebrow">READY-MADE / '+String(list.length).padStart(2,'0')+'</span><h1>'+(selectedCategory?S.esc(selectedCategory):'Ready-made')+'</h1><p>'+(selectedCategory?'Browse the selected category. Use the share button to send this exact category section.':'T-shirts appear first, with every other category arranged in its own clean section below.')+'</p></div><div class="catalog-title-actions">'+categoryShare+'<button class="filter-button wellone-filter-button" data-action="open-filter">'+I('filter')+' Filter '+((state.filterCategories.length+state.filterSubs.length+state.filterOptions.length)?'<b>'+(state.filterCategories.length+state.filterSubs.length+state.filterOptions.length)+'</b>':'')+'</button></div></div>'+activeFilterChips()+(list.length?groupedProductSections(list,'retail'):'<div class="empty-state">'+I('filter')+'<h2>No matching items</h2><p>Clear a filter and try again.</p><button data-action="clear-filters">Clear filters</button></div>')+'</main>';
  }
  function product(){
    const p=state.selected;if(!p)return catalog();
    const sizes=currentSizes(p),sub=p.subItem||null,subSizes=currentSubSizes(p),price=Number(p.price||0)+(state.subItem?Number(sub?.price||0):0),gallery=productGallery(p);
    const subColors=sub?.colors?.length?sub.colors:(sub?.colorVariants||[]).map(v=>v.color).filter(Boolean);
    const subPanel=sub?'<div class="subitem-box advanced-subitem"><label class="subitem-toggle"><input data-subitem type="checkbox" '+(state.subItem?'checked':'')+'><span><b>Add '+S.esc(sub.name)+'</b><small>Optional matching item</small></span><strong>+'+S.money(sub.price||0)+'</strong></label>'+(state.subItem?'<div class="subitem-config"><div class="subitem-media">'+img(currentSubImage(p),sub.name,'','assets/crew-tee.webp')+'</div><div class="subitem-controls">'+(subColors.length?'<div class="selection-block sub-selection"><label>Colour <b>'+S.esc(state.subColor)+'</b></label><div class="colour-options">'+subColors.map(c=>'<button class="'+(state.subColor===c?'active':'')+'" data-sub-color="'+S.esc(c)+'"><span style="background:'+(S.palette[c]||'#ddd')+'"></span>'+S.esc(c)+'</button>').join('')+'</div></div>':'')+(subSizes.length?'<div class="selection-block sub-selection"><label>'+S.esc(sub.optionTitle||'Size')+' <b>'+S.esc(state.subSize)+'</b></label><div class="size-options">'+subSizes.map(v=>'<button class="'+(state.subSize===v?'active':'')+'" data-sub-size="'+S.esc(v)+'">'+S.esc(v)+'</button>').join('')+'</div></div>':'')+'</div></div>':'')+'</div>':'';
    return '<main class="product-fullscreen screen screen-enter"><div class="product-full-back"><button class="back-button" data-action="nav-back" data-fallback="catalog">'+I('back')+' Back</button></div><div class="product-full-inner"><section class="product-full-media">'+detailSlider(gallery,p.name)+'</section><section class="product-full-info"><div class="product-title-tools"><span class="eyebrow">'+S.esc(p.category)+' / '+S.esc(p.subcategory)+'</span><button type="button" class="inline-share-button" data-share-kind="product" data-share-value="'+S.esc(p.id)+'" data-share-label="'+S.esc(p.name)+'" aria-label="Share product">'+I('share')+'</button></div><h1>'+S.esc(p.name)+'</h1><div class="detail-price"><strong>'+S.money(price)+'</strong>'+(p.mrp?'<s>'+S.money(p.mrp)+'</s>':'')+'</div><p>'+S.esc(p.description)+'</p>'+(p.colors?.length?'<div class="selection-block"><label>Colour <b>'+S.esc(state.color)+'</b></label><div class="colour-options">'+p.colors.map(c=>'<button class="'+(state.color===c?'active':'')+'" data-product-color="'+S.esc(c)+'"><span style="background:'+(S.palette[c]||'#ddd')+'"></span>'+S.esc(c)+'</button>').join('')+'</div></div>':'')+(sizes.length?'<div class="selection-block"><label>'+S.esc(p.optionTitle||'Size')+' <b>'+S.esc(state.size)+'</b></label><div class="size-options">'+sizes.map(v=>'<button class="'+(state.size===v?'active':'')+'" data-product-size="'+S.esc(v)+'">'+S.esc(v)+'</button>').join('')+'</div></div>':'')+subPanel+'<div class="product-action-row"><button class="primary detail-add" data-action="add-product">Add to cart '+I('bag')+'</button><button class="custom-enquiry-btn" data-action="whatsapp" data-message="Hi, I want to customize '+S.esc(p.name)+'. Please share the customization options and price.">'+whatsappLogo()+'<span>Contact to customize</span></button></div><div class="ready-made-note"><b>Ready-made item</b><span>This product itself is not edited in the customizer. Contact us for a custom version.</span></div></section></div></main>';
  }
  function customCartPreview(item){const faces=S.designedSurfaces(item.customDesign||{});const face=faces[0]||'front';return '<div class="cart-custom-preview">'+S.designPreview(item.customDesign,face,'cart-design-preview')+'<span>'+face.replace('Sleeve',' sleeve')+'</span></div>';}
  function cartItem(item){
    const thumb=item.customDesign?customCartPreview(item):'<div class="cart-ready-preview">'+img(item.image,item.name,'','assets/crew-tee.webp')+'</div>';
    return '<article class="cart-item improved-cart-item">'+thumb+'<div class="cart-item-info"><span>'+(item.custom?'YOUR CUSTOM DESIGN':'READY-MADE')+'</span><h3>'+S.esc(item.name)+'</h3><p>'+[item.color,item.size,item.detail].filter(Boolean).map(S.esc).join(' · ')+'</p>'+(item.customDesign?'<div class="cart-design-meta"><b>'+S.esc(item.customDesign.printType)+'</b><span>'+S.designedSurfaces(item.customDesign).length+' print area'+(S.designedSurfaces(item.customDesign).length===1?'':'s')+'</span><span>Position and scale saved exactly from designer</span></div>':'')+'<strong>'+S.money(item.price)+'</strong></div><div class="qty-control"><button data-qty="-1" data-key="'+S.esc(item.key)+'">'+I('minus')+'</button><span>'+item.qty+'</span><button data-qty="1" data-key="'+S.esc(item.key)+'">'+I('plus')+'</button></div><button class="remove-item" data-remove-key="'+S.esc(item.key)+'" aria-label="Remove item">'+I('trash')+'</button></article>';
  }
  function cart(){return '<main class="cart-page section-wrap screen screen-enter improved-cart-page"><div class="catalog-title"><div><span class="eyebrow">YOUR ORDER</span><h1>Cart <sup>'+totalQty()+'</sup></h1><p>Custom designs keep the same garment, print position, size and rotation you created.</p></div><button class="back-button" data-action="nav-back" data-fallback="catalog">'+I('back')+' Back</button></div>'+(state.cart.length?'<div class="cart-layout"><section class="cart-list">'+state.cart.map(cartItem).join('')+'</section><aside class="order-summary"><span class="eyebrow">ORDER SUMMARY</span><div><span>Items</span><b>'+totalQty()+'</b></div><div><span>Subtotal</span><b>'+S.money(subtotal())+'</b></div><div><span>Delivery</span><b>Calculated next</b></div><hr><div class="summary-total"><span>Estimated total</span><strong>'+S.money(subtotal())+'</strong></div><button class="primary wide" data-action="checkout">Proceed to checkout '+I('arrow')+'</button><p>'+I('shield')+' Your saved custom artwork remains in the cart if you go back to edit.</p><button class="secondary wide cart-edit-design" data-go="customize">Edit / continue custom design</button></aside></div>':'<div class="empty-state cart-empty">'+I('bag')+'<h2>Your cart is empty</h2><p>Choose a ready-made item or continue your saved custom design.</p><div><button class="primary" data-go="customize">Open customizer</button><button class="secondary" data-go="catalog">Browse products</button></div></div>')+'</main>';}
  function checkout(){
    if(state.orderPlaced)return success();const deliveries=S.getDelivery().filter(x=>x.active);
    if(!state.cart.length)return cart();
    return '<main class="checkout-page section-wrap screen screen-enter"><div class="checkout-head"><button class="back-button" data-action="nav-back" data-fallback="cart">'+I('back')+' Back</button>'+logo(true)+'<span>Secure checkout '+I('shield')+'</span></div><div class="checkout-steps two-steps"><span class="'+(state.checkoutStep>=1?'active':'')+'"><b>1</b>Details</span><i></i><span class="'+(state.checkoutStep>=2?'active':'')+'"><b>2</b>Delivery & payment</span></div><div class="checkout-layout"><section class="checkout-card">'+(state.checkoutStep===1?'<div><span class="eyebrow">STEP 01</span><h1>Your details</h1><p>Enter the contact and delivery details for this order.</p><form class="checkout-form" data-checkout-form><label>Name<input required name="name" value="'+S.esc(state.details.name)+'"></label><label>Phone<input required name="phone" inputmode="tel" value="'+S.esc(state.details.phone)+'"></label><label class="full">Business / team name <small>optional</small><input name="business" value="'+S.esc(state.details.business)+'"></label><label class="full">Address<textarea required name="address" rows="4">'+S.esc(state.details.address)+'</textarea></label><button type="button" class="primary wide" data-action="delivery-step">Continue '+I('arrow')+'</button></form></div>':'<div><span class="eyebrow">STEP 02</span><h1>Delivery & payment</h1><div class="checkout-options"><b>Delivery method</b>'+deliveries.map(d=>'<button data-delivery="'+S.esc(d.name)+'" class="'+(state.delivery===d.name?'active':'')+'">'+I(d.name.toLowerCase().includes('pickup')?'package':d.name.toLowerCase().includes('bus')?'box':'truck')+'<span><b>'+S.esc(d.name)+'</b><small>'+S.esc(d.note)+'</small></span>'+(state.delivery===d.name?I('check'):'')+'</button>').join('')+'</div><div class="checkout-options"><b>Payment</b>'+['Cash on delivery','Pay at pickup','Online payment'].map(p=>'<button data-payment="'+p+'" class="'+(state.payment===p?'active':'')+'">'+I('card')+'<span><b>'+p+'</b><small>'+(p==='Online payment'?'Demo payment in this build':'Confirmed with order')+'</small></span>'+(state.payment===p?I('check'):'')+'</button>').join('')+'</div><button class="primary wide" data-action="submit-order">Place order · '+S.money(subtotal())+'</button></div>')+'</section><aside class="order-summary checkout-summary"><span class="eyebrow">YOUR ORDER</span>'+state.cart.map(i=>'<div><span>'+i.qty+' × '+S.esc(i.name)+'</span><b>'+S.money(i.price*i.qty)+'</b></div>').join('')+'<hr><div class="summary-total"><span>Total</span><strong>'+S.money(subtotal())+'</strong></div></aside></div></main>';
  }
  function success(){return '<main class="success-page section-wrap screen screen-enter"><div class="success-card">'+I('check')+'<span class="eyebrow">ORDER CONFIRMED</span><h1>Thank you.</h1><p>Your order and exact custom design data were saved.</p><div class="success-order"><span>Order reference</span><b>#'+S.esc(state.orderReference)+'</b></div><div><button class="primary" data-action="view-order">View my order</button><button class="secondary" data-go="home">Back to home</button></div></div></main>';}
  function orderItem(item){const faces=item.customDesign?S.designedSurfaces(item.customDesign):[];const previews=item.customDesign?'<div class="design-surface-gallery">'+(faces.length?faces:['front']).map(face=>'<figure>'+S.designPreview(item.customDesign,face)+'<figcaption>'+face.replace('Sleeve',' sleeve')+'</figcaption></figure>').join('')+'</div>':'<div class="cart-ready-preview">'+img(item.image,item.name,'','assets/crew-tee.webp')+'</div>';return '<div class="ordered-item">'+previews+'<div><span>'+(item.custom?'CUSTOMIZED ITEM':'READY-MADE ITEM')+'</span><h3>'+S.esc(item.name)+'</h3><p>'+[item.color,item.size,'Qty '+item.qty].filter(Boolean).map(S.esc).join(' · ')+'</p>'+(item.customDesign?'<dl><div><dt>Print</dt><dd>'+S.esc(item.customDesign.printType)+'</dd></div><div><dt>Print areas</dt><dd>'+faces.length+'</dd></div></dl>':'')+'</div><strong>'+S.money(item.price*item.qty)+'</strong></div>';}
  function orders(){state.orders=S.getOrders();return '<main class="customer-orders-page section-wrap screen screen-enter"><div class="catalog-title"><div><span class="eyebrow">CUSTOMER ORDER HISTORY</span><h1>My orders</h1></div><button class="back-button" data-action="nav-back" data-fallback="home">'+I('back')+' Back</button></div><div class="customer-order-list">'+(state.orders.length?state.orders.map(o=>'<article class="customer-order-card"><div class="customer-order-head"><div><span>ORDER #'+S.esc(o.id)+'</span><h2>'+S.esc(o.status)+'</h2></div><div><small>'+S.esc(o.time)+'</small><strong>'+S.money(o.total)+'</strong></div></div><div class="customer-order-items">'+(o.orderItems?.length?o.orderItems.map(orderItem).join(''):'<div class="legacy-order-note">'+I('package')+'<span><b>'+o.items+' ordered items</b><small>Older demo order</small></span></div>')+'</div><div class="customer-order-foot"><span>'+I('truck')+' '+S.esc(o.delivery)+'</span><span>'+I('card')+' '+S.esc(o.payment)+'</span><span>'+I('map')+' '+S.esc(o.address)+'</span></div></article>').join(''):'<div class="empty-state"><h2>No orders yet</h2><p>Your confirmed orders appear here.</p></div>')+'</div></main>';}
  function b2b(){
    if(!state.b2bAuthed)return '<main class="b2b-login-page section-wrap screen screen-enter"><section class="b2b-login-card"><span class="eyebrow">WHOLESALE ACCESS</span><h1>B2B login</h1><p>Use the single B2B login supplied by the admin. Wholesale prices are not displayed; each item goes to WhatsApp for a quotation.</p><form data-b2b-login><label>Login ID<input name="id" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label>'+(state.b2bError?'<p class="b2b-error">'+S.esc(state.b2bError)+'</p>':'')+'<button class="primary wide" type="submit">Open B2B catalogue '+I('arrow')+'</button></form></section></main>';
    const list=filtered('b2b');return '<main class="catalog-page section-wrap screen screen-enter wellone-catalog b2b-catalog grouped-catalog"><div class="catalog-title compact-catalog-title"><div><span class="eyebrow">B2B ONLY / '+String(list.length).padStart(2,'0')+'</span><h1>Wholesale catalogue</h1><p>No fixed rate is shown. Select an item and ask for the current wholesale price on WhatsApp.</p></div><div class="b2b-actions"><button class="filter-button wellone-filter-button" data-action="open-filter">'+I('filter')+' Filter</button><button class="secondary" data-action="b2b-logout">Logout</button></div></div>'+activeFilterChips()+(list.length?groupedProductSections(list,'b2b'):'<div class="empty-state"><h2>No matching B2B items</h2><button data-action="clear-filters">Clear filters</button></div>')+'</main>';
  }
  function b2bProduct(){const p=state.selected;if(!p||p.audience!=='b2b')return b2b();return '<main class="product-fullscreen screen screen-enter b2b-product"><div class="product-full-back"><button class="back-button" data-action="nav-back" data-fallback="b2b">'+I('back')+' Back</button></div><div class="product-full-inner"><section class="product-full-media">'+detailSlider([p.image],p.name)+'</section><section class="product-full-info"><span class="eyebrow">B2B / '+S.esc(p.category)+'</span><h1>'+S.esc(p.name)+'</h1><div class="b2b-price-label">ASK FOR PRICE</div><p>'+S.esc(p.description)+'</p>'+(p.sizes?.length?'<div class="selection-block"><label>'+S.esc(p.optionTitle||'Available options')+'</label><div class="size-options">'+p.sizes.map(v=>'<button class="'+(state.size===v?'active':'')+'" data-product-size="'+S.esc(v)+'">'+S.esc(v)+'</button>').join('')+'</div></div>':'')+'<button class="custom-enquiry-btn b2b-enquiry" data-action="whatsapp" data-message="Hi, I need the B2B price for '+S.esc(p.name)+(state.size?' - '+S.esc(state.size):'')+'. Please send the current wholesale rate and minimum quantity.">'+whatsappLogo()+'<span>Ask for price on WhatsApp</span></button></section></div></main>';}
  function filterModal(audience){
    if(!state.filterOpen)return'';const draft=state.filterDraft||{categories:clone(state.filterCategories),subs:clone(state.filterSubs),options:clone(state.filterOptions)};state.filterDraft=draft;const choices=filterChoices(audience);
    const choice=(kind,val,active)=>'<button type="button" class="catalog-filter-choice '+(active?'is-selected':'')+'" data-filter-choice="'+kind+'" data-value="'+S.esc(val)+'"><span class="filter-check">'+(active?I('check'):'')+'</span><span>'+S.esc(val)+'</span></button>';
    return '<div class="catalog-filter-overlay open"><aside class="catalog-filter-drawer"><header><div><p>'+(audience==='b2b'?'B2B catalogue':'Ready-made catalogue')+'</p><h2>Filters</h2></div><button class="filter-drawer-close" data-action="close-filter" aria-label="Close">×</button></header><div class="catalog-filter-body"><section class="filter-drawer-group"><div class="filter-group-title"><span>Category</span><small>Select one or more</small></div><div class="filter-choice-grid">'+choices.cats.map(v=>choice('categories',v,draft.categories.includes(v))).join('')+'</div></section>'+(choices.subs.length?'<section class="filter-drawer-group"><div class="filter-group-title"><span>Subcategory</span><small>Available for selected categories</small></div><div class="filter-choice-grid">'+choices.subs.map(v=>choice('subs',v,draft.subs.includes(v))).join('')+'</div></section>':'')+(choices.options.length?'<section class="filter-drawer-group"><div class="filter-group-title"><span>Size / option</span><small>Only available values are shown</small></div><div class="filter-choice-grid option-choice-grid">'+choices.options.map(v=>choice('options',v,draft.options.includes(v))).join('')+'</div></section>':'')+'</div><footer><div><button class="filter-reset-button" data-action="reset-filter-draft">Clear</button><small>'+(draft.categories.length+draft.subs.length+draft.options.length)+' selected</small></div><button class="filter-apply-button" data-action="apply-filter">Apply filters</button></footer></aside></div>';
  }
  function legal(){const lines=legalCopy[state.legal]||legalCopy.About;return '<div class="overlay"><div class="legal-panel"><button class="close" data-action="close-legal">'+I('close')+'</button><span class="eyebrow">STORE INFORMATION</span><h2>'+S.esc(state.legal)+'</h2>'+lines.map(x=>'<p>'+S.esc(x)+'</p>').join('')+'</div></div>';}
  function imageZoomModal(){if(!state.zoomImage)return'';const many=(state.zoomImages||[]).length>1,count=(state.zoomImages||[]).length||1;return '<div class="image-zoom-overlay" data-zoom-overlay><div class="image-zoom-shell" role="dialog" aria-modal="true" aria-label="Product image viewer"><button type="button" class="zoom-close" data-action="close-zoom" aria-label="Close image">'+I('close')+'</button>'+(many?'<button type="button" class="zoom-nav zoom-prev" data-action="zoom-prev" aria-label="Previous image">'+I('back')+'</button><button type="button" class="zoom-nav zoom-next" data-action="zoom-next" aria-label="Next image">'+I('arrow')+'</button>':'')+'<div class="zoom-image-stage" data-zoom-stage><img data-zoom-view src="'+S.esc(state.zoomImage)+'" alt="'+S.esc(state.zoomAlt||'Product image')+'" style="transform:translate3d('+state.zoomX+'px,'+state.zoomY+'px,0) scale('+state.zoomScale+')"></div><div class="zoom-controls"><button type="button" data-action="zoom-out" aria-label="Zoom out">'+I('minus')+'</button><span data-zoom-label>'+Math.round(state.zoomScale*100)+'%</span><span class="zoom-count">'+(state.zoomIndex+1)+' / '+count+'</span><button type="button" data-action="zoom-in" aria-label="Zoom in">'+I('plus')+'</button></div></div></div>'; }
  function paymentModal(){return '<div class="overlay"><div class="payment-modal"><button class="close" data-action="close-payment">'+I('close')+'</button><div class="demo-tag">DEMO PAYMENT</div>'+I('card')+'<h2>'+S.money(subtotal())+'</h2><p>This build simulates successful online payment. No real money is collected.</p><button class="primary wide" data-action="complete-order">Simulate successful payment</button><button class="text-button" data-action="close-payment">Cancel</button></div></div>';}
  function toast(){return state.toast?'<div class="toast">'+I('check')+S.esc(state.toast)+'<button data-go="cart">View cart</button></div>':'';}
  function whatsappFloat(){if(state.screen==='customize')return'';return '<button class="whatsapp-float whatsapp-icon-only contact-float" data-whatsapp-float aria-label="Contact enquiry"><img src="assets/contact-support.png" alt="Contact"></button>';}
  function page(){return({home,catalog,product,cart,checkout,orders,b2b,b2bProduct})[state.screen]?.()||home();}

  function render(){
    state.products=S.getProducts();state.categories=S.getCategories();state.settings=S.getSettings();
    if(state.screen==='customize'){root.innerHTML='<div id="designer-root"></div>';window.OneLineDesigner.mount(document.getElementById('designer-root'),{onBack:()=>navigateBack('home'),onAdd:item=>{addCart(item,false);go('cart');}});return;}
    const audience=state.screen.startsWith('b2b')?'b2b':'retail';
    root.innerHTML='<div class="view-root">'+header()+page()+footer()+bottom()+filterModal(audience)+(state.legal?legal():'')+(state.paymentDemo?paymentModal():'')+imageZoomModal()+toast()+whatsappFloat()+'</div>';syncModalScrollLock();bind();bindZoomViewer();positionWhatsapp();
  }
  function completeOrder(){const id='CS-'+String(1050+Math.floor(Math.random()*8000));const order={id,customer:state.details.business||state.details.name,phone:state.details.phone,total:subtotal(),items:totalQty(),delivery:state.delivery,payment:state.payment==='Online payment'?'Online · Demo paid':state.payment,status:'Confirmed',time:'Just now',address:state.details.address,orderItems:clone(state.cart)};state.orders=[order,...S.getOrders()];S.save('custom-store-orders-v3',state.orders);state.cart=[];saveCart();state.paymentDemo=false;state.orderPlaced=true;state.orderReference=id;render();}
  function whatsAppUrl(message){const number=String(state.settings.whatsapp||'').replace(/\D/g,'');const text=encodeURIComponent(message||'Hi, I need a customization quotation.');return number?'https://wa.me/'+number+'?text='+text:'https://wa.me/?text='+text;}
  function openWhatsApp(message){window.open(whatsAppUrl(message),'_blank','noopener');}
  function removeFilter(kind,value){const key=kind==='category'?'filterCategories':kind==='sub'?'filterSubs':'filterOptions';state[key]=state[key].filter(v=>v!==value);saveFilters();render();}
  function positionWhatsapp(){
    const el=root.querySelector('[data-whatsapp-float]');if(!el)return;
    const width=el.offsetWidth||52,height=el.offsetHeight||52;
    let left=Math.max(8,window.innerWidth-width-17),top=Math.max(72,window.innerHeight-height-88);
    try{
      const p=JSON.parse(localStorage.getItem('one-line-wa-position')||'null');
      if(p&&Number.isFinite(p.left)&&Number.isFinite(p.top)){left=p.left;top=p.top;}
    }catch(_){}
    left=Math.max(8,Math.min(window.innerWidth-width-8,left));
    top=Math.max(72,Math.min(window.innerHeight-height-76,top));
    el.style.left=left+'px';el.style.top=top+'px';el.style.right='auto';el.style.bottom='auto';
  }
  function bindWhatsappDrag(){const el=root.querySelector('[data-whatsapp-float]');if(!el)return;let drag=null,moved=false;el.addEventListener('pointerdown',e=>{moved=false;const r=el.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top,startX:e.clientX,startY:e.clientY};el.setPointerCapture(e.pointerId);});el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const left=Math.max(8,Math.min(window.innerWidth-el.offsetWidth-8,e.clientX-drag.dx)),top=Math.max(72,Math.min(window.innerHeight-el.offsetHeight-90,e.clientY-drag.dy));if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)moved=true;el.style.left=left+'px';el.style.top=top+'px';el.style.right='auto';el.style.bottom='auto';});el.addEventListener('pointerup',e=>{if(!drag)return;const r=el.getBoundingClientRect();localStorage.setItem('one-line-wa-position',JSON.stringify({left:r.left,top:r.top}));drag=null;if(!moved)openWhatsApp('Hi, I need a custom apparel quotation.');});el.addEventListener('pointercancel',()=>{drag=null;});}
  function bindHorizontalSlider(track,onChange,onActivate){
    if(!track)return;
    let drag=null,dragged=false;
    const sync=()=>{if(onChange)onChange();};
    track.addEventListener('scroll',sync,{passive:true});
    track.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:track.scrollLeft,axis:null};dragged=false;
      if(e.pointerType==='mouse'){try{track.setPointerCapture(e.pointerId);}catch(_){}}
    });
    track.addEventListener('pointermove',e=>{
      if(!drag||drag.id!==e.pointerId)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.axis&&Math.max(Math.abs(dx),Math.abs(dy))>7)drag.axis=Math.abs(dx)>Math.abs(dy)*1.15?'x':'y';
      if(drag.axis!=='x')return;
      dragged=true;track.scrollLeft=drag.left-dx;
    });
    const finish=e=>{
      if(!drag||drag.id!==e.pointerId)return;
      try{if(track.hasPointerCapture?.(e.pointerId))track.releasePointerCapture(e.pointerId);}catch(_){}
      if(dragged){const w=track.clientWidth||1,idx=Math.round(track.scrollLeft/w);track.scrollTo({left:idx*w,behavior:'smooth'});}
      drag=null;requestAnimationFrame(sync);
    };
    track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);
    if(onActivate)track.addEventListener('click',e=>{e.stopPropagation();if(dragged){dragged=false;return;}onActivate(e);});
    sync();
  }
  function bindProductSliders(){
    root.querySelectorAll('[data-card-slider]').forEach(slider=>{
      const track=slider.querySelector('.product-slide-track'),card=slider.closest('[data-open-product]'),bars=card?.querySelectorAll('.product-slide-progress i');if(!track||!card)return;
      const sync=()=>{const w=track.clientWidth||1,idx=Math.max(0,Math.min((bars?.length||1)-1,Math.round(track.scrollLeft/w)));bars?.forEach((b,i)=>b.classList.toggle('active',i===idx));};
      bindHorizontalSlider(track,sync,()=>openProduct(card.dataset.openProduct,card.dataset.audience));
    });
  }
  function bindDetailSliders(){
    root.querySelectorAll('[data-detail-slider]').forEach(slider=>{
      const track=slider.querySelector('.detail-slide-track'),bars=slider.querySelectorAll('.detail-slide-progress i');if(!track)return;
      const sync=()=>{const w=track.clientWidth||1,idx=Math.max(0,Math.min((bars?.length||1)-1,Math.round(track.scrollLeft/w)));bars?.forEach((b,i)=>b.classList.toggle('active',i===idx));};
      bindHorizontalSlider(track,sync,null);
    });
  }
  function bind(){
    root.querySelectorAll('[data-go]').forEach(x=>x.addEventListener('click',()=>go(x.dataset.go)));
    root.querySelectorAll('[data-open-product]').forEach(x=>x.addEventListener('click',e=>{if(e.target.closest('.product-slide-track'))return;e.stopPropagation();openProduct(x.dataset.openProduct,x.dataset.audience);}));
    root.querySelectorAll('[data-category]').forEach(x=>{x.addEventListener('click',e=>{if(e.target.closest('[data-share-kind]'))return;resetFilters(x.dataset.category);go('catalog');});x.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('[data-share-kind]')){e.preventDefault();resetFilters(x.dataset.category);go('catalog');}});});
    root.querySelectorAll('[data-legal]').forEach(x=>x.addEventListener('click',()=>{state.legal=x.dataset.legal;render();}));
    root.querySelectorAll('[data-product-color]').forEach(x=>x.addEventListener('click',()=>{state.color=x.dataset.productColor;state.previewImage='';const sizes=currentSizes(state.selected);if(!sizes.includes(state.size))state.size=sizes[0]||'';render();}));
    root.querySelectorAll('[data-product-size]').forEach(x=>x.addEventListener('click',()=>{state.size=x.dataset.productSize;render();}));
    root.querySelectorAll('[data-sub-color]').forEach(x=>x.addEventListener('click',()=>{state.subColor=x.dataset.subColor;const sizes=currentSubSizes(state.selected);if(!sizes.includes(state.subSize))state.subSize=sizes[0]||'';render();}));
    root.querySelectorAll('[data-sub-size]').forEach(x=>x.addEventListener('click',()=>{state.subSize=x.dataset.subSize;render();}));
    root.querySelectorAll('[data-product-image]').forEach(x=>x.addEventListener('click',()=>{if(state.selected)state.previewImage=x.dataset.productImage;render();}));
    root.querySelectorAll('[data-qty]').forEach(x=>x.addEventListener('click',()=>{const item=state.cart.find(i=>i.key===x.dataset.key);if(item)item.qty=Math.max(1,item.qty+Number(x.dataset.qty));saveCart();render();}));
    root.querySelectorAll('[data-remove-key]').forEach(x=>x.addEventListener('click',()=>{state.cart=state.cart.filter(i=>i.key!==x.dataset.removeKey);saveCart();render();}));
    root.querySelectorAll('[data-delivery]').forEach(x=>x.addEventListener('click',()=>{state.delivery=x.dataset.delivery;render();}));
    root.querySelectorAll('[data-payment]').forEach(x=>x.addEventListener('click',()=>{state.payment=x.dataset.payment;render();}));
    root.querySelectorAll('[data-remove-filter]').forEach(x=>x.addEventListener('click',()=>removeFilter(x.dataset.removeFilter,x.dataset.value)));
    root.querySelectorAll('[data-share-kind]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();shareItem(x.dataset.shareKind,x.dataset.shareValue||'',x.dataset.shareLabel||'',x.dataset.shareExtra||'');}));
    root.querySelectorAll('[data-zoom-image]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openZoom(x.dataset.zoomImage,x.dataset.zoomAlt||'');}));
    const sub=root.querySelector('[data-subitem]');if(sub)sub.addEventListener('change',()=>{state.subItem=sub.checked;if(state.subItem){const sizes=currentSubSizes(state.selected);if(!state.subSize||!sizes.includes(state.subSize))state.subSize=sizes[0]||'';}render();});
    const b2bForm=root.querySelector('[data-b2b-login]');if(b2bForm)b2bForm.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(b2bForm);const settings=S.getSettings();if(String(fd.get('id')).trim()===String(settings.b2bId)&&String(fd.get('password'))===String(settings.b2bPassword)){state.b2bAuthed=true;state.b2bError='';sessionStorage.setItem('one-line-b2b-auth','1');render();}else{state.b2bError='Invalid B2B login ID or password.';render();}});
    root.querySelectorAll('[data-filter-choice]').forEach(x=>x.addEventListener('click',()=>{const d=state.filterDraft,k=x.dataset.filterChoice,v=x.dataset.value;const arr=d[k];const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);if(k==='categories'){const allowedSubs=filterPool(state.screen.startsWith('b2b')?'b2b':'retail').filter(p=>!d.categories.length||d.categories.includes(p.category)).map(p=>p.subcategory);d.subs=d.subs.filter(s=>allowedSubs.includes(s));}render();}));
    root.querySelectorAll('[data-action]').forEach(x=>x.addEventListener('click',()=>{
      const a=x.dataset.action;
      if(a==='menu'){state.menu=!state.menu;render();}
      else if(a==='close-menu'){state.menu=false;render();}
      else if(a==='nav-back')navigateBack(x.dataset.fallback||'home');
      else if(a==='install')install();
      else if(a==='open-filter'){state.filterDraft={categories:clone(state.filterCategories),subs:clone(state.filterSubs),options:clone(state.filterOptions)};state.filterOpen=true;render();}
      else if(a==='close-filter')closeFilter(false);
      else if(a==='reset-filter-draft'){state.filterDraft={categories:[],subs:[],options:[]};render();}
      else if(a==='apply-filter'){commitFilterDraft();state.filterOpen=false;state.filterDraft=null;render();}
      else if(a==='clear-filters'){resetFilters();render();}
      else if(a==='add-product'){const p=state.selected;const image=selectedProductImage(p),sub=p.subItem;const subDetail=state.subItem&&sub?['Includes '+sub.name,state.subColor,state.subSize].filter(Boolean).join(' · '):'';addCart({key:p.id+'-'+state.color+'-'+state.size+'-'+state.subItem+'-'+state.subColor+'-'+state.subSize+'-'+Date.now(),productId:p.id,name:p.name,price:Number(p.price||0)+(state.subItem?Number(sub?.price||0):0),qty:1,image,color:state.color,size:state.size,detail:subDetail,subItemSelection:state.subItem&&sub?{name:sub.name,color:state.subColor,size:state.subSize,image:currentSubImage(p),price:Number(sub.price||0)}:null},true);}
      else if(a==='checkout'){const ok=state.cart.every(item=>item.custom||!item.productId||(state.products.find(p=>p.id===item.productId)?.stock||0)>=item.qty);if(!ok)showToast('Please reduce the quantity of the limited-stock item');else{state.checkoutStep=1;state.orderPlaced=false;go('checkout');}}
      else if(a==='delivery-step'){const form=root.querySelector('[data-checkout-form]');if(form?.reportValidity()){const fd=new FormData(form);state.details=Object.fromEntries(fd.entries());state.checkoutStep=2;render();}}
      else if(a==='submit-order'){if(state.payment==='Online payment'){state.paymentDemo=true;render();}else completeOrder();}
      else if(a==='close-payment'){state.paymentDemo=false;render();}
      else if(a==='complete-order')completeOrder();
      else if(a==='close-legal'){state.legal='';render();}
      else if(a==='view-order'){state.orderPlaced=false;go('orders');}
      else if(a==='whatsapp')openWhatsApp(x.dataset.message||'Hi, I need a custom apparel quotation.');
      else if(a==='close-zoom')closeZoom();
      else if(a==='zoom-prev')changeZoomImage(-1);
      else if(a==='zoom-next')changeZoomImage(1);
      else if(a==='zoom-in'){state.zoomScale=Math.min(4,Math.round((state.zoomScale+.25)*100)/100);if(state.zoomScale===1){state.zoomX=0;state.zoomY=0;}render();}
      else if(a==='zoom-out'){state.zoomScale=Math.max(1,Math.round((state.zoomScale-.25)*100)/100);if(state.zoomScale===1){state.zoomX=0;state.zoomY=0;}render();}
      else if(a==='b2b-logout'){state.b2bAuthed=false;sessionStorage.removeItem('one-line-b2b-auth');state.b2bError='';render();}
    }));
    const overlay=root.querySelector('.catalog-filter-overlay');if(overlay)overlay.addEventListener('click',e=>{if(e.target===overlay)closeFilter(false);});
    const zoomOverlay=root.querySelector('[data-zoom-overlay]');if(zoomOverlay)zoomOverlay.addEventListener('click',e=>{if(e.target===zoomOverlay)closeZoom();});
    bindWhatsappDrag();bindProductSliders();bindDetailSliders();
  }
  function syncModalScrollLock(){
    const locked=!!(state.filterOpen||state.zoomImage);
    document.documentElement.classList.toggle('modal-scroll-lock',locked);
    document.body.classList.toggle('modal-scroll-lock',locked);
  }
  function bindZoomViewer(){
    const stage=root.querySelector('[data-zoom-stage]'),image=root.querySelector('[data-zoom-view]'),label=root.querySelector('[data-zoom-label]');
    if(!stage||!image)return;
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    let pinchStart=0,pinchScale=state.zoomScale,panStart=null,swipeStart=null,lastTap=0,gestureMoved=false;
    const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    const limits=()=>({x:Math.max(0,(stage.clientWidth*(state.zoomScale-1))/2),y:Math.max(0,(stage.clientHeight*(state.zoomScale-1))/2)});
    const apply=()=>{
      const lim=limits();state.zoomX=clamp(state.zoomX,-lim.x,lim.x);state.zoomY=clamp(state.zoomY,-lim.y,lim.y);
      image.style.transform='translate3d('+state.zoomX+'px,'+state.zoomY+'px,0) scale('+state.zoomScale+')';if(label)label.textContent=Math.round(state.zoomScale*100)+'%';
    };
    stage.addEventListener('touchstart',e=>{
      gestureMoved=false;
      if(e.touches.length===2){e.preventDefault();pinchStart=distance(e.touches);pinchScale=state.zoomScale;panStart=null;swipeStart=null;}
      else if(e.touches.length===1){const t=e.touches[0];if(state.zoomScale>1)panStart={x:t.clientX,y:t.clientY,ox:state.zoomX,oy:state.zoomY};else swipeStart={x:t.clientX,y:t.clientY};}
    },{passive:false});
    stage.addEventListener('touchmove',e=>{
      if(e.touches.length===2&&pinchStart){e.preventDefault();gestureMoved=true;state.zoomScale=clamp(pinchScale*(distance(e.touches)/pinchStart),1,5);if(state.zoomScale<=1.01){state.zoomScale=1;state.zoomX=0;state.zoomY=0;}apply();}
      else if(e.touches.length===1&&panStart&&state.zoomScale>1){e.preventDefault();gestureMoved=true;const t=e.touches[0];state.zoomX=panStart.ox+(t.clientX-panStart.x);state.zoomY=panStart.oy+(t.clientY-panStart.y);apply();}
      else if(e.touches.length===1&&swipeStart&&state.zoomScale===1){const t=e.touches[0],dx=t.clientX-swipeStart.x,dy=t.clientY-swipeStart.y;if(Math.max(Math.abs(dx),Math.abs(dy))>8)gestureMoved=true;e.preventDefault();}
    },{passive:false});
    stage.addEventListener('touchend',e=>{
      if(e.touches.length<2){pinchStart=0;pinchScale=state.zoomScale;}
      if(e.touches.length===0){
        const end=e.changedTouches?.[0],start=swipeStart;panStart=null;swipeStart=null;
        if(state.zoomScale===1&&start&&end){const dx=end.clientX-start.x,dy=end.clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.15&&(state.zoomImages||[]).length>1){changeZoomImage(dx<0?1:-1);return;}}
        const now=Date.now();if(!gestureMoved&&now-lastTap<320){state.zoomScale=state.zoomScale>1?1:2;state.zoomX=0;state.zoomY=0;apply();lastTap=0;}else if(!gestureMoved){lastTap=now;}
      }
    },{passive:true});
    stage.addEventListener('dblclick',e=>{e.preventDefault();state.zoomScale=state.zoomScale>1?1:2;state.zoomX=0;state.zoomY=0;apply();});
    apply();
  }
  async function install(){if(state.installPrompt){await state.installPrompt.prompt();state.installPrompt=null;}else showToast('Use your browser menu and choose “Install app”');}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;});
  window.addEventListener('storage',()=>{state.products=S.getProducts();state.categories=S.getCategories();state.orders=S.getOrders();state.settings=S.getSettings();render();});
  window.addEventListener('one-line-change',()=>{state.products=S.getProducts();state.categories=S.getCategories();state.orders=S.getOrders();state.settings=S.getSettings();});
  document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('dragstart',e=>{if(!e.target.closest('input[type=file]'))e.preventDefault();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.zoomImage){closeZoom();}else if(e.key==='Escape'&&state.filterOpen){closeFilter(false);}else if(e.key==='Escape'&&state.menu){state.menu=false;render();}if((e.ctrlKey||e.metaKey)&&['+','-','=','0'].includes(e.key))e.preventDefault();});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
  try{
    const valid=['home','catalog','product','cart','checkout','orders','customize','b2b','b2bProduct'];const hash=location.hash.replace('#','');const params=new URLSearchParams(location.search);let initial=valid.includes(hash)?hash:'home';
    const sharedCategory=params.get('category'),sharedSub=params.get('subcategory'),sharedProduct=params.get('product'),sharedAudience=params.get('audience');
    if(sharedCategory){state.filterCategories=[sharedCategory];state.filterSubs=sharedSub?[sharedSub]:[];state.filterOptions=[];saveFilters();initial='catalog';}
    if(sharedProduct){const p=state.products.find(x=>String(x.id)===String(sharedProduct));if(p){state.selected=p;state.previewImage='';state.color=p.colors?.[0]||p.colorVariants?.[0]?.color||'';const sizes=state.color?p.colorVariants?.find(v=>v.color===state.color)?.sizes:p.sizes;state.size=(sizes||p.sizes||[])[0]||'';state.subItem=false;state.subColor=p.subItem?.colors?.[0]||p.subItem?.colorVariants?.[0]?.color||'';const subSizes=state.subColor?p.subItem?.colorVariants?.find(v=>String(v.color).toLowerCase()===String(state.subColor).toLowerCase())?.sizes:p.subItem?.sizes;state.subSize=(subSizes||p.subItem?.sizes||[])[0]||'';initial=(sharedAudience==='b2b'||p.audience==='b2b')?'b2bProduct':'product';}}
    state.screen=initial;
    if(!history.state?.oneLineGuard){history.replaceState({oneLine:true,oneLineGuard:true,guardBase:true,screen:'home',scrollY:0},'',location.pathname+location.search+'#home');history.pushState({oneLine:true,oneLineGuard:true,screen:initial,scrollY:0},'',location.pathname+location.search+'#'+initial);}else history.replaceState({...history.state,oneLine:true,oneLineGuard:true,screen:initial},'',location.pathname+location.search+'#'+initial);
  }catch(_){}
  window.addEventListener('popstate',e=>{
    if(e.state?.guardBase){state.screen='home';state.menu=false;state.filterOpen=false;state.filterDraft=null;resetZoomState();syncModalScrollLock();render();requestAnimationFrame(()=>window.scrollTo(0,0));setTimeout(()=>{try{history.pushState({oneLine:true,oneLineGuard:true,screen:'home',scrollY:0},'',location.pathname+location.search+'#home');}catch(_){}},0);return;}
    const next=e.state?.oneLine?e.state.screen:'home';
    if(e.state?.oneLineZoom){state.screen=next||state.screen;const gallery=state.selected?productGallery(state.selected):[];state.zoomImages=gallery.length?gallery:[e.state.zoomSrc].filter(Boolean);state.zoomIndex=Math.max(0,Math.min(state.zoomImages.length-1,Number(e.state.zoomIndex||0)));state.zoomImage=e.state.zoomSrc||state.zoomImages[state.zoomIndex]||'';state.zoomAlt=e.state.zoomAlt||'Product image';state.zoomScale=1;state.zoomX=0;state.zoomY=0;render();return;}
    resetZoomState();state.screen=next||'home';state.menu=false;state.filterOpen=false;state.filterDraft=null;render();requestAnimationFrame(()=>window.scrollTo(0,Number(e.state?.scrollY||0)));
  });
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});render();
})();
