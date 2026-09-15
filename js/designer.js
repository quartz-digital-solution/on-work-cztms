(function () {
  "use strict";
  const S=window.OneLineStore, I=S.icon;
  const surfaces=[
    {id:"front",label:"Front",short:"Front"},{id:"back",label:"Back",short:"Back"},
    {id:"rightSleeve",label:"Right sleeve",short:"R sleeve"},{id:"leftSleeve",label:"Left sleeve",short:"L sleeve"}
  ];
  const models=[
    {name:"Premium Crew T-Shirt",type:"T-Shirt",base:449,image:"assets/crew-tee.webp",backImage:"assets/crew-tee-back.webp"},
    {name:"Performance Sports Jersey",type:"Sportswear",base:649,image:"assets/sports-jersey.webp",backImage:"assets/sports-jersey-back.webp"},
    {name:"Classic Polo Shirt",type:"Polo",base:599,image:"assets/polo-shirt.webp",backImage:"assets/polo-shirt-back.webp"}
  ];
  const sleeveImage="assets/sleeve-side-neutral.webp", DRAFT_KEY="custom-store-designer-draft";
  const blank=text=>({text:text||"",font:"Impact",textColor:"#ffffff",textSize:30,textRotation:0,uploadedImage:"",imageSize:82,imageRotation:0,positions:{text:{x:50,y:38},image:{x:50,y:62}}});
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function picker(name,value,options,open){
    const selected=options.find(x=>x.value===value)||options[0];
    return '<div class="custom-picker '+(open===name?'open':'')+'" data-picker="'+name+'"><button type="button" class="picker-trigger" data-action="toggle-picker" data-picker-name="'+name+'"><span>'+S.esc(selected?.label||'Select')+'</span>'+I('chevron')+'</button>'+
      (open===name?'<div class="picker-menu" role="listbox">'+options.map(x=>'<button type="button" class="'+(x.value===value?'selected':'')+'" data-action="pick" data-picker-name="'+name+'" data-value="'+S.esc(x.value)+'"><span>'+S.esc(x.label)+'</span>'+(x.value===value?I('check'):'')+'</button>').join('')+'</div>':'')+'</div>';
  }

  function safeDraft(){
    const raw=S.load(DRAFT_KEY,null); if(!raw)return null;
    try{
      const model=models.find(m=>m.name===raw.modelName)||models[0];
      const designs={}; surfaces.forEach(s=>designs[s.id]=Object.assign(blank(),raw.designs?.[s.id]||{}));
      return {model,color:raw.color||"Navy",size:raw.size||"M",qty:Number(raw.qty||1),surface:raw.surface||"front",designs,printType:raw.printType||""};
    }catch(_){return null;}
  }

  function mount(root,hooks){
    const draft=safeDraft();
    const state={
      model:draft?.model||models[0],color:draft?.color||"Navy",size:draft?.size||"M",qty:draft?.qty||1,surface:draft?.surface||"front",
      designs:draft?.designs||{front:blank("YOUR IDEA"),back:blank(),rightSleeve:blank(),leftSleeve:blank()},
      active:null,pickerOpen:null,printMethods:S.getPrints(),printType:draft?.printType||S.getPrints()[0]?.name||"DTF Print"
    };
    const pointers=new Map(); let pinch=null,transformGesture=null,lastTextTap=0,destroyed=false;
    models.flatMap(m=>[m.image,m.backImage]).concat(sleeveImage).forEach(src=>{const img=new Image();img.src=src;});
    const current=()=>state.designs[state.surface];
    const designedCount=()=>surfaces.filter(x=>{const d=state.designs[x.id];return String(d.text||'').trim()||d.uploadedImage;}).length;
    const chosenPrint=()=>state.printMethods.find(x=>x.name===state.printType)||state.printMethods[0]||{name:"DTF Print",price:180,note:"Vivid colour"};
    const unitPrice=()=>state.model.base+Number(chosenPrint().price||0)+Math.max(0,designedCount()-1)*80;
    const garmentSrc=()=>state.surface.includes("Sleeve")?sleeveImage:state.surface==="back"?state.model.backImage:state.model.image;
    const surfaceLabel=()=>surfaces.find(x=>x.id===state.surface)?.label||"Front";
    const isDark=()=>S.isDarkColor(state.color);

    function persist(){
      if(destroyed)return;
      S.save(DRAFT_KEY,{modelName:state.model.name,color:state.color,size:state.size,qty:state.qty,surface:state.surface,designs:state.designs,printType:state.printType});
    }
    function ensureValidPrint(){
      const p=chosenPrint(); if(p?.lightOnly&&isDark()) state.printType=(state.printMethods.find(x=>!x.lightOnly)||state.printMethods[0])?.name||"DTF Print";
    }
    function handles(layer){return '<button class="layer-remove" data-action="remove" data-layer="'+layer+'" aria-label="Delete selected item">'+I('close')+'</button><button class="layer-rotate" data-transform="'+layer+'" aria-label="Resize and rotate">'+I('rotate')+'</button>';}
    function textLayer(d){
      if(!d.text)return '';
      return '<div class="design-layer text-layer '+(state.active==='text'?'selected':'')+'" data-layer="text" title="Double tap to edit" style="left:'+d.positions.text.x+'%;top:'+d.positions.text.y+'%;color:'+d.textColor+';font-family:'+S.esc(d.font)+';font-size:'+d.textSize+'px;transform:translate(-50%,-50%) rotate('+d.textRotation+'deg)"><span class="layer-text-content">'+S.esc(d.text)+'</span>'+(state.active==='text'?handles('text'):'')+'</div>';
    }
    function imageLayer(d){
      if(!d.uploadedImage)return '';
      return '<div class="design-layer image-layer '+(state.active==='image'?'selected':'')+'" data-layer="image" style="left:'+d.positions.image.x+'%;top:'+d.positions.image.y+'%;width:'+d.imageSize+'px;transform:translate(-50%,-50%) rotate('+d.imageRotation+'deg)"><img src="'+d.uploadedImage+'" alt="Uploaded artwork" draggable="false">'+(state.active==='image'?handles('image'):'')+'</div>';
    }

    function render(){
      if(destroyed)return;
      ensureValidPrint(); const d=current(),sleeve=state.surface.includes("Sleeve"),src=garmentSrc();
      const modelOptions=models.map(m=>({value:m.name,label:m.type+' · '+S.money(m.base)}));
      root.innerHTML='<main class="designer-page compact-designer locked-garment-designer">'+
        '<header class="sub-header refined-sub-header"><button class="designer-back" data-action="back" aria-label="Back to store">'+I('back')+'</button><div class="step-label"><span>01</span> CUSTOMISE YOUR T-SHIRT</div><button class="cart-button" data-action="add"><span>Add · '+S.money(unitPrice()*state.qty)+'</span>'+I('bag')+'</button></header>'+
        '<div class="designer-layout compact-designer-layout"><section class="designer-stage compact-stage" data-stage>'+
          '<div class="compact-designer-bar"><div class="compact-surface-tabs">'+surfaces.map(x=>'<button data-action="surface" data-value="'+x.id+'" class="'+(x.id===state.surface?'active':'')+'"><span class="full-label">'+x.label+'</span><span class="short-label">'+x.short+'</span>'+(state.designs[x.id].text||state.designs[x.id].uploadedImage?'<i></i>':'')+'</button>').join('')+'</div><div class="apparel-dropdown"><span>Apparel</span>'+picker('model',state.model.name,modelOptions,state.pickerOpen)+'</div></div>'+
          '<div class="stage-topline"><span>'+surfaceLabel()+'</span><span>GARMENT STAYS FIXED · MOVE ONLY YOUR DESIGN</span></div>'+
          '<div class="shirt-canvas compact-shirt-canvas view-'+state.surface+'"><div class="live-garment compact-garment garment-'+state.surface+'"><div class="garment-depth"></div>'+
            '<img class="garment-photo '+(sleeve?'sleeve-photo ':'')+(state.surface==='rightSleeve'?'mirror-sleeve':'')+'" src="'+src+'" alt="'+S.esc(state.model.name+' '+surfaceLabel())+'" draggable="false">'+
            '<div class="garment-tint '+(sleeve?'sleeve-tint ':'')+(state.surface==='rightSleeve'?'mirror-sleeve':'')+'" style="background:'+S.palette[state.color]+';mask-image:url('+src+');-webkit-mask-image:url('+src+')"></div>'+
            '<div class="print-area surface-'+state.surface+'" data-print-area>'+textLayer(d)+imageLayer(d)+'</div></div></div>'+
          '<p class="designer-stage-note">Double tap text to edit. The T-shirt itself is locked in place.</p></section>'+
          '<aside class="designer-controls compact-controls"><div class="control-head"><span>DESIGN CONTROLS</span><small>'+surfaceLabel()+'</small></div>'+
            '<div class="quick-layer-tools"><button data-action="add-text">'+I('type')+'<span>Add text</span></button><button data-action="choose-image">'+I('image')+'<span>Add image</span></button><input data-file hidden type="file" accept="image/*"></div>'+
            '<section class="control-block compact-choice-block"><div><label>Garment colour</label><div class="swatches">'+["Black","White","Navy","Maroon","Olive","Sky"].map(c=>'<button aria-label="'+c+'" data-action="color" data-value="'+c+'" class="'+(state.color===c?'active':'')+'" style="background:'+S.palette[c]+'">'+(state.color===c?I('check'):'')+'</button>').join('')+'</div></div><div><label>Size</label>'+picker('size',state.size,["XS","S","M","L","XL","XXL","3XL"].map(v=>({value:v,label:v})),state.pickerOpen)+'</div></section>'+
            '<section class="control-block always-visible-text-controls"><div class="control-title-row"><label>Text</label><small>Double tap the text on shirt to jump here</small></div><div class="input-with-icon">'+I('type')+'<input data-text value="'+S.esc(d.text)+'" maxlength="40" placeholder="Add text"><button data-action="remove" data-layer="text" aria-label="Clear text">'+I('close')+'</button></div><div class="inline-fields"><div class="font-style-field"><span>Font style</span><div class="styled-select">'+picker('font',d.font,["Impact","Arial Black","Georgia","Courier New","Trebuchet MS","Verdana"].map(v=>({value:v,label:v})),state.pickerOpen)+'</div></div><input data-color-input type="color" value="'+d.textColor+'" aria-label="Text colour"><label class="range-field">Size<input data-range="textSize" type="range" min="11" max="72" value="'+d.textSize+'"></label><label class="range-field full-range">Rotate<input data-range="textRotation" type="range" min="-180" max="180" value="'+d.textRotation+'"></label></div></section>'+
            '<section class="control-block uploaded-control"><div class="control-title-row"><label>Image</label><small>'+(d.uploadedImage?'Artwork added':'No image added yet')+'</small></div>'+(d.uploadedImage?'<button class="refined-upload" data-action="choose-image"><img src="'+d.uploadedImage+'" alt=""><span><b>Replace image</b><small>PNG, JPG or WEBP</small></span>'+I('upload')+'</button><div class="artwork-tools"><label>Size<input data-range="imageSize" type="range" min="26" max="190" value="'+d.imageSize+'"></label><label>Rotate<input data-range="imageRotation" type="range" min="-180" max="180" value="'+d.imageRotation+'"></label><button data-action="reset-image">'+I('rotate')+' Reset</button></div>':'<button class="empty-upload" data-action="choose-image">'+I('upload')+' Add an image</button>')+'</section>'+
            '<section class="control-block print-control-block"><div class="control-title-row"><label>Printing type</label><small>Applies without selecting text or image</small></div><div class="print-options">'+state.printMethods.map(p=>{const disabled=!!p.lightOnly&&isDark();return '<button data-action="print" data-value="'+S.esc(p.name)+'" '+(disabled?'disabled':'')+' class="'+(state.printType===p.name?'active ':'')+(disabled?'disabled-print':'')+'"><span>'+(state.printType===p.name?I('check'):'')+'</span><b>'+S.esc(p.name)+'</b><small>'+S.esc(p.note)+(disabled?' <em>Not available for '+S.esc(state.color)+' garments.</em>':'')+'</small><strong>+'+S.money(p.price)+'</strong></button>';}).join('')+'</div>'+(isDark()?'<div class="sublimation-warning"><b>Sublimation is disabled on dark colours.</b><span>Sublimation ink needs a light fabric base. On dark fabric the print will not be visible correctly.</span></div>':'')+'</section>'+
            '<div class="designer-total refined-total"><div><small>Estimated total</small><strong>'+S.money(unitPrice()*state.qty)+'</strong><span>'+designedCount()+' print area'+(designedCount()===1?'':'s')+' · '+state.qty+' piece'+(state.qty===1?'':'s')+'</span></div><div class="qty-control polished-qty"><button data-action="qty-minus">'+I('minus')+'</button><span>'+state.qty+'</span><button data-action="qty-plus">'+I('plus')+'</button></div></div>'+
            '<button class="primary wide refined-add" data-action="add">Add custom design to cart '+I('arrow')+'</button>'+
          '</aside></div></main>';
      bind(); persist();
    }

    function chooseModel(value){const found=models.find(m=>m.name===value);if(found)state.model=found;}
    function remove(layer){const d=current();if(layer==='text'){d.text='';d.textRotation=0;}else{d.uploadedImage='';d.imageRotation=0;}state.active=null;render();}
    function makeDesign(){const front=state.designs.front;return {model:state.model.name,garmentImage:state.model.image,garmentBackImage:state.model.backImage,sleeveImage,garmentColor:state.color,text:front.text,font:front.font,textColor:front.textColor,textSize:front.textSize,textRotation:front.textRotation,uploadedImage:front.uploadedImage,imageSize:front.imageSize,imageRotation:front.imageRotation,positions:front.positions,printType:state.printType,surfaceDesigns:S.clone(state.designs)};}
    function add(){persist();hooks.onAdd({key:'custom-'+Date.now(),name:state.model.name+' · Custom',price:unitPrice(),qty:state.qty,color:state.color,size:state.size,detail:state.printType+' · '+designedCount()+' print area'+(designedCount()===1?'':'s'),image:state.model.image,custom:true,customDesign:makeDesign()});}
    function upload(file){
      if(!file||!file.type.startsWith('image/'))return;
      const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);current().uploadedImage=canvas.toDataURL('image/webp',.82);current().imageRotation=0;state.active='image';render();};img.src=String(reader.result);};reader.readAsDataURL(file);
    }
    function layerPosition(layer,x,y){const area=root.querySelector('[data-print-area]')?.getBoundingClientRect();if(!area)return;current().positions[layer]={x:clamp((x-area.left)/area.width*100,4,96),y:clamp((y-area.top)/area.height*100,4,96)};const el=root.querySelector('[data-layer="'+layer+'"]');if(el){el.style.left=current().positions[layer].x+'%';el.style.top=current().positions[layer].y+'%';}persist();}
    function layerStyle(layer){const d=current(),el=root.querySelector('[data-layer="'+layer+'"]');if(!el)return;if(layer==='text'){el.style.fontSize=d.textSize+'px';el.style.transform='translate(-50%,-50%) rotate('+d.textRotation+'deg)';}else{el.style.width=d.imageSize+'px';el.style.transform='translate(-50%,-50%) rotate('+d.imageRotation+'deg)';}persist();}
    function focusTextInput(){state.active='text';const input=root.querySelector('[data-text]');if(input){input.focus();input.select();}}

    function bind(){
      root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',e=>{
        const a=el.dataset.action;
        if(a==='back'){persist();hooks.onBack();}
        else if(a==='add')add();
        else if(a==='surface'){state.surface=el.dataset.value;state.active=null;state.pickerOpen=null;render();}
        else if(a==='toggle-picker'){e.stopPropagation();state.pickerOpen=state.pickerOpen===el.dataset.pickerName?null:el.dataset.pickerName;render();}
        else if(a==='pick'){const n=el.dataset.pickerName,v=el.dataset.value;if(n==='model')chooseModel(v);if(n==='size')state.size=v;if(n==='font')current().font=v;state.pickerOpen=null;render();}
        else if(a==='add-text'){if(!current().text)current().text='YOUR TEXT';state.active='text';render();setTimeout(focusTextInput,0);}
        else if(a==='choose-image')root.querySelector('[data-file]')?.click();
        else if(a==='color'){state.color=el.dataset.value;ensureValidPrint();render();}
        else if(a==='remove'){e.preventDefault();e.stopPropagation();remove(el.dataset.layer);}
        else if(a==='print'){if(el.disabled)return;state.printType=el.dataset.value;render();}
        else if(a==='reset-image'){current().imageRotation=0;render();}
        else if(a==='qty-minus'){state.qty=Math.max(1,state.qty-1);render();}
        else if(a==='qty-plus'){state.qty++;render();}
      }));
      const file=root.querySelector('[data-file]');if(file)file.addEventListener('change',()=>upload(file.files?.[0]));
      const txt=root.querySelector('[data-text]');if(txt){
        txt.addEventListener('input',()=>{current().text=txt.value;state.active=txt.value?'text':null;const content=root.querySelector('.layer-text-content');if(content)content.textContent=txt.value;persist();});
        txt.addEventListener('focus',()=>{state.active='text';const layer=root.querySelector('[data-layer="text"]');layer?.classList.add('selected');});
      }
      const col=root.querySelector('[data-color-input]');if(col)col.addEventListener('input',()=>{current().textColor=col.value;const layer=root.querySelector('[data-layer="text"]');if(layer)layer.style.color=col.value;persist();});
      root.querySelectorAll('[data-range]').forEach(el=>el.addEventListener('input',()=>{current()[el.dataset.range]=Number(el.value);layerStyle(el.dataset.range.startsWith('text')?'text':'image');}));
      root.querySelectorAll('[data-layer]').forEach(el=>{
        el.addEventListener('dblclick',e=>{if(el.dataset.layer==='text'){e.preventDefault();e.stopPropagation();focusTextInput();}});
        el.addEventListener('pointerdown',e=>{
          if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();const layer=el.dataset.layer;
          if(layer==='text'){const now=Date.now();if(now-lastTextTap<360){lastTextTap=0;focusTextInput();return;}lastTextTap=now;}
          if(state.active!==layer){state.active=layer;render();return;}
          el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,layer});const pts=[...pointers.values()].filter(p=>p.layer===layer);if(pts.length===2)pinch={distance:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),size:layer==='text'?current().textSize:current().imageSize,layer};
        });
        el.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;e.preventDefault();const layer=el.dataset.layer;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,layer});const pts=[...pointers.values()].filter(p=>p.layer===layer);if(pts.length>=2&&pinch?.layer===layer){const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),size=pinch.size*(distance/Math.max(1,pinch.distance));if(layer==='text')current().textSize=clamp(size,11,72);else current().imageSize=clamp(size,26,190);layerStyle(layer);}else if(pts.length===1)layerPosition(layer,e.clientX,e.clientY);});
        const end=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;persist();};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
      });
      root.querySelectorAll('[data-transform]').forEach(handle=>{
        handle.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const layer=handle.dataset.transform,box=handle.parentElement.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;transformGesture={id:e.pointerId,layer,cx,cy,angle:Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI,rotation:layer==='text'?current().textRotation:current().imageRotation,distance:Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy)),size:layer==='text'?current().textSize:current().imageSize};handle.setPointerCapture(e.pointerId);});
        handle.addEventListener('pointermove',e=>{const g=transformGesture;if(!g||g.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();const angle=Math.atan2(e.clientY-g.cy,e.clientX-g.cx)*180/Math.PI,distance=Math.max(1,Math.hypot(e.clientX-g.cx,e.clientY-g.cy));let rotation=g.rotation+angle-g.angle;if(Math.abs(rotation%45)<3)rotation=Math.round(rotation/45)*45;const size=g.size*(distance/g.distance);if(g.layer==='text'){current().textRotation=Math.round(rotation);current().textSize=clamp(size,11,72);}else{current().imageRotation=Math.round(rotation);current().imageSize=clamp(size,26,190);}layerStyle(g.layer);});
        const finish=e=>{e.preventDefault();e.stopPropagation();transformGesture=null;persist();};handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
      });
      const stage=root.querySelector('[data-stage]');if(stage)stage.addEventListener('pointerdown',e=>{if(!e.target.closest('.design-layer')&&!e.target.closest('.custom-picker')&&state.active){state.active=null;render();}});
    }
    render();
    return {destroy(){destroyed=true;root.innerHTML='';},save:persist};
  }
  window.OneLineDesigner={mount};
})();
