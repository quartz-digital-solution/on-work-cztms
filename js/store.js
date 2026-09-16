(()=>{
  'use strict';
  const VERSION='rebuilt-v1';
  const KEYS={
    products:`one-line-${VERSION}-products`,categories:`one-line-${VERSION}-categories`,cart:`one-line-${VERSION}-cart`,orders:`one-line-${VERSION}-orders`,
    settings:`one-line-${VERSION}-settings`,prints:`one-line-${VERSION}-prints`,delivery:`one-line-${VERSION}-delivery`,accounts:`one-line-${VERSION}-accounts`,draft:`one-line-${VERSION}-draft`
  };
  const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const money=v=>'₹'+Number(v||0).toLocaleString('en-IN');
  const uid=(prefix='ID')=>`${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const norm=v=>String(v??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();
  const load=(key,fallback)=>{try{const r=localStorage.getItem(key);return r?JSON.parse(r):clone(fallback);}catch{return clone(fallback)}};
  const save=(key,value)=>{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('one-line-data',{detail:{key}}));return value};

  const palette={Black:'#18191d',White:'#f6f5f1',Navy:'#1f2c43',Maroon:'#6e223b',Olive:'#566142',Sky:'#9ac6e9',Sand:'#cfb992',Red:'#b8333d',Green:'#2e724c',Yellow:'#e6bf3b',Grey:'#8d9198',Pink:'#d98ca0',Purple:'#6e1579'};
  const categories=[
    {id:'cat-tshirts',name:'T-Shirts',subtitle:'Crew · Polo · Everyday',image:'assets/category-tshirts.webp',active:true,order:1},
    {id:'cat-uniforms',name:'Uniforms',subtitle:'School · Office · Staff',image:'assets/category-uniforms.webp',active:true,order:2},
    {id:'cat-sports',name:'Sportswear',subtitle:'Teams · Jerseys · Training',image:'assets/category-sportswear.webp',active:true,order:3},
    {id:'cat-shirts',name:'Shirts',subtitle:'Formal · Workwear · Casual',image:'assets/category-shirts.webp',active:true,order:4},
    {id:'cat-tags',name:'Tags & Labels',subtitle:'Woven · Printed · ID',image:'assets/category-tags-labels.webp',active:true,order:5}
  ];
  const cv=(color,image,sizes)=>({color,image,sizes:[...sizes],stock:Object.fromEntries(sizes.map(s=>[s,8]))});
  const products=[
    {id:'p-crew',audience:'retail',name:'Heavyweight Crew Tee',category:'T-Shirts',subcategory:'Crew Neck',price:449,mrp:599,image:'assets/crew-tee.webp',images:['assets/crew-tee.webp','assets/crew-tee-back.webp'],type:'Colour + Option',optionTitle:'Size',colors:['Black','White','Olive'],sizes:['S','M','L','XL','XXL'],stock:42,colorVariants:[cv('Black','assets/crew-tee.webp',['S','M','L','XL','XXL']),cv('White','assets/tshirt-front.webp',['S','M','L','XL','XXL']),cv('Olive','assets/tshirts-category.webp',['S','M','L','XL'])],description:'A structured everyday tee with a clean ready-made finish and comfortable heavyweight feel.',keywords:'crew neck tshirt t shirt tee cotton heavyweight',active:true},
    {id:'p-polo',audience:'retail',name:'Premium Polo T-Shirt',category:'T-Shirts',subcategory:'Polo',price:599,mrp:749,image:'assets/premium-polo-product.webp',images:['assets/premium-polo-product.webp','assets/polo-shirt.webp','assets/polo-shirt-back.webp'],type:'Colour + Option',optionTitle:'Size',colors:['White','Green','Grey'],sizes:['M','L','XL','XXL'],stock:31,colorVariants:[cv('White','assets/premium-polo-product.webp',['M','L','XL','XXL']),cv('Green','assets/polo-shirt.webp',['M','L','XL']),cv('Grey','assets/polo-shirt-back.webp',['M','L','XL'])],description:'Soft polo for teams, staff and everyday business wear.',keywords:'polo tshirt collar office uniform',active:true},
    {id:'p-sports',audience:'retail',name:'Performance Team Jersey',category:'Sportswear',subcategory:'Jerseys',price:649,mrp:799,image:'assets/sports-jersey.webp',images:['assets/sports-jersey.webp','assets/sports-jersey-back.webp'],type:'Colour + Option',optionTitle:'Size',colors:['Green','White','Yellow'],sizes:['S','M','L','XL'],stock:28,colorVariants:[cv('Green','assets/sports-jersey.webp',['S','M','L','XL']),cv('White','assets/sports-jersey-back.webp',['S','M','L','XL']),cv('Yellow','assets/category-sportswear.webp',['S','M','L','XL'])],description:'Breathable team jersey made for training, clubs and bulk team orders.',keywords:'sports jersey team football cricket dry fit',active:true},
    {id:'p-uniform',audience:'retail',name:'Executive Uniform Shirt',category:'Uniforms',subcategory:'Office',price:720,mrp:890,image:'assets/uniform-shirt.webp',images:['assets/uniform-shirt.webp','assets/uniform-shirt-back.webp'],type:'Colour + Option',optionTitle:'Size',colors:['White','Sky','Sand'],sizes:['38','40','42','44'],stock:35,colorVariants:[cv('White','assets/uniform-shirt.webp',['38','40','42','44']),cv('Sky','assets/uniform-shirt-front.webp',['38','40','42','44']),cv('Sand','assets/uniform-shirt-back.webp',['38','40','42','44'])],description:'Professional ready-made shirt for office and staff use.',keywords:'uniform shirt office staff formal',active:true},
    {id:'p-workshirt',audience:'retail',name:'Classic Work Shirt',category:'Shirts',subcategory:'Formal',price:799,mrp:999,image:'assets/oxford-shirt.webp',images:['assets/oxford-shirt.webp','assets/uniform-shirt-front.webp'],type:'Colour + Option',optionTitle:'Size',colors:['Blue','White'],sizes:['38','40','42','44'],stock:23,colorVariants:[cv('Blue','assets/oxford-shirt.webp',['38','40','42','44']),cv('White','assets/uniform-shirt-front.webp',['38','40','42','44'])],description:'A clean formal shirt suitable for office, staff and workwear.',keywords:'shirt formal workwear office',active:true},
    {id:'p-tag',audience:'retail',name:'Student ID Tag',category:'Tags & Labels',subcategory:'ID Tags',price:120,mrp:150,image:'assets/student-id-tag.webp',images:['assets/student-id-tag.webp','assets/school-belt.webp'],type:'One Option',optionTitle:'Pack',colors:[],sizes:['1 pc','10 pcs','25 pcs'],stock:65,description:'Durable ID tag sample product. Bulk branding and custom sizes are available by enquiry.',keywords:'id tag school label badge',active:true},
    {id:'b-fabric',audience:'b2b',name:'180 GSM Cotton Fabric Roll',category:'T-Shirts',subcategory:'Raw Material',price:0,mrp:0,image:'assets/tshirts-category.webp',images:['assets/tshirts-category.webp'],type:'One Option',optionTitle:'Roll',colors:[],sizes:['25 kg roll','50 kg roll'],stock:100,description:'Cotton fabric supply for manufacturers and resellers.',keywords:'fabric roll cotton bulk wholesale',active:true},
    {id:'b-pique',audience:'b2b',name:'Pique Polo Fabric',category:'T-Shirts',subcategory:'Raw Material',price:0,mrp:0,image:'assets/category-tshirts.webp',images:['assets/category-tshirts.webp'],type:'One Option',optionTitle:'Roll',colors:[],sizes:['25 kg roll','50 kg roll'],stock:100,description:'Pique material for polo production.',keywords:'pique polo fabric wholesale',active:true},
    {id:'b-sports',audience:'b2b',name:'Sports Jersey Fabric',category:'Sportswear',subcategory:'Raw Material',price:0,mrp:0,image:'assets/category-sportswear.webp',images:['assets/category-sportswear.webp'],type:'One Option',optionTitle:'Roll',colors:[],sizes:['25 kg roll','50 kg roll'],stock:100,description:'Quick-dry sports fabric for teamwear production.',keywords:'sports fabric jersey wholesale',active:true}
  ];
  const printMethods=[
    {id:'dtf',name:'DTF Print',price:180,note:'Vivid colour. Works on light and dark garments.',lightOnly:false,active:true},
    {id:'screen',name:'Screen Print',price:120,note:'Durable and efficient for quantity orders.',lightOnly:false,active:true},
    {id:'embroidery',name:'Embroidery',price:260,note:'Premium stitched thread finish.',lightOnly:false,active:true},
    {id:'sublimation',name:'Sublimation',price:150,note:'For light garments only. It will not reproduce correctly on dark colours.',lightOnly:true,active:true}
  ];
  const delivery=[
    {id:'courier',name:'Courier',note:'Door delivery. Charge confirmed with order.',active:true},
    {id:'pickup',name:'Store pickup',note:'Collect from the production desk.',active:true},
    {id:'bus',name:'Bus parcel',note:'Collect from your selected bus stand.',active:true}
  ];
  const settings={brand:'One-Line',whatsapp:'',currency:'INR',b2bId:'B2B',b2bPassword:'1234'};
  const accounts=[
    {id:'a-admin',role:'admin',name:'Administrator',username:'admin',password:'admin123',active:true},
    {id:'a-management',role:'management',name:'Management',username:'management',password:'manage123',active:true},
    {id:'a-staff',role:'staff',name:'Sales Staff',username:'staff',password:'staff123',active:true},
    {id:'a-receiver',role:'receiver',name:'Order Receiving',username:'receiver',password:'receiver123',active:true}
  ];

  const api={
    KEYS,palette,esc,money,uid,norm,clone,
    getProducts:()=>load(KEYS.products,products),setProducts:v=>save(KEYS.products,v),
    getCategories:()=>load(KEYS.categories,categories),setCategories:v=>save(KEYS.categories,v),
    getCart:()=>load(KEYS.cart,[]),setCart:v=>save(KEYS.cart,v),
    getOrders:()=>load(KEYS.orders,[]),setOrders:v=>save(KEYS.orders,v),
    getSettings:()=>load(KEYS.settings,settings),setSettings:v=>save(KEYS.settings,v),
    getPrints:()=>load(KEYS.prints,printMethods),setPrints:v=>save(KEYS.prints,v),
    getDelivery:()=>load(KEYS.delivery,delivery),setDelivery:v=>save(KEYS.delivery,v),
    getAccounts:()=>load(KEYS.accounts,accounts),setAccounts:v=>save(KEYS.accounts,v),
    getDraft:()=>load(KEYS.draft,null),setDraft:v=>v?save(KEYS.draft,v):(localStorage.removeItem(KEYS.draft),null),
    reset(){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));location.reload();},
    productById(id){return api.getProducts().find(p=>String(p.id)===String(id));},
    categoryByName(name){return api.getCategories().find(c=>c.name===name);},
    imageFor(product,color){const v=(product?.colorVariants||[]).find(x=>norm(x.color)===norm(color));return v?.image||product?.images?.[0]||product?.image||'';},
    optionsFor(product,color){if(product?.type==='Simple')return[];const v=(product?.colorVariants||[]).find(x=>norm(x.color)===norm(color));return v?.sizes?.length?[...v.sizes]:[...(product?.sizes||[])];},
    addCart(item){const cart=api.getCart();const key=item.cartKey||uid('C');const existing=cart.find(x=>x.cartKey===key);if(existing)existing.qty+=Number(item.qty||1);else cart.push({...clone(item),cartKey:key,qty:Number(item.qty||1)});api.setCart(cart);return key;},
    updateCart(key,patch){const cart=api.getCart().map(x=>x.cartKey===key?{...x,...patch}:x);api.setCart(cart);return cart;},
    removeCart(key){const cart=api.getCart().filter(x=>x.cartKey!==key);api.setCart(cart);return cart;},
    cartTotal(){return api.getCart().reduce((n,x)=>n+Number(x.price||0)*Number(x.qty||1),0);},
    createOrder(customer){const cart=api.getCart();if(!cart.length)throw new Error('Cart is empty');const order={id:uid('OL'),createdAt:new Date().toISOString(),status:'Confirmed',customer:{...customer},items:clone(cart),subtotal:api.cartTotal(),total:api.cartTotal()};const orders=api.getOrders();orders.unshift(order);api.setOrders(orders);api.setCart([]);api.setDraft(null);return order;},
    updateOrder(id,patch){const orders=api.getOrders().map(o=>o.id===id?{...o,...patch}:o);api.setOrders(orders);return orders;},
    searchProducts(query,audience='retail'){const q=norm(query);return api.getProducts().filter(p=>p.active!==false&&p.audience===audience&&(!q||norm(`${p.name} ${p.category} ${p.subcategory} ${p.keywords||''}`).includes(q)));},
    whatsappUrl(message){const n=String(api.getSettings().whatsapp||'').replace(/\D/g,'');return `https://wa.me/${n}?text=${encodeURIComponent(message||'Hello')}`;},
    isDarkColor(name){return ['black','navy','maroon','olive','green','blue','charcoal','brown','purple'].some(x=>norm(name).includes(x));}
  };
  window.OneLine=api;
})();
