(function(){
  "use strict";
  const S=window.OneLineStore;
  const root=document.getElementById("admin-app");
  const state={view:"products",menu:false,products:S.getProducts(),categories:S.getCategories(),settings:S.getSettings(),prints:S.getPrints(),editingId:null,editingCategoryId:null,formImages:[],colourGroups:[],toast:""};
  const fallback="assets/crew-tee.webp";
  const esc=S.esc;
  const imageTag=(src,alt,cls)=>'<img '+(cls?'class="'+cls+'" ':'')+'src="'+esc(src||fallback)+'" alt="'+esc(alt||'')+'" onerror="this.onerror=null;this.src=\''+fallback+'\'">';
  const uid=()=>Date.now()+Math.floor(Math.random()*10000);
  const productById=id=>state.products.find(p=>String(p.id)===String(id));
  const currentProduct=()=>state.editingId?productById(state.editingId):null;
  const defaultForm=()=>({audience:"retail",category:state.categories[0]?.name||"",subcategory:"",name:"",description:"",type:"Simple",optionTitle:"Size",options:"",mrp:"",price:"",stock:"0"});
  let form=defaultForm();

  function saveProducts(){S.save("custom-store-products-v3",state.products);}
  function saveCategories(){S.save("custom-store-categories-v3",state.categories);}
  function toast(msg){state.toast=msg;renderToast();clearTimeout(toast.timer);toast.timer=setTimeout(()=>{state.toast="";renderToast();},2300);}
  function renderToast(){let el=document.getElementById("adminToast");if(!el)return;el.textContent=state.toast;el.classList.toggle("show",!!state.toast);}

  function shell(){
    root.innerHTML='<div class="admin-shell">'+
      '<header class="admin-head"><a class="admin-logo" href="index.html">'+imageTag("one-line-mark.svg","One-Line")+'<span><b>ONE-LINE</b><small>Admin</small></span></a><button class="menu-toggle" data-action="menu">☰</button><nav class="admin-menu '+(state.menu?'open':'')+'">'+
      nav("products","Products")+nav("add","Add Product")+nav("categories","Categories")+nav("settings","Settings")+'<button data-action="open-store">Open store</button></nav></header>'+
      '<div class="status-card"><span>Local catalog manager · '+state.products.length+' products · '+state.categories.length+' categories</span></div>'+
      '<main class="admin-main">'+view()+'</main><div class="toast" id="adminToast"></div></div>';
    bind();renderToast();
  }
  function nav(v,label){return '<button data-view="'+v+'" class="'+(state.view===v?'active':'')+'">'+label+'</button>';}
  function view(){if(state.view==="add")return editorView();if(state.view==="categories")return categoriesView();if(state.view==="settings")return settingsView();return productsView();}

  function productsView(){
    const cats=[...new Set(state.products.map(p=>p.category).filter(Boolean))];
    return '<section class="clean-card"><div class="panel-head"><div><p class="tag">products</p><h1>Product list</h1></div><div class="panel-actions"><button class="submit-small" data-action="new-product">+ Add product</button></div></div>'+
      '<div class="list-controls"><select id="adminCatFilter"><option value="">All categories</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join('')+'</select><input id="adminSearch" type="search" placeholder="Search product, category, subcategory or option"><button data-action="apply-product-filter">Load</button></div>'+
      '<div class="admin-product-list" id="adminProductList">'+productRows(state.products)+'</div></section>';
  }
  function productRows(items){
    if(!items.length)return '<div class="empty-admin">No products found.</div>';
    return items.map(p=>'<article class="admin-product">'+imageTag(p.image||p.images?.[0],p.name)+'<div class="admin-product-copy"><span class="audience-pill '+(p.audience==="b2b"?'b2b':'')+'">'+esc(p.audience==="b2b"?'B2B only':'Retail')+'</span><b>'+esc(p.name)+'</b><small>'+esc(p.category||'')+(p.subcategory?' · '+esc(p.subcategory):'')+'</small></div><div class="admin-product-meta"><b>'+esc(p.type||'Simple')+'</b><small>'+esc(p.optionTitle||'')+(S.productOptions(p).length?' · '+S.productOptions(p).length+' options':'')+'</small></div><div class="admin-product-price">'+(p.audience==="b2b"?'<b>Ask price</b><small>Hidden from retail</small>':'<b>'+S.money(p.price)+'</b>'+(p.mrp?'<del>'+S.money(p.mrp)+'</del>':''))+'</div><div class="row-actions"><button data-action="edit-product" data-id="'+p.id+'">Edit</button><button data-action="delete-product" data-id="'+p.id+'">Delete</button></div></article>').join('');
  }

  function editorView(){
    const p=currentProduct();
    return '<section class="clean-card"><div class="panel-head"><div><p class="tag">product editor</p><h1>'+(p?'Edit product':'Add product')+'</h1></div><div class="panel-actions"><button class="ghost-btn" data-view="products">Product list</button></div></div><form class="product-form" id="productForm"><div class="form-grid">'+
      '<div class="field-row"><label class="field"><span>Category</span><select id="fCategory" required><option value="">Select category</option>'+state.categories.map(c=>'<option '+(form.category===c.name?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label><label class="field"><span>Subcategory / filter</span><input id="fSubcategory" value="'+esc(form.subcategory)+'" placeholder="Crew neck / Office / Jersey"></label></div>'+
      '<label class="field"><span>Product name</span><input id="fName" value="'+esc(form.name)+'" required placeholder="Product name"></label>'+
      '<div class="field-row"><label class="field"><span>Visible to</span><select id="fAudience"><option value="retail" '+(form.audience==="retail"?'selected':'')+'>Retail customer</option><option value="b2b" '+(form.audience==="b2b"?'selected':'')+'>B2B only</option></select><small>B2B-only products never appear in the normal customer catalogue.</small></label><label class="field"><span>Available stock</span><input id="fStock" type="number" min="0" value="'+esc(form.stock)+'"></label></div>'+
      '<label class="field"><span>Description</span><textarea id="fDescription" placeholder="Short product detail">'+esc(form.description)+'</textarea></label>'+
      '<section class="editor-box"><div class="editor-box-head"><div><b>Product type & options</b><small>Same simple model as WellOne: Simple, One option, or Colour + option.</small></div></div><div class="product-type-row"><label class="field"><span>Product type</span><select id="fType"><option '+(form.type==="Simple"?'selected':'')+'>Simple</option><option '+(form.type==="One Option"?'selected':'')+'>One Option</option><option '+(form.type==="Colour + Option"?'selected':'')+'>Colour + Option</option></select></label></div>'+imagesEditor()+variantEditor()+'</section>'+
      pricingEditor()+'<div class="form-actions"><button type="button" class="ghost-btn" data-action="cancel-edit">Cancel</button><button type="submit" class="primary-btn">'+(p?'Save changes':'Add product')+'</button></div></div></form></section>';
  }

  function imagesEditor(){
    return '<section><div class="upload-zone"><input id="productImages" type="file" accept="image/*" multiple><div><b>Add product images</b><br><small>Use real product photos. Multiple images are allowed.</small></div></div><label class="field" style="margin-top:9px"><span>Or image URL</span><input id="imageUrl" placeholder="https://... (optional)"></label><div class="image-preview-grid">'+state.formImages.map((src,i)=>'<div class="image-chip">'+imageTag(src,'Product image')+'<button type="button" data-action="remove-form-image" data-index="'+i+'">×</button></div>').join('')+'</div></section>';
  }
  function variantEditor(){
    if(form.type==="Simple")return '<p class="variant-help">Simple product has no customer option selector.</p>';
    if(form.type==="One Option")return '<div class="field-row"><label class="field"><span>Option title</span><input id="fOptionTitle" value="'+esc(form.optionTitle)+'" placeholder="Size / Pack / ml"></label><label class="field"><span>Options</span><input id="fOptions" value="'+esc(form.options)+'" placeholder="S, M, L, XL"></label></div><p class="variant-help">Separate values with commas. The same product images are used for all options.</p>';
    return '<div class="field-row"><label class="field"><span>Option title</span><input id="fOptionTitle" value="'+esc(form.optionTitle)+'" placeholder="Size"></label><div></div></div><p class="variant-help">Each colour gets one image. That one colour image is automatically reused for every size/option under that colour.</p><div class="option-builder">'+state.colourGroups.map((g,i)=>colourGroup(g,i)).join('')+'<button type="button" class="add-group" data-action="add-colour-group">+ Add colour group</button></div>';
  }
  function colourGroup(g,i){
    return '<div class="colour-group" data-group="'+i+'"><div class="colour-group-head"><label class="field"><span>Colour</span><input data-group-color="'+i+'" value="'+esc(g.color)+'" placeholder="Black"></label><label class="field"><span>Options for this colour</span><input data-group-options="'+i+'" value="'+esc(g.options)+'" placeholder="S, M, L, XL"></label><button type="button" class="remove-group" data-action="remove-colour-group" data-index="'+i+'">Remove</button></div><div class="colour-image-control">'+imageTag(g.image||fallback,g.color||'Colour image')+'<div><b>Colour image</b><small>One image is reused for every size/option in this colour.</small><label>Add colour image<input data-group-image="'+i+'" type="file" accept="image/*"></label><input data-group-url="'+i+'" value="'+esc(g.url||'')+'" placeholder="Or paste image URL" style="min-height:38px;padding:0 9px;border:1px solid #d7e2bc;border-radius:9px"></div></div></div>';
  }
  function pricingEditor(){
    if(form.audience==="b2b")return '<div class="b2b-info"><b>B2B price is hidden.</b><br>The B2B customer sees “Ask for price” and is redirected to WhatsApp. No fixed rate is required.</div>';
    return '<div class="field-row"><label class="field"><span>MRP / crossed price</span><input id="fMrp" type="number" min="0" value="'+esc(form.mrp)+'" placeholder="999"></label><label class="field"><span>Final price</span><input id="fPrice" type="number" min="0" value="'+esc(form.price)+'" placeholder="699" required></label></div>';
  }

  function categoriesView(){
    const editing=state.categories.find(c=>String(c.id)===String(state.editingCategoryId));
    return '<section class="clean-card"><div class="panel-head"><div><p class="tag">catalog setup</p><h1>Categories</h1></div></div><div class="category-layout"><form class="category-form" id="categoryForm"><h2>'+(editing?'Edit category':'Create category')+'</h2><label class="field"><span>Category name</span><input id="catName" value="'+esc(editing?.name||'')+'" required placeholder="Jerseys"></label><label class="field" style="margin-top:10px"><span>Short description</span><input id="catSub" value="'+esc(editing?.sub||'')+'" placeholder="Teamwear · Sports"></label><label class="field" style="margin-top:10px"><span>Real category image URL</span><input id="catImageUrl" value="'+esc(editing?.image||'')+'" placeholder="https://..."></label><div class="upload-zone" style="min-height:86px"><input id="catImageFile" type="file" accept="image/*"><div><b>Or upload category image</b><br><small>Use a real 3:4 photo.</small></div></div><div class="form-actions" style="position:static;margin:10px 0 0;padding:0;background:none"><button type="button" class="ghost-btn" data-action="cancel-category">Clear</button><button class="primary-btn" type="submit">'+(editing?'Save category':'Add category')+'</button></div></form><div class="category-list">'+state.categories.map(c=>'<article class="category-card">'+imageTag(c.image,c.name)+'<div class="category-card-copy"><b>'+esc(c.name)+'</b><small>'+esc(c.sub||'')+'</small><div class="category-card-actions"><button data-action="edit-category" data-id="'+esc(c.id)+'">Edit</button><button data-action="delete-category" data-id="'+esc(c.id)+'">Delete</button></div></div></article>').join('')+'</div></div></section>';
  }

  function settingsView(){
    return '<section class="clean-card"><div class="panel-head"><div><p class="tag">store controls</p><h1>Settings</h1></div></div><div class="settings-grid"><form class="settings-box" id="settingsForm"><h2>WhatsApp & B2B</h2><p>Used by ready-made customization enquiries and B2B “Ask for price”.</p><label class="field"><span>WhatsApp number</span><input id="setWhatsapp" value="'+esc(state.settings.whatsapp||'')+'" placeholder="919876543210"></label><label class="field" style="margin-top:10px"><span>B2B login ID</span><input id="setB2bId" value="'+esc(state.settings.b2bId||'B2B')+'"></label><label class="field" style="margin-top:10px"><span>B2B password</span><input id="setB2bPassword" value="'+esc(state.settings.b2bPassword||'1234')+'"></label><button class="settings-save" type="submit">Save settings</button></form><form class="settings-box" id="printsForm"><h2>Printing types</h2><p>These appear in the customizer. Sublimation remains light-colour only automatically.</p><div class="print-admin-list">'+state.prints.map((p,i)=>'<div class="print-admin-row"><label class="field"><span>'+esc(p.name)+'</span><input data-print-note="'+i+'" value="'+esc(p.note||'')+'"></label><label class="field"><span>Price</span><input data-print-price="'+i+'" type="number" min="0" value="'+Number(p.price||0)+'"></label></div>').join('')+'</div><button class="settings-save" type="submit">Save print settings</button></form></div></section>';
  }

  function readForm(){
    const v=id=>document.getElementById(id)?.value;
    form.category=v("fCategory")??form.category;form.subcategory=v("fSubcategory")??form.subcategory;form.name=v("fName")??form.name;form.audience=v("fAudience")??form.audience;form.stock=v("fStock")??form.stock;form.description=v("fDescription")??form.description;form.type=v("fType")??form.type;form.optionTitle=v("fOptionTitle")??form.optionTitle;form.options=v("fOptions")??form.options;form.mrp=v("fMrp")??form.mrp;form.price=v("fPrice")??form.price;
    state.colourGroups.forEach((g,i)=>{const c=document.querySelector('[data-group-color="'+i+'"]');const o=document.querySelector('[data-group-options="'+i+'"]');const u=document.querySelector('[data-group-url="'+i+'"]');if(c)g.color=c.value;if(o)g.options=o.value;if(u)g.url=u.value;});
  }
  function comma(v){return [...new Set(String(v||'').split(',').map(x=>x.trim()).filter(Boolean))];}
  function startNew(){state.editingId=null;form=defaultForm();state.formImages=[];state.colourGroups=[{color:"",options:"",image:"",url:""}];state.view="add";state.menu=false;shell();}
  function startEdit(id){const p=productById(id);if(!p)return;state.editingId=p.id;form={audience:p.audience||"retail",category:p.category||"",subcategory:p.subcategory||"",name:p.name||"",description:p.description||"",type:p.type||"Simple",optionTitle:p.optionTitle||"Size",options:(p.sizes||[]).join(', '),mrp:p.mrp||"",price:p.price||"",stock:p.stock??0};state.formImages=[...(p.images?.length?p.images:[p.image]).filter(Boolean)];state.colourGroups=(p.colorVariants?.length?p.colorVariants.map(v=>({color:v.color||"",options:(v.sizes||[]).join(', '),image:v.image||"",url:""})):[{color:"",options:"",image:"",url:""}]);state.view="add";state.menu=false;shell();}

  async function compress(file){
    if(!file||!file.type.startsWith('image/'))return "";
    return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>{const im=new Image();im.onload=()=>{const max=1000,scale=Math.min(1,max/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*scale)),h=Math.max(1,Math.round(im.height*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(im,0,0,w,h);resolve(canvas.toDataURL('image/webp',.8));};im.onerror=()=>resolve(String(reader.result||''));im.src=reader.result;};reader.onerror=()=>resolve("");reader.readAsDataURL(file);});
  }

  function saveProduct(e){
    e.preventDefault();readForm();
    const url=document.getElementById('imageUrl')?.value?.trim();if(url&&!state.formImages.includes(url))state.formImages.push(url);
    if(!form.name.trim()||!form.category){toast('Add product name and category.');return;}
    if(form.audience==='retail'&&!Number(form.price)){toast('Add the retail final price.');return;}
    let colorVariants=[],colors=[],sizes=[];
    if(form.type==='One Option')sizes=comma(form.options);
    if(form.type==='Colour + Option'){
      colorVariants=state.colourGroups.map(g=>({color:g.color.trim(),image:(g.image||g.url||state.formImages[0]||fallback),sizes:comma(g.options)})).filter(g=>g.color&&g.sizes.length);
      if(!colorVariants.length){toast('Add at least one colour with its sizes/options.');return;}
      colors=colorVariants.map(g=>g.color);sizes=[...new Set(colorVariants.flatMap(g=>g.sizes))];
    }
    const old=currentProduct(),id=old?.id||uid(),images=state.formImages.length?state.formImages.slice():(colorVariants.length?colorVariants.map(x=>x.image):[fallback]);
    const product={...(old||{}),id,audience:form.audience,name:form.name.trim(),category:form.category,subcategory:form.subcategory.trim(),description:form.description.trim(),type:form.type,optionTitle:form.type==='Simple'?'':(form.optionTitle.trim()||'Option'),sizes,colors,colorVariants,images,image:images[0]||fallback,stock:Number(form.stock||0),price:form.audience==='b2b'?0:Number(form.price||0),mrp:form.audience==='b2b'?0:Number(form.mrp||0)};
    const idx=state.products.findIndex(x=>String(x.id)===String(id));if(idx>=0)state.products[idx]=product;else state.products.unshift(product);saveProducts();toast(old?'Product updated.':'Product added.');state.view='products';state.editingId=null;form=defaultForm();state.formImages=[];state.colourGroups=[];shell();
  }

  function bind(){
    root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{readForm();state.view=b.dataset.view;state.menu=false;if(state.view==='add'&&!state.editingId&&form.name==='')startNew();else shell();}));
    root.querySelector('[data-action="menu"]')?.addEventListener('click',()=>{state.menu=!state.menu;shell();});
    root.querySelector('[data-action="open-store"]')?.addEventListener('click',()=>location.href='index.html');
    root.querySelector('[data-action="new-product"]')?.addEventListener('click',startNew);
    root.querySelectorAll('[data-action="edit-product"]').forEach(b=>b.addEventListener('click',()=>startEdit(b.dataset.id)));
    root.querySelectorAll('[data-action="delete-product"]').forEach(b=>b.addEventListener('click',()=>{const p=productById(b.dataset.id);if(!p||!confirm('Delete '+p.name+'?'))return;state.products=state.products.filter(x=>String(x.id)!==String(p.id));saveProducts();shell();toast('Product deleted.');}));
    root.querySelector('[data-action="apply-product-filter"]')?.addEventListener('click',filterAdminProducts);root.querySelector('#adminSearch')?.addEventListener('input',filterAdminProducts);root.querySelector('#adminCatFilter')?.addEventListener('change',filterAdminProducts);
    root.querySelector('#fType')?.addEventListener('change',e=>{readForm();form.type=e.target.value;if(form.type==='Colour + Option'&&!state.colourGroups.length)state.colourGroups=[{color:'',options:'',image:'',url:''}];shell();});
    root.querySelector('#fAudience')?.addEventListener('change',e=>{readForm();form.audience=e.target.value;shell();});
    root.querySelector('#productForm')?.addEventListener('submit',saveProduct);root.querySelector('[data-action="cancel-edit"]')?.addEventListener('click',()=>{state.view='products';state.editingId=null;form=defaultForm();state.formImages=[];state.colourGroups=[];shell();});
    root.querySelector('#productImages')?.addEventListener('change',async e=>{readForm();const list=Array.from(e.target.files||[]);for(const f of list){const src=await compress(f);if(src)state.formImages.push(src);}shell();});
    root.querySelectorAll('[data-action="remove-form-image"]').forEach(b=>b.addEventListener('click',()=>{readForm();state.formImages.splice(Number(b.dataset.index),1);shell();}));
    root.querySelector('[data-action="add-colour-group"]')?.addEventListener('click',()=>{readForm();state.colourGroups.push({color:'',options:'',image:'',url:''});shell();});
    root.querySelectorAll('[data-action="remove-colour-group"]').forEach(b=>b.addEventListener('click',()=>{readForm();state.colourGroups.splice(Number(b.dataset.index),1);if(!state.colourGroups.length)state.colourGroups.push({color:'',options:'',image:'',url:''});shell();}));
    root.querySelectorAll('[data-group-image]').forEach(input=>input.addEventListener('change',async e=>{readForm();const i=Number(input.dataset.groupImage),src=await compress(e.target.files?.[0]);if(src)state.colourGroups[i].image=src;shell();}));
    root.querySelector('#categoryForm')?.addEventListener('submit',saveCategory);root.querySelector('[data-action="cancel-category"]')?.addEventListener('click',()=>{state.editingCategoryId=null;shell();});
    root.querySelectorAll('[data-action="edit-category"]').forEach(b=>b.addEventListener('click',()=>{state.editingCategoryId=b.dataset.id;shell();}));
    root.querySelectorAll('[data-action="delete-category"]').forEach(b=>b.addEventListener('click',()=>{const c=state.categories.find(x=>String(x.id)===String(b.dataset.id));if(!c||!confirm('Delete category '+c.name+'?'))return;state.categories=state.categories.filter(x=>String(x.id)!==String(c.id));saveCategories();shell();toast('Category deleted.');}));
    root.querySelector('#settingsForm')?.addEventListener('submit',e=>{e.preventDefault();state.settings={...state.settings,whatsapp:document.getElementById('setWhatsapp').value.trim().replace(/[^0-9]/g,''),b2bId:document.getElementById('setB2bId').value.trim()||'B2B',b2bPassword:document.getElementById('setB2bPassword').value||'1234'};S.save('custom-store-settings-v3',state.settings);toast('Settings saved.');});
    root.querySelector('#printsForm')?.addEventListener('submit',e=>{e.preventDefault();state.prints=state.prints.map((p,i)=>({...p,note:document.querySelector('[data-print-note="'+i+'"]')?.value||p.note,price:Number(document.querySelector('[data-print-price="'+i+'"]')?.value||0)}));S.save('custom-store-print-types-v3',state.prints);toast('Print settings saved.');});
  }
  function filterAdminProducts(){const q=(document.getElementById('adminSearch')?.value||'').trim().toLowerCase(),cat=document.getElementById('adminCatFilter')?.value||'';const list=state.products.filter(p=>(!cat||p.category===cat)&&(!q||[p.name,p.category,p.subcategory,p.type,p.optionTitle,...(p.sizes||[]),...(p.colors||[])].join(' ').toLowerCase().includes(q)));document.getElementById('adminProductList').innerHTML=productRows(list);root.querySelectorAll('[data-action="edit-product"]').forEach(b=>b.addEventListener('click',()=>startEdit(b.dataset.id)));root.querySelectorAll('[data-action="delete-product"]').forEach(b=>b.addEventListener('click',()=>{const p=productById(b.dataset.id);if(p&&confirm('Delete '+p.name+'?')){state.products=state.products.filter(x=>String(x.id)!==String(p.id));saveProducts();shell();}}));}

  async function saveCategory(e){
    e.preventDefault();const name=document.getElementById('catName').value.trim(),sub=document.getElementById('catSub').value.trim(),url=document.getElementById('catImageUrl').value.trim(),file=document.getElementById('catImageFile').files?.[0];if(!name){toast('Category name is required.');return;}let image=file?await compress(file):url;const old=state.categories.find(c=>String(c.id)===String(state.editingCategoryId));if(!image)image=old?.image||S.onlineImages?.tshirtBlack||fallback;const obj={...(old||{}),id:old?.id||('cat-'+uid()),name,sub,code:old?.code||String(state.categories.length+1).padStart(2,'0'),tone:old?.tone||'paper',image};if(old){const previousName=old.name;const idx=state.categories.findIndex(c=>String(c.id)===String(old.id));state.categories[idx]=obj;if(previousName!==name){state.products=state.products.map(p=>p.category===previousName?{...p,category:name}:p);saveProducts();}}else state.categories.push(obj);saveCategories();state.editingCategoryId=null;shell();toast(old?'Category updated.':'Category added.');
  }

  window.addEventListener('storage',e=>{if(['custom-store-products-v3','custom-store-categories-v3','custom-store-settings-v3','custom-store-print-types-v3'].includes(e.key)){state.products=S.getProducts();state.categories=S.getCategories();state.settings=S.getSettings();state.prints=S.getPrints();shell();}});
  shell();
})();
