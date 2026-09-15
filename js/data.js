(function () {
  "use strict";

  const palette = {
    Black: "#171817", White: "#f7f6f1", Navy: "#23314c", Maroon: "#7c2637",
    Olive: "#59634a", Sky: "#7ea8bf", Sand: "#c7aa79", Red: "#bd2437", Royal: "#315bb5"
  };

  const categoryDefaults = [
    { id:"cat-tshirt", name:"T-Shirts", sub:"Crew neck · Polo · Oversized", code:"01", tone:"acid", image:"assets/premium-polo-product.webp", subcategories:["Crew Neck","Polo","Oversized"] },
    { id:"cat-uniform", name:"Uniforms", sub:"School · Office · Industrial", code:"02", tone:"ink", image:"assets/premium-polo-product.webp", subcategories:["Office","School","Industrial"] },
    { id:"cat-sports", name:"Sportswear", sub:"Jerseys · Shorts · Tracksuits", code:"03", tone:"blue", image:"assets/sports-jersey.webp", subcategories:["Jerseys","Shorts","Tracksuits"] },
    { id:"cat-shirts", name:"Shirts", sub:"Formal · Casual · Workwear", code:"04", tone:"clay", image:"assets/polo-shirt.webp", subcategories:["Formal","Casual","Workwear"] },
    { id:"cat-tags", name:"Tags & Labels", sub:"Woven · Printed · Hang tags", code:"05", tone:"paper", image:"assets/crew-tee-back.webp", subcategories:["Woven Labels","Printed Labels","Hang Tags"] }
  ];

  const seedProducts = [
    { id:1, audience:"retail", name:"Heavyweight Crew Tee", category:"T-Shirts", subcategory:"Crew Neck", price:449, mrp:599, image:"assets/crew-tee.webp", type:"Colour + Option", colors:["Black","White","Olive"], sizes:["S","M","L","XL","XXL"], stock:42, description:"240 GSM combed cotton with a structured fit, reinforced neck and smooth print-ready surface.", colorGroups:[
      {color:"Black",image:"assets/crew-tee.webp",sizes:[{value:"S",stock:8},{value:"M",stock:8},{value:"L",stock:7},{value:"XL",stock:6},{value:"XXL",stock:4}]},
      {color:"White",image:"assets/crew-tee.webp",sizes:[{value:"S",stock:7},{value:"M",stock:8},{value:"L",stock:7},{value:"XL",stock:6},{value:"XXL",stock:4}]},
      {color:"Olive",image:"assets/crew-tee.webp",sizes:[{value:"S",stock:5},{value:"M",stock:6},{value:"L",stock:5},{value:"XL",stock:4},{value:"XXL",stock:3}]}
    ]},
    { id:2, audience:"retail", name:"Performance Team Jersey", category:"Sportswear", subcategory:"Jerseys", price:649, mrp:799, image:"assets/sports-jersey.webp", type:"Colour + Option", colors:["Navy","Maroon","Royal"], sizes:["S","M","L","XL"], stock:28, description:"Breathable quick-dry sports fabric made for team kits, club uniforms and custom printing.", colorGroups:[
      {color:"Navy",image:"assets/sports-jersey.webp",sizes:[{value:"S",stock:6},{value:"M",stock:7},{value:"L",stock:6},{value:"XL",stock:5}]},
      {color:"Maroon",image:"assets/sports-jersey.webp",sizes:[{value:"S",stock:5},{value:"M",stock:6},{value:"L",stock:5},{value:"XL",stock:4}]},
      {color:"Royal",image:"assets/sports-jersey.webp",sizes:[{value:"S",stock:5},{value:"M",stock:6},{value:"L",stock:5},{value:"XL",stock:4}]}
    ], subItem:{name:"Matching sports shorts",price:299,sizes:["S","M","L","XL"]} },
    { id:3, audience:"retail", name:"Executive Uniform Polo", category:"Uniforms", subcategory:"Office", price:720, mrp:890, image:"assets/premium-polo-product.webp", type:"Colour + Option", colors:["White","Sky","Navy"], sizes:["38","40","42","44"], stock:35, description:"Easy-care staff uniform with a clean professional profile and an embroidery-ready chest panel.", colorGroups:[
      {color:"White",image:"assets/premium-polo-product.webp",sizes:[{value:"38",stock:8},{value:"40",stock:8},{value:"42",stock:8},{value:"44",stock:7}]},
      {color:"Sky",image:"assets/premium-polo-product.webp",sizes:[{value:"38",stock:6},{value:"40",stock:7},{value:"42",stock:7},{value:"44",stock:5}]},
      {color:"Navy",image:"assets/premium-polo-product.webp",sizes:[{value:"38",stock:5},{value:"40",stock:6},{value:"42",stock:6},{value:"44",stock:5}]}
    ]},
    { id:4, audience:"retail", name:"Premium Polo T-Shirt", category:"T-Shirts", subcategory:"Polo", price:599, mrp:749, image:"assets/premium-polo-product.webp", type:"Colour + Option", colors:["Black","Navy","Maroon"], sizes:["M","L","XL","XXL"], stock:31, description:"Soft pique polo for staff uniforms, events and everyday business wear.", colorGroups:[
      {color:"Black",image:"assets/premium-polo-product.webp",sizes:[{value:"M",stock:8},{value:"L",stock:7},{value:"XL",stock:6},{value:"XXL",stock:4}]},
      {color:"Navy",image:"assets/premium-polo-product.webp",sizes:[{value:"M",stock:7},{value:"L",stock:7},{value:"XL",stock:5},{value:"XXL",stock:4}]},
      {color:"Maroon",image:"assets/premium-polo-product.webp",sizes:[{value:"M",stock:6},{value:"L",stock:6},{value:"XL",stock:5},{value:"XXL",stock:3}]}
    ]},
    { id:5, audience:"retail", name:"Woven Brand Label Set", category:"Tags & Labels", subcategory:"Woven Labels", price:380, mrp:450, image:"assets/crew-tee-back.webp", type:"One Option", colors:[], sizes:["50 pcs","100 pcs","250 pcs"], optionTitle:"Pack quantity", stock:18, description:"Durable custom woven labels with clean folded edges for garments and merchandise.", options:[
      {value:"50 pcs",stock:8,image:"assets/crew-tee-back.webp"},{value:"100 pcs",stock:6,image:"assets/crew-tee-back.webp"},{value:"250 pcs",stock:4,image:"assets/crew-tee-back.webp"}
    ]},
    { id:6, audience:"retail", name:"Classic Oxford Shirt", category:"Shirts", subcategory:"Formal", price:799, mrp:999, image:"assets/polo-shirt.webp", type:"Colour + Option", colors:["White","Sky","Navy"], sizes:["38","40","42","44"], stock:23, description:"A clean formal staple with reliable sizing and a smooth finish for monogramming.", colorGroups:[
      {color:"White",image:"assets/polo-shirt.webp",sizes:[{value:"38",stock:6},{value:"40",stock:6},{value:"42",stock:5},{value:"44",stock:4}]},
      {color:"Sky",image:"assets/polo-shirt.webp",sizes:[{value:"38",stock:5},{value:"40",stock:5},{value:"42",stock:4},{value:"44",stock:3}]},
      {color:"Navy",image:"assets/polo-shirt.webp",sizes:[{value:"38",stock:4},{value:"40",stock:5},{value:"42",stock:4},{value:"44",stock:3}]}
    ]}
  ];

  const seedB2BProducts = [
    { id:101, audience:"b2b", name:"Blank 240 GSM Crew Tee", category:"T-Shirts", subcategory:"Blank Garments", image:"assets/crew-tee.webp", type:"Colour + Option", colors:["White","Black","Navy"], sizes:["S","M","L","XL","XXL"], stock:120, description:"Bulk blank cotton T-shirt for printers, resellers and uniform suppliers.", colorGroups:[
      {color:"White",image:"assets/crew-tee.webp",sizes:[{value:"S",stock:25},{value:"M",stock:30},{value:"L",stock:25},{value:"XL",stock:20},{value:"XXL",stock:20}]},
      {color:"Black",image:"assets/crew-tee.webp",sizes:[{value:"S",stock:22},{value:"M",stock:28},{value:"L",stock:24},{value:"XL",stock:18},{value:"XXL",stock:16}]},
      {color:"Navy",image:"assets/crew-tee.webp",sizes:[{value:"S",stock:18},{value:"M",stock:22},{value:"L",stock:20},{value:"XL",stock:15},{value:"XXL",stock:12}]}
    ]},
    { id:102, audience:"b2b", name:"Blank Sports Jersey", category:"Sportswear", subcategory:"Blank Jerseys", image:"assets/sports-jersey.webp", type:"Colour + Option", colors:["White","Navy","Royal"], sizes:["S","M","L","XL"], stock:85, description:"Quick-dry blank sports jersey supplied in bulk for clubs and printing businesses.", colorGroups:[
      {color:"White",image:"assets/sports-jersey.webp",sizes:[{value:"S",stock:18},{value:"M",stock:22},{value:"L",stock:20},{value:"XL",stock:16}]},
      {color:"Navy",image:"assets/sports-jersey.webp",sizes:[{value:"S",stock:15},{value:"M",stock:20},{value:"L",stock:18},{value:"XL",stock:14}]},
      {color:"Royal",image:"assets/sports-jersey.webp",sizes:[{value:"S",stock:15},{value:"M",stock:18},{value:"L",stock:16},{value:"XL",stock:12}]}
    ]}
  ];

  const seedOrders = [
    { id:"CS-1048", customer:"Anand K", phone:"+91 98765 43210", total:1897, items:3, delivery:"Courier", payment:"Online · Paid", status:"Confirmed", time:"4 min ago", address:"Kozhikode, Kerala 673001", orderItems:[] },
    { id:"CS-1047", customer:"Bluepeak Academy", phone:"+91 97440 11882", total:8240, items:16, delivery:"Store pickup", payment:"Pay at pickup", status:"Packed", time:"28 min ago", address:"Mavoor Road, Kozhikode", orderItems:[] },
    { id:"CS-1046", customer:"Faris M", phone:"+91 81293 77121", total:1248, items:2, delivery:"Bus parcel", payment:"Online · Paid", status:"Ready", time:"1 hr ago", address:"Bus stand pickup, Malappuram", orderItems:[] }
  ];

  const deliveryDefaults = [
    { name:"Courier", note:"Door delivery · charge confirmed with order", active:true },
    { name:"Store pickup", note:"Collect from the production desk", active:true },
    { name:"Bus parcel", note:"Collect from your selected bus stand", active:true }
  ];

  const printDefaults = [
    { name:"DTF Print", price:180, note:"Vivid colour · works on light and dark garments", lightOnly:false },
    { name:"Screen Print", price:120, note:"Durable and cost-effective for bulk orders", lightOnly:false },
    { name:"Embroidery", price:260, note:"Premium thread finish for logos and names", lightOnly:false },
    { name:"Sublimation Print", price:150, note:"Light colours only. Sublimation ink cannot be seen correctly on dark fabric.", lightOnly:true }
  ];

  const settingsDefaults = { whatsapp:"", b2bLoginId:"B2B", b2bPassword:"1234" };

  const iconPaths = {
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>', bag:'<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/>', orders:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
    arrow:'<path d="M5 12h14M14 6l6 6-6 6"/>', back:'<path d="m15 18-6-6 6-6M9 12h11"/>', check:'<path d="m5 12 4 4L19 6"/>', shield:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>', package:'<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>',
    truck:'<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>', type:'<path d="M5 5h14M12 5v14M8 19h8"/>', image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/>',
    sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="18" r="2"/>', move:'<path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/>', sparkle:'<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>', map:'<path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"/><circle cx="12" cy="10" r="2"/>', card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
    download:'<path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>', chevron:'<path d="m6 9 6 6 6-6"/>', upload:'<path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"/>', rotate:'<path d="M20 11a8 8 0 1 0-2 5M20 4v7h-7"/>',
    box:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v5"/>', external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>', eye:'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2"/>', phone:'<path d="M7 3 4 5c0 8 7 15 15 15l2-3-5-3-2 2c-3-1-5-3-6-6l2-2-3-5Z"/>',
    edit:'<path d="m4 20 4-1 10-10-3-3L5 16l-1 4Z"/><path d="m13 8 3 3"/>', filter:'<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>', whatsapp:'<path d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8c.5 3 2 4.5 5 5"/>', lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
  };

  function icon(name, cls) { return '<svg class="icon '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(iconPaths[name]||iconPaths.sparkle)+'</svg>'; }
  function money(value) { return "₹"+Number(value||0).toLocaleString("en-IN"); }
  function esc(value) { return String(value ?? "").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
  function clone(value) { try { return structuredClone(value); } catch (_) { return JSON.parse(JSON.stringify(value)); } }
  function load(key, fallback) { try { const raw=localStorage.getItem(key); return raw?JSON.parse(raw):clone(fallback); } catch (_) { return clone(fallback); } }
  function save(key, value) { localStorage.setItem(key,JSON.stringify(value)); window.dispatchEvent(new CustomEvent("one-line-change",{detail:{key}})); }

  function getCategories(){ return load("custom-store-categories",categoryDefaults); }
  function getProducts(){ return load("custom-store-products",seedProducts).map(normalizeProduct); }
  function getB2BProducts(){ return load("custom-store-b2b-products",seedB2BProducts).map(normalizeProduct); }
  function getOrders(){ return load("custom-store-orders",seedOrders); }
  function getCart(){ return load("custom-store-cart",[]); }
  function getDelivery(){ return load("custom-store-delivery",deliveryDefaults); }
  function getPrints(){ const arr=load("custom-store-print-types",printDefaults); if(!arr.some(x=>/sublimation/i.test(x.name))) arr.push(clone(printDefaults[3])); return arr; }
  function getSettings(){ return Object.assign({},settingsDefaults,load("custom-store-settings",settingsDefaults)); }

  function normalizeProduct(p){
    const out=Object.assign({audience:"retail",type:"Simple",colors:[],sizes:["Default"],stock:0,description:"",image:"assets/crew-tee.webp"},p||{});
    if(out.type==="Colour + Option"){
      if(!Array.isArray(out.colorGroups)||!out.colorGroups.length){
        out.colorGroups=(out.colors||[]).map(c=>({color:c,image:out.variantImages?.[c]||out.image,sizes:(out.sizes||[]).map(s=>({value:s,stock:Number(out.stock||0)}))}));
      }
      out.colors=out.colorGroups.map(g=>g.color);
      out.sizes=[...new Set(out.colorGroups.flatMap(g=>(g.sizes||[]).map(s=>typeof s==='string'?s:s.value)))];
    } else if(out.type==="One Option"){
      if(!Array.isArray(out.options)||!out.options.length) out.options=(out.sizes||[]).map(v=>({value:v,stock:Number(out.stock||0),image:out.image}));
      out.sizes=out.options.map(x=>x.value);
    } else {
      out.sizes=out.sizes?.length?out.sizes:["Default"];
    }
    return out;
  }

  function productImage(product,color,option){
    const p=normalizeProduct(product);
    if(p.type==="Colour + Option") return p.colorGroups.find(g=>g.color===color)?.image || p.image;
    if(p.type==="One Option") return p.options.find(o=>o.value===option)?.image || p.image;
    return p.image;
  }
  function availableOptions(product){
    const p=normalizeProduct(product);
    if(p.type==="Colour + Option") return [...new Set(p.colorGroups.flatMap(g=>(g.sizes||[]).map(s=>typeof s==='string'?s:s.value)))];
    if(p.type==="One Option") return p.options.map(o=>o.value);
    return p.sizes||[];
  }
  function availableSubcategories(products,category){ return [...new Set(products.filter(p=>!category||category==='All'||p.category===category).map(p=>p.subcategory).filter(Boolean))].sort(); }
  function isDarkHex(hex){
    const clean=String(hex||'').replace('#',''); if(!/^[0-9a-f]{6}$/i.test(clean)) return false;
    const r=parseInt(clean.slice(0,2),16),g=parseInt(clean.slice(2,4),16),b=parseInt(clean.slice(4,6),16);
    return (0.2126*r+0.7152*g+0.0722*b)<150;
  }
  function isDarkColor(name){ return isDarkHex(palette[name]||name); }

  function surfaceDesign(design,surface){
    const blank={text:"",font:"Impact",textColor:"#fff",textSize:28,textRotation:0,imageSize:80,imageRotation:0,positions:{text:{x:50,y:40},image:{x:50,y:62}}};
    if(design?.surfaceDesigns?.[surface]) return Object.assign({},blank,design.surfaceDesigns[surface]);
    if(surface==="front"&&design) return Object.assign({},blank,design);
    return blank;
  }
  function designedSurfaces(design){ return ["front","back","rightSleeve","leftSleeve"].filter(s=>{const d=surfaceDesign(design,s);return d.text||d.uploadedImage;}); }
  function designPreview(design,surface,className){
    surface=surface||"front"; const d=surfaceDesign(design,surface); const sleeve=surface.includes("Sleeve");
    const garment=sleeve?(design.sleeveImage||"assets/sleeve-side-neutral.webp"):surface==="back"?(design.garmentBackImage||design.garmentImage):design.garmentImage;
    const mirror=surface==="rightSleeve"?" scaleX(-1)":""; const zone="zone-"+surface;
    const text=d.text?'<span class="saved-design-text" style="left:'+d.positions.text.x+'%;top:'+d.positions.text.y+'%;color:'+esc(d.textColor)+';font-family:'+esc(d.font)+';font-size:'+Math.max(7,d.textSize*.42)+'px;transform:translate(-50%,-50%) rotate('+(d.textRotation||0)+'deg)">'+esc(d.text)+'</span>':'';
    const image=d.uploadedImage?'<img class="saved-design-image" src="'+esc(d.uploadedImage)+'" alt="" style="left:'+d.positions.image.x+'%;top:'+d.positions.image.y+'%;width:'+Math.max(14,d.imageSize*.42)+'px;transform:translate(-50%,-50%) rotate('+(d.imageRotation||0)+'deg)" />':'';
    return '<div class="real-garment-preview preview-'+surface+' '+esc(className||'')+'"><div class="garment-depth"></div><img class="garment-photo '+(sleeve?'sleeve-preview ':'')+(surface==='rightSleeve'?'show-rightSleeve':'')+'" src="'+esc(garment)+'" alt="" style="transform:'+mirror+'"><span class="garment-tint '+(sleeve?'sleeve-preview ':'')+(surface==='rightSleeve'?'show-rightSleeve':'')+'" style="background:'+esc(palette[design.garmentColor]||design.garmentColor||palette.Navy)+';mask-image:url('+esc(garment)+');-webkit-mask-image:url('+esc(garment)+');transform:'+mirror+'"></span><div class="garment-print-zone '+zone+'">'+text+image+'</div></div>';
  }
  function whatsappUrl(message){ const settings=getSettings(), num=String(settings.whatsapp||'').replace(/\D/g,''); return num?'https://wa.me/'+num+'?text='+encodeURIComponent(message):'https://wa.me/?text='+encodeURIComponent(message); }

  window.OneLineStore={
    palette,categories:categoryDefaults,categoryDefaults,seedProducts,seedB2BProducts,seedOrders,deliveryDefaults,printDefaults,settingsDefaults,
    icon,money,esc,clone,load,save,getCategories,getProducts,getB2BProducts,getOrders,getCart,getDelivery,getPrints,getSettings,
    normalizeProduct,productImage,availableOptions,availableSubcategories,isDarkHex,isDarkColor,surfaceDesign,designedSurfaces,designPreview,whatsappUrl
  };
})();
