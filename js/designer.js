(function(){
"use strict";
const S=window.OneLineStore,I=S.icon;
const surfaces=[{id:"front",label:"Front",short:"Front"},{id:"back",label:"Back",short:"Back"},{id:"rightSleeve",label:"Right sleeve",short:"R sleeve"},{id:"leftSleeve",label:"Left sleeve",short:"L sleeve"}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function select(options,value,attr){return '<select '+attr+'>'+options.map(x=>'<option value="'+S.esc(x.value)+'" '+(x.value===value?'selected':'')+' '+(x.disabled?'disabled':'')+'>'+S.esc(x.label)+'</option>').join('')+'</select>';}
function mount(root,hooks){
  const products=S.getProducts().filter(p=>p.active&&p.customSection&&(hooks?.account?(p.b2bEnabled||p.b2bOnly):!p.b2bOnly));
  const requested=hooks?.product;
  const initial=products.find(p=>String(p.id)===String(requested?.id))||products[0];
  if(!initial){root.innerHTML='<div class="empty-state"><h2>No customizable products</h2><p>Add or enable a product in Admin → Customizable.</p></div>';return;}
  const initialColours=S.customizerColours(initial);
  const requestedColour=hooks?.color&&initialColours.includes(hooks.color)?hooks.color:null;
  const requestedSize=hooks?.size&&(initial.sizes||[]).includes(hooks.size)?hooks.size:null;
    const initialPrints=S.getPrints().filter(x=>x.active&&(initial.allowedPrintIds||[]).includes(x.id));
  const state={product:initial,color:requestedColour||initialColours[0]||"White",size:requestedSize||initial.sizes?.[0]||"Default",printId:initialPrints[0]?.id||"dtf",surface:"front",qty:1,activeId:null,pickerOpen:false,notice:"",fabricId:S.getFabrics().find(f=>f.active&&(initial.allowedFabricIds||[]).includes(f.id))?.id||"",designs:{front:{layers:[]},back:{layers:[]},rightSleeve:{layers:[]},leftSleeve:{layers:[]}}};
  const pointers=new Map();let gesture=null,lastTap={id:null,time:0,x:0,y:0};
  function editText(id){const l=current().layers.find(l=>l.id===id);if(!l||l.type!=='text')return;state.activeId=id;render();const field=root.querySelector('[data-layer-text]');field?.focus({preventScroll:true});field?.select();field?.closest('.active-layer-editor')?.scrollIntoView({block:'nearest',behavior:'smooth'});}

  products.flatMap(p=>[p.image,p.backImage,p.leftSleeveImage,p.rightSleeveImage,p.customizerImage,p.customizerBackImage,p.customizerSleeveImage]).filter(Boolean).forEach(src=>{const im=new Image();im.src=src;});
  const current=()=>state.designs[state.surface];
  const active=()=>current().layers.find(x=>x.id===state.activeId);
  const methods=()=>S.getPrints().filter(x=>x.active&&(state.product.allowedPrintIds||[]).includes(x.id));
  const method=id=>methods().find(x=>x.id===id)||methods()[0];
  const allLayers=()=>Object.values(state.designs).flatMap(x=>x.layers);
  const layerPrice=l=>Number(l.type==="text"?method(state.printId)?.textPrice:method(state.printId)?.price)||0;
  const fabrics=()=>S.getFabrics().filter(f=>f.active&&(state.product.allowedFabricIds||[]).includes(f.id));
  const fabric=()=>fabrics().find(f=>f.id===state.fabricId);
  const rawUnit=()=>S.productPrice(state.product,state.color,state.size)+Number(fabric()?.price||0)+allLayers().reduce((n,l)=>n+layerPrice(l),0);
  const discount=()=>S.discountFor(state.qty,hooks?.account);
  const unitPrice=()=>Math.round(rawUnit()*(100-discount())/100);
  const imageFor=()=>S.customizerImage(state.product,state.color,state.surface);
  function addLayer(type,src){
    const id=type+"-"+Date.now()+"-"+Math.random().toString(16).slice(2);
    const layer={id,type,text:type==="text"?"YOUR TEXT":"",src:src||"",font:"Impact",colour:"#ffffff",size:type==="text"?30:82,rotation:0,x:50,y:type==="text"?40:60,printId:state.printId};
    current().layers.push(layer);state.activeId=id;render();if(type==="text")setTimeout(()=>root.querySelector("[data-layer-text]")?.select(),0);
  }
  function validMethod(printId){const m=method(printId);return Boolean(m)&&!(m.lightOnly&&!S.isLightColour(S.colourValue(state.product,state.color)));}
  function ensureValidMethod(){if(validMethod(state.printId))return;const compatible=methods().find(x=>!(x.lightOnly&&!S.isLightColour(S.colourValue(state.product,state.color))));state.printId=compatible?.id||methods()[0]?.id||"";allLayers().forEach(l=>l.printId=state.printId);state.notice=compatible?"Sublimation is available only on light colours. A compatible print method was selected.":"No printing method is available for this dark garment colour. Choose another colour or contact us.";}
  function itemPicker(){return '<div class="item-picker '+(state.pickerOpen?'open':'')+'"><button type="button" class="item-picker-trigger" data-action="toggle-item-picker" aria-expanded="'+state.pickerOpen+'"><img src="'+S.esc(S.customizerImage(state.product,state.color,"front"))+'" alt=""><span><small>SELECT ITEM</small><b>'+S.esc(state.product.name)+'</b></span>'+I("chevron")+'</button><div class="item-picker-menu" '+(state.pickerOpen?'':'hidden')+'>'+products.map(x=>{const colour=S.customizerColours(x)[0]||"White";return '<button type="button" data-picker-product="'+x.id+'" class="'+(String(x.id)===String(state.product.id)?'active':'')+'"><img src="'+S.esc(S.customizerImage(x,colour,"front"))+'" alt=""><span><b>'+S.esc(x.name)+'</b><small>'+S.esc(x.category)+' · '+S.money(x.price)+'</small></span>'+(String(x.id)===String(state.product.id)?I("check"):I("arrow"))+'</button>';}).join("")+'</div></div>';}
  function layerHtml(l,interactive){const selected=l.id===state.activeId,style='left:'+l.x+'%;top:'+l.y+'%;'+(l.type==="text"?'color:'+l.colour+';font-family:'+S.esc(l.font)+';font-size:'+l.size+'px;':'width:'+l.size+'px;')+'transform:translate(-50%,-50%) rotate('+l.rotation+'deg)',content=l.type==="text"?'<span data-layer-content="'+l.id+'">'+S.esc(l.text)+'</span>':'<img data-layer-content="'+l.id+'" src="'+S.esc(l.src)+'" alt="Uploaded artwork" draggable="false">';return '<div class="design-layer '+l.type+'-layer '+(interactive?'interaction-layer ':'printed-layer ')+(selected&&interactive?'selected':'')+'" '+(interactive?'data-design-layer="'+l.id+'" ':'')+'data-layer-view="'+l.id+'" style="'+style+'"><span class="layer-visual">'+content+'</span>'+(selected&&interactive?'<button class="layer-remove" data-remove-layer="'+l.id+'" aria-label="Delete">'+I('close')+'</button><button class="layer-rotate" data-transform-layer="'+l.id+'" aria-label="Resize and rotate">'+I('rotate')+'</button>':'')+'</div>';}
  function render(){
    pointers.clear();gesture=null;if(!fabric())state.fabricId=fabrics()[0]?.id||"";
    ensureValidMethod();
    const p=state.product,l=active(),src=imageFor(),sleeve=state.surface.includes("Sleeve"),offer=S.bestBulkOffer(state.qty),tint=S.shouldTintCustomizer(p),colourChangeable=p.customColourMode==="changeable",printMethod=method(state.printId),layerCount=allLayers().length,mirrorSleeve=colourChangeable&&state.surface==="rightSleeve";
    const areaStyle=S.printAreaStyle(S.customizerPrintArea(p,state.surface));
    root.innerHTML='<main class="designer-page compact-designer">'+
      '<header class="sub-header refined-sub-header"><button class="designer-back" data-action="back">'+I("back")+'</button><div class="step-label"><span>01</span> BUILD YOUR PRODUCT</div><button class="cart-button" data-action="add"><span>Add · '+S.money(unitPrice()*state.qty)+'</span>'+I("bag")+'</button></header>'+
      '<div class="designer-layout compact-designer-layout"><section class="designer-stage compact-stage" data-stage>'+
        '<div class="compact-designer-bar"><div class="compact-surface-tabs">'+surfaces.map(x=>'<button data-surface="'+x.id+'" class="'+(x.id===state.surface?'active':'')+'"><span class="full-label">'+x.label+'</span><span class="short-label">'+x.short+'</span>'+(state.designs[x.id].layers.length?'<i>'+state.designs[x.id].layers.length+'</i>':'')+'</button>').join("")+'</div>'+itemPicker()+'</div>'+
        '<div class="stage-topline"><span>'+surfaces.find(x=>x.id===state.surface).label+'</span><span>'+(sleeve?'SIDE-PROFILE SLEEVE VIEW':'ACTUAL PRODUCT VIEW')+'</span></div>'+
        '<svg class="fabric-filter" aria-hidden="true"><filter id="cloth-print-warp"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.07" numOctaves="2" seed="8" result="cloth"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="cloth" scale="1.45" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap></filter></svg>'+
        '<div class="shirt-canvas compact-shirt-canvas view-'+state.surface+'"><div class="live-garment compact-garment garment-'+state.surface+' '+(tint?'tint-enabled':'fixed-garment')+'"><div class="garment-depth"></div><img class="garment-photo '+(sleeve?'sleeve-photo ':'')+(mirrorSleeve?'mirror-sleeve ':'')+'" src="'+S.esc(src)+'" alt="'+S.esc(p.name)+'" draggable="false">'+(tint?'<div class="garment-tint '+(sleeve?'sleeve-tint ':'')+(mirrorSleeve?'mirror-sleeve ':'')+'" style="background:'+S.colourValue(p,state.color)+';mask-image:url('+S.esc(src)+');-webkit-mask-image:url('+S.esc(src)+')"></div>':'')+'<div class="print-area print-area-clip surface-'+state.surface+'" style="'+areaStyle+'">'+current().layers.map(l=>layerHtml(l,false)).join("")+'</div><div class="print-area interaction-area surface-'+state.surface+'" style="'+areaStyle+'" data-print-area>'+current().layers.map(l=>layerHtml(l,true)).join("")+'</div></div></div>'+
        '<p class="drag-hint">'+I("move")+' Drag to move. Pinch to resize and rotate. Double-tap text to edit.</p></section>'+
      '<aside class="designer-controls compact-controls"><div class="control-head"><span>DESIGN CONTROLS</span><small>'+current().layers.length+' element'+(current().layers.length===1?'':'s')+' on this side</small></div>'+
        (state.notice?'<div class="designer-warning">'+S.esc(state.notice)+'</div>':'')+
        '<div class="quick-layer-tools"><button data-action="add-text">'+I("type")+'<span>Add text</span></button><button data-action="choose-image">'+I("image")+'<span>Add image</span></button><input data-file hidden type="file" accept="image/png,image/jpeg,image/webp"></div><a class="custom-help-button" href="'+S.whatsappUrl("Hello, I need more customization help for "+p.name+".")+'" target="_blank" rel="noopener">'+I("phone")+'<span><b>Contact us for more customization</b><small>Special placement, bulk branding or design support</small></span>'+I("arrow")+'</a>'+
        '<section class="control-block cloth-selection"><label>Cloth type</label>'+select(fabrics().map(f=>({value:f.id,label:f.name+(f.price?' · +'+S.money(f.price):'')})),state.fabricId,'data-cloth-select')+'<p>'+S.esc(fabric()?.description||'No cloth types available. Please contact the store.')+'</p></section>'+
        '<section class="control-block compact-choice-block garment-choice"><div><label>'+(colourChangeable?'Garment colour':'Selected product colour')+'</label>'+(colourChangeable?'<div class="custom-colour-options">'+S.customizerColours(p).map(c=>'<button type="button" data-custom-color="'+S.esc(c)+'" class="'+(state.color===c?'active':'')+'"><span style="background:'+S.colourValue(p,c)+'"></span><b>'+S.esc(c)+'</b>'+I("check")+'</button>').join("")+'</div>':'<div class="locked-garment-colour"><span style="background:'+S.colourValue(p,state.color)+'"></span><div><b>'+S.esc(state.color)+'</b><small>This ready-made product keeps its uploaded colour.</small></div>'+I("lock")+'</div>')+'</div><div><label>Size / option</label>'+select((p.sizes||["Default"]).map(v=>({value:v,label:v})),state.size,'data-size-select')+'</div></section>'+
        (l?'<section class="control-block active-layer-editor"><div class="layer-editor-head"><label>Edit selected '+l.type+'</label><button data-remove-layer="'+l.id+'">'+I("trash")+' Delete</button></div>'+
          (l.type==="text"?'<div class="input-with-icon">'+I("type")+'<input data-layer-text value="'+S.esc(l.text)+'" maxlength="60"></div><div class="inline-fields">'+select(["Impact","Arial Black","Georgia","Courier New","Trebuchet MS"].map(v=>({value:v,label:v})),l.font,'data-font-select')+'<input data-text-colour type="color" value="'+l.colour+'"><label class="range-field">Size<input data-layer-range="size" type="range" min="10" max="96" value="'+l.size+'"></label></div>':'<button class="refined-upload" data-action="choose-image"><img src="'+S.esc(l.src)+'" alt=""><span><b>Replace selected image</b><small>PNG, JPG or WEBP</small></span>'+I("upload")+'</button><label class="range-field full-range">Image size<input data-layer-range="size" type="range" min="24" max="240" value="'+l.size+'"></label>')+
          '<label class="range-field full-range">Rotation<input data-layer-range="rotation" type="range" min="-180" max="180" value="'+l.rotation+'"></label></section>':'<section class="control-block empty-layer-help"><b>Add your first text or image</b><p>Every text and image is independent. Add several elements to the same side and edit each one separately.</p></section>')+
        (true?'<section class="control-block global-print-selector"><div class="global-print-head"><div><span>PRINT METHOD</span><h3>Choose printing quality</h3></div><small>Applies to all '+layerCount+' print element'+(layerCount===1?'':'s')+'</small></div><div class="print-options print-method-grid">'+methods().map(m=>{const blocked=m.lightOnly&&!S.isLightColour(S.colourValue(state.product,state.color));return '<button type="button" data-print="'+m.id+'" '+(blocked?'disabled':'')+' class="'+(state.printId===m.id?'active':'')+'"><i>'+I(state.printId===m.id?'check':'sparkle')+'</i><span><b>'+S.esc(m.name)+'</b><small>'+S.esc(m.note)+(blocked?' Available on light colours only.':'')+'</small></span><strong><em>Image +'+S.money(m.price)+'</em><em>Text +'+S.money(m.textPrice)+'</em></strong></button>';}).join("")+'</div></section>':'')+
        '<section class="price-breakdown"><div><span>Cloth · '+S.esc(fabric()?.name||'')+'</span><b>'+S.money(fabric()?.price||0)+'</b></div><div><span>Garment</span><b>'+S.money(S.productPrice(p,state.color,state.size))+'</b></div><div><span>'+layerCount+' '+S.esc(printMethod?.name||"print")+' element'+(layerCount===1?'':'s')+'</span><b>'+S.money(allLayers().reduce((n,x)=>n+layerPrice(x),0))+'</b></div>'+(discount()?'<div class="discount-line"><span>Bulk / B2B offer</span><b>-'+discount()+'%</b></div>':'')+'</section>'+
        '<div class="designer-total refined-total"><div><small>Estimated total</small><strong>'+S.money(unitPrice()*state.qty)+'</strong><span>'+S.money(unitPrice())+' each'+(offer?' · '+S.esc(offer.label):'')+'</span></div><div class="qty-control polished-qty"><button data-action="qty-minus">'+I("minus")+'</button><span>'+state.qty+'</span><button data-action="qty-plus">'+I("plus")+'</button></div></div>'+
        '<button class="primary wide refined-add" data-action="add">Add custom design to cart '+I("arrow")+'</button>'+
      '</aside></div></main>';
    bind();
    const area=root.querySelector('[data-print-area]');const width=area?.getBoundingClientRect().width;
    if(width){const previous=current().width||width;if(previous!==width)current().layers.forEach(l=>{l.size=l.size*width/previous;updateLayerStyle(l);});current().width=width;}
  }
  function saveDesign(){allLayers().forEach(l=>l.printId=state.printId);const tint=S.shouldTintCustomizer(state.product);return {productId:state.product.id,model:state.product.name,garmentImage:S.customizerImage(state.product,state.color,"front"),garmentBackImage:S.customizerImage(state.product,state.color,"back"),rightSleeveImage:S.customizerImage(state.product,state.color,"rightSleeve"),leftSleeveImage:S.customizerImage(state.product,state.color,"leftSleeve"),surfaceTint:{front:tint,back:tint,rightSleeve:tint,leftSleeve:tint},sleeveMirror:true,garmentColor:state.color,garmentHex:S.colourValue(state.product,state.color),fabricId:state.fabricId,fabricName:fabric()?.name||"",printAreas:Object.fromEntries(surfaces.map(s=>[s.id,S.customizerPrintArea(state.product,s.id)])),printId:state.printId,printName:method(state.printId)?.name||"Print",surfaceDesigns:S.clone(state.designs),elementCount:allLayers().length};}
  function add(){if(!fabric()){state.notice="Choose an available cloth type.";render();return;}if(!allLayers().length){state.notice="Add at least one text or image before adding a custom design.";render();return;}if(!validMethod(state.printId)){state.notice="This print method cannot be used on the selected garment colour. Choose another method or colour.";render();return;}hooks.onAdd({key:"custom-"+Date.now(),productId:state.product.id,name:state.product.name+" · Custom",price:unitPrice(),basePrice:rawUnit(),discount:discount(),qty:state.qty,color:state.color,size:state.size,detail:(fabric()?.name||"")+" · "+allLayers().length+" print elements · "+(method(state.printId)?.name||"Print"),image:S.customizerImage(state.product,state.color,"front"),custom:true,customDesign:saveDesign()});}
  function upload(file){if(!file||!file.type.startsWith("image/"))return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.width,img.height)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);const data=canvas.toDataURL("image/webp",.86);const l=active();if(l?.type==="image"){l.src=data;l.rotation=0;render();}else addLayer("image",data);};img.src=String(reader.result);};reader.readAsDataURL(file);}
  function updateLayerStyle(l){root.querySelectorAll('[data-layer-view="'+l.id+'"]').forEach(el=>{el.style.left=l.x+"%";el.style.top=l.y+"%";el.style.transform='translate(-50%,-50%) rotate('+l.rotation+'deg)';if(l.type==="text"){el.style.fontSize=l.size+"px";el.style.color=l.colour;el.style.fontFamily=l.font;}else el.style.width=l.size+"px";});}
  function bind(){
    root.querySelector('[data-action="back"]')?.addEventListener("click",hooks.onBack);
    root.querySelectorAll('[data-action="add"]').forEach(x=>x.addEventListener("click",add));
    root.querySelector('[data-action="add-text"]')?.addEventListener("click",()=>addLayer("text"));
    root.querySelectorAll('[data-action="choose-image"]').forEach(x=>x.addEventListener("click",()=>root.querySelector("[data-file]")?.click()));
    root.querySelector("[data-file]")?.addEventListener("change",e=>upload(e.target.files?.[0]));
    root.querySelectorAll("[data-surface]").forEach(x=>x.addEventListener("click",()=>{state.surface=x.dataset.surface;state.activeId=null;state.pickerOpen=false;state.notice="";render();}));
    root.querySelector('[data-action="toggle-item-picker"]')?.addEventListener("click",()=>{state.pickerOpen=!state.pickerOpen;render();});
    root.querySelectorAll("[data-picker-product]").forEach(x=>x.addEventListener("click",()=>{const p=products.find(v=>String(v.id)===x.dataset.pickerProduct);if(!p)return;state.product=p;state.color=S.customizerColours(p)[0]||"White";state.size=p.sizes?.[0]||"Default";state.printId=methods()[0]?.id||"dtf";state.fabricId=fabrics()[0]?.id||"";state.activeId=null;state.pickerOpen=false;render();}));
    root.querySelectorAll("[data-custom-color]").forEach(x=>x.addEventListener("click",()=>{state.color=x.dataset.customColor;state.notice="";ensureValidMethod();render();}));
    root.querySelector("[data-cloth-select]")?.addEventListener("change",e=>{state.fabricId=e.target.value;render();});
    root.querySelector("[data-size-select]")?.addEventListener("change",e=>{state.size=e.target.value;render();});
    root.querySelectorAll('[data-design-layer]').forEach(el=>{
      el.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();editText(el.dataset.designLayer);});
      el.addEventListener('pointerdown',e=>{
        if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();
        const id=el.dataset.designLayer,l=current().layers.find(l=>l.id===id);
        if(state.activeId!==id){state.activeId=id;root.querySelectorAll('[data-design-layer]').forEach(n=>n.classList.toggle('selected',n.dataset.designLayer===id));}
        el.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId,{id,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,layerX:l.x,layerY:l.y,time:Date.now(),moved:false});
        const pts=[...pointers.values()].filter(p=>p.id===id);
        if(pts.length===2){const [a,b]=pts;gesture={pinch:true,distance:Math.hypot(b.x-a.x,b.y-a.y),angle:Math.atan2(b.y-a.y,b.x-a.x),size:l.size,rotation:l.rotation,x:l.x,y:l.y,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};}
      });
      el.addEventListener('pointermove',e=>{
        const point=pointers.get(e.pointerId);if(!point)return;e.preventDefault();point.x=e.clientX;point.y=e.clientY;
        if(Math.hypot(point.x-point.startX,point.y-point.startY)>4)point.moved=true;
        const l=active(),area=root.querySelector('[data-print-area]').getBoundingClientRect(),pts=[...pointers.values()].filter(p=>p.id===l.id);
        if(gesture?.pinch&&pts.length===2){const [a,b]=pts;l.size=clamp(gesture.size*Math.hypot(b.x-a.x,b.y-a.y)/Math.max(1,gesture.distance),l.type==='text'?10:24,l.type==='text'?96:240);l.rotation=gesture.rotation+(Math.atan2(b.y-a.y,b.x-a.x)-gesture.angle)*180/Math.PI;l.x=clamp(gesture.x+(((a.x+b.x)/2)-gesture.mx)/area.width*100,0,100);l.y=clamp(gesture.y+(((a.y+b.y)/2)-gesture.my)/area.height*100,0,100);pts.forEach(p=>p.moved=true);}
        else if(!gesture?.pinch){l.x=clamp(point.layerX+(point.x-point.startX)/area.width*100,0,100);l.y=clamp(point.layerY+(point.y-point.startY)/area.height*100,0,100);}
        updateLayerStyle(l);
      });
      const end=e=>{const point=pointers.get(e.pointerId);if(!point)return;pointers.delete(e.pointerId);if(pointers.size)return;gesture=null;
        const now=Date.now(),double=!point.moved&&lastTap.id===point.id&&now-lastTap.time<350&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<24;
        lastTap={id:point.id,time:now,x:e.clientX,y:e.clientY};
        if(double){editText(point.id);}else{render();}
      };
      el.addEventListener('pointerup',end);el.addEventListener('pointercancel',()=>{pointers.clear();gesture=null;});
    });
    root.querySelectorAll("[data-transform-layer]").forEach(h=>{h.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();const l=active(),b=h.parentElement.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;gesture={id:e.pointerId,cx,cy,startAngle:Math.atan2(e.clientY-cy,e.clientX-cx),startDistance:Math.hypot(e.clientX-cx,e.clientY-cy),rotation:l.rotation,size:l.size};h.setPointerCapture(e.pointerId);});h.addEventListener("pointermove",e=>{if(!gesture||gesture.id!==e.pointerId)return;const l=active(),a=Math.atan2(e.clientY-gesture.cy,e.clientX-gesture.cx),d=Math.max(1,Math.hypot(e.clientX-gesture.cx,e.clientY-gesture.cy));l.rotation=Math.round(gesture.rotation+(a-gesture.startAngle)*180/Math.PI);l.size=clamp(gesture.size*d/Math.max(1,gesture.startDistance),l.type==="text"?10:24,l.type==="text"?96:240);updateLayerStyle(l);});const end=()=>gesture=null;h.addEventListener("pointerup",end);h.addEventListener("pointercancel",end);});
    root.querySelectorAll("[data-remove-layer]").forEach(x=>x.addEventListener("click",e=>{e.stopPropagation();current().layers=current().layers.filter(l=>l.id!==x.dataset.removeLayer);state.activeId=null;render();}));
    root.querySelector("[data-layer-text]")?.addEventListener("input",e=>{const l=active();l.text=e.target.value;root.querySelectorAll('[data-layer-content="'+l.id+'"]').forEach(el=>el.textContent=l.text);});
    root.querySelector("[data-font-select]")?.addEventListener("change",e=>{active().font=e.target.value;updateLayerStyle(active());});
    root.querySelector("[data-text-colour]")?.addEventListener("input",e=>{active().colour=e.target.value;updateLayerStyle(active());});
    root.querySelectorAll("[data-layer-range]").forEach(x=>x.addEventListener("input",()=>{active()[x.dataset.layerRange]=Number(x.value);updateLayerStyle(active());}));
    root.querySelectorAll("[data-print]").forEach(x=>x.addEventListener("click",()=>{if(!x.disabled){state.printId=x.dataset.print;allLayers().forEach(l=>l.printId=state.printId);state.notice="";render();}}));
    root.querySelector('[data-action="qty-minus"]')?.addEventListener("click",()=>{state.qty=Math.max(1,state.qty-1);render();});
    root.querySelector('[data-action="qty-plus"]')?.addEventListener("click",()=>{state.qty=Math.min(999,state.qty+1);render();});
    root.querySelector("[data-stage]")?.addEventListener("pointerdown",e=>{if(!e.target.closest("[data-design-layer],button,input,select,.item-picker")&&state.activeId){state.activeId=null;render();}});
  }
  render();
  return{destroy(){root.innerHTML="";}};
}
window.OneLineDesigner={mount};
})();
