(function(){
  "use strict";
  const S=window.OneLineStore,I=S.icon;
  const surfaces=[
    {id:"front",label:"Front",short:"Front"},{id:"back",label:"Back",short:"Back"},
    {id:"rightSleeve",label:"Right sleeve",short:"R sleeve"},{id:"leftSleeve",label:"Left sleeve",short:"L sleeve"}
  ];
  const models=[
    {name:"Crew T-Shirt",type:"T-Shirt",typeExtra:0,image:"assets/crew-tee.webp",backImage:"assets/crew-tee-back.webp"},
    {name:"Sportswear",type:"Sportswear",typeExtra:150,image:"assets/sports-jersey.webp",backImage:"assets/sports-jersey-back.webp"},
    {name:"Polo",type:"Polo",typeExtra:100,image:"assets/polo-shirt.webp",backImage:"assets/polo-shirt-back.webp"}
  ];
  const materials=[
    {name:"Budget",price:299,note:"Light everyday fabric · best for simple value orders"},
    {name:"Standard",price:399,note:"Balanced comfort, finish and durability"},
    {name:"Premium",price:549,note:"Heavier premium feel · cleaner long-lasting finish"}
  ];
  const sleeveImage="assets/sleeve-side-neutral.webp";
  const draftKey="one-line-designer-draft-v4";
  const fontList=["Impact","Arial Black","Trebuchet MS","Georgia","Courier New","Verdana","Times New Roman"];
  const blank=text=>({text:text||"",font:"Impact",textColor:"#ffffff",textSize:30,textRotation:0,uploadedImage:"",imageSize:82,imageRotation:0,positions:{text:{x:50,y:38},image:{x:50,y:62}},textScale:18,imageScale:38});
  const clone=v=>typeof structuredClone==="function"?structuredClone(v):JSON.parse(JSON.stringify(v));
  const clampMin=(v,min)=>Math.max(min,Number(v)||0);
  const TEXT_MAX=50;
  const clampText=v=>Math.max(6,Math.min(TEXT_MAX,Number(v)||0));
  const resizeMax=()=>{const v=window.visualViewport,w=v?.width||window.innerWidth||390,h=v?.height||window.innerHeight||720;return Math.max(280,Math.round(Math.min(w,h)*.94));};

  function loadDraft(){
    try{const d=JSON.parse(localStorage.getItem(draftKey)||"null");if(!d)return null;return d;}catch(_){return null;}
  }
  function picker(name,value,options,open,extraClass){
    const selected=options.find(x=>x.value===value)||options[0];
    return '<div class="custom-picker '+(extraClass||'')+' '+(open===name?'open':'')+'" data-picker="'+name+'"><button type="button" class="picker-trigger" data-action="toggle-picker" data-picker-name="'+name+'"><span>'+S.esc(selected?.label||'Select')+'</span>'+I('chevron')+'</button>'+
      (open===name?'<div class="picker-menu" role="listbox">'+options.map(x=>'<button type="button" class="'+(x.value===value?'selected':'')+'" data-action="pick" data-picker-name="'+name+'" data-value="'+S.esc(x.value)+'"><span>'+S.esc(x.label)+'</span>'+(x.value===value?I('check'):'')+'</button>').join('')+'</div>':'')+'</div>';
  }

  function mount(root,hooks){
    const saved=loadDraft();
    const state={
      model:models.find(m=>m.name===saved?.modelName||m.type===saved?.modelType)||models[0],
      material:materials.find(m=>m.name===saved?.materialName)||materials[1],
      color:saved?.color||"Navy",size:saved?.size||"M",qty:Number(saved?.qty)||1,
      surface:saved?.surface||"front",designs:saved?.designs||{front:blank("YOUR IDEA"),back:blank(),rightSleeve:blank(),leftSleeve:blank()},
      active:null,pickerOpen:null,printMethods:S.getPrints(),printType:saved?.printType||S.getPrints()[0]?.name||"DTF Print"
    };
    surfaces.forEach(x=>{if(!state.designs[x.id])state.designs[x.id]=blank();state.designs[x.id].textSize=clampText(state.designs[x.id].textSize||30);});
    if(S.isDarkColor(state.color)&&state.printMethods.find(p=>p.name===state.printType)?.lightOnly) state.printType=state.printMethods.find(p=>!p.lightOnly)?.name||"DTF Print";
    const pointers=new Map();let pinch=null,transformGesture=null,lastTap={time:0,layer:""};
    models.flatMap(m=>[m.image,m.backImage]).concat(sleeveImage).forEach(src=>{const img=new Image();img.src=src;});

    const current=()=>state.designs[state.surface];
    const designedCount=()=>surfaces.filter(x=>{const d=state.designs[x.id];return (d.text||'').trim()||d.uploadedImage;}).length;
    const chosenPrint=()=>state.printMethods.find(x=>x.name===state.printType)||state.printMethods.find(x=>!x.lightOnly)||{name:"DTF Print",price:180,note:"Vivid colour"};
    const garmentPrice=()=>Number(state.material.price||0)+Number(state.model.typeExtra||0);
    const unitPrice=()=>garmentPrice()+Number(chosenPrint().price||0)+Math.max(0,designedCount()-1)*80;
    const garmentSrc=()=>state.surface.includes("Sleeve")?sleeveImage:state.surface==="back"?state.model.backImage:state.model.image;
    const surfaceLabel=()=>surfaces.find(x=>x.id===state.surface)?.label||"Front";
    const saveDraft=()=>localStorage.setItem(draftKey,JSON.stringify({modelName:state.model.name,modelType:state.model.type,materialName:state.material.name,color:state.color,size:state.size,qty:state.qty,surface:state.surface,designs:state.designs,printType:state.printType}));

    function syncCurrentScale(){
      const area=root.querySelector('[data-print-area]')?.getBoundingClientRect();if(!area?.width)return;
      const d=current();d.textScale=Math.max(.1,d.textSize/area.width*100);d.imageScale=Math.max(.1,d.imageSize/area.width*100);saveDraft();
    }
    function darkPrintNote(){return '<p class="sublimation-help"><b>Sublimation:</b> available only on light garment colours. On dark colours the sublimation ink cannot be seen correctly, so the option is disabled automatically.</p>';}

    function render(){
      const d=current(),sleeve=state.surface.includes("Sleeve"),src=garmentSrc(),dark=S.isDarkColor(state.color),maxSize=resizeMax();d.textSize=clampText(d.textSize);
      root.innerHTML='<main class="designer-page compact-designer old-model-designer">'+
        '<header class="sub-header refined-sub-header"><button class="designer-back" data-action="back" aria-label="Back to store">'+I('back')+'</button><div class="step-label"><span>01</span> CUSTOMIZE YOUR APPAREL</div><button class="cart-button" data-action="add"><span>Add · '+S.money(unitPrice()*state.qty)+'</span>'+I('bag')+'</button></header>'+
        '<div class="designer-layout compact-designer-layout"><section class="designer-stage compact-stage locked-garment-stage" data-stage>'+
          '<div class="compact-designer-bar"><section class="stage-garment-type"><label>Type</label><div class="garment-type-cards">'+models.map(m=>'<button data-action="model-card" data-value="'+S.esc(m.name)+'" class="'+(m.name===state.model.name?'active':'')+'"><b>'+S.esc(m.type)+'</b>'+(m.typeExtra?'<small>+'+S.money(m.typeExtra)+'</small>':'<small>Base type</small>')+'</button>').join('')+'</div></section><div class="compact-surface-tabs" aria-label="Choose print area">'+surfaces.map(x=>'<button data-action="surface" data-value="'+x.id+'" class="'+(x.id===state.surface?'active':'')+'"><span class="full-label">'+x.label+'</span><span class="short-label">'+x.short+'</span>'+(state.designs[x.id].text||state.designs[x.id].uploadedImage?'<i></i>':'')+'</button>').join('')+'</div></div>'+
          '<div class="stage-topline"><span>'+surfaceLabel()+'</span><span>GARMENT LOCKED · MOVE PRINT ONLY</span></div>'+
          '<div class="shirt-canvas compact-shirt-canvas view-'+state.surface+'"><div class="live-garment compact-garment garment-'+state.surface+' locked-garment"><div class="garment-depth"></div>'+
            '<img class="garment-photo '+(sleeve?'sleeve-photo ':'')+(state.surface==='rightSleeve'?'mirror-sleeve':'')+'" src="'+src+'" alt="'+S.esc(state.model.name+' '+surfaceLabel())+'" draggable="false">'+
            '<div class="garment-tint '+(sleeve?'sleeve-tint ':'')+(state.surface==='rightSleeve'?'mirror-sleeve':'')+'" style="background:'+S.palette[state.color]+';mask-image:url('+src+');-webkit-mask-image:url('+src+')"></div>'+
            '<div class="print-area surface-'+state.surface+'" data-print-area>'+
              (d.text?'<div class="design-layer text-layer '+(state.active==='text'?'selected':'')+'" data-layer="text" title="Double tap to edit" style="left:'+d.positions.text.x+'%;top:'+d.positions.text.y+'%;color:'+d.textColor+';font-family:'+S.esc(d.font)+';font-size:'+d.textSize+'px;transform:translate(-50%,-50%) rotate('+d.textRotation+'deg)"><span class="layer-text-content">'+S.esc(d.text)+'</span>'+(state.active==='text'?handles('text'):'')+'</div>':'')+
              (d.uploadedImage?'<div class="design-layer image-layer '+(state.active==='image'?'selected':'')+'" data-layer="image" style="left:'+d.positions.image.x+'%;top:'+d.positions.image.y+'%;width:'+d.imageSize+'px;transform:translate(-50%,-50%) rotate('+d.imageRotation+'deg)"><img src="'+d.uploadedImage+'" alt="Uploaded artwork" draggable="false">'+(state.active==='image'?handles('image'):'')+'</div>':'')+
            '</div></div></div><p class="drag-hint">'+I('move')+' Move only your text/image · pinch or corner handle to resize · double tap text to edit</p></section>'+
          '<aside class="designer-controls compact-controls"><div class="control-head"><span>DESIGN CONTROLS</span><small>'+surfaceLabel()+'</small></div>'+
            '<section class="control-block material-quality-control"><label>Cloth type</label><div class="material-quality-cards">'+materials.map(m=>'<button data-action="material-card" data-value="'+S.esc(m.name)+'" class="'+(m.name===state.material.name?'active':'')+'"><span><b>'+S.esc(m.name)+'</b><strong>'+S.money(m.price)+'</strong></span><small>'+S.esc(m.note)+'</small></button>').join('')+'</div></section>'+
            '<div class="quick-layer-tools"><button data-action="add-text">'+I('type')+'<span>Add text</span></button><button data-action="choose-image">'+I('image')+'<span>Add image</span></button><input data-file hidden type="file" accept="image/*"></div>'+
            '<section class="control-block compact-choice-block"><div><label>Garment colour</label><div class="swatches">'+["Black","White","Navy","Maroon","Olive","Sky","Sand"].map(c=>'<button aria-label="'+c+'" title="'+c+'" data-action="color" data-value="'+c+'" class="'+(state.color===c?'active':'')+'" style="background:'+S.palette[c]+'">'+(state.color===c?I('check'):'')+'</button>').join('')+'</div></div><div><label>Size</label><div class="styled-select">'+picker('size',state.size,["XS","S","M","L","XL","XXL","3XL"].map(v=>({value:v,label:v})),state.pickerOpen)+'</div></div></section>'+
            '<section class="control-block text-control"><label>Text on '+surfaceLabel()+'</label><div class="input-with-icon">'+I('type')+'<input data-text value="'+S.esc(d.text)+'" maxlength="80" placeholder="Add text"><button data-action="remove" data-layer="text" aria-label="Clear text">'+I('close')+'</button></div><small class="edit-tip">Double tap the text on the shirt anytime to edit it.</small><div class="inline-fields"><div class="font-field"><span>Font style</span><div class="styled-select">'+picker('font',d.font,fontList.map(v=>({value:v,label:v})),state.pickerOpen)+'</div></div><input data-color-input type="color" value="'+d.textColor+'" aria-label="Text colour"><label class="range-field practical-size-range">Size <small>'+Math.round(d.textSize)+' px</small><input data-range="textSize" type="range" min="6" max="50" value="'+Math.min(TEXT_MAX,d.textSize)+'"></label><label class="range-field full-range">Rotate<input data-range="textRotation" type="range" min="-180" max="180" value="'+d.textRotation+'"></label></div></section>'+
            (d.uploadedImage?'<section class="control-block uploaded-control"><label>Image on '+surfaceLabel()+'</label><button class="refined-upload" data-action="choose-image"><img src="'+d.uploadedImage+'" alt=""><span><b>Replace image</b><small>PNG, JPG or WEBP</small></span>'+I('upload')+'</button><div class="artwork-tools"><label class="practical-size-range">Size <small>'+Math.round(d.imageSize)+' px</small><input data-range="imageSize" type="range" min="10" max="'+maxSize+'" value="'+Math.min(maxSize,d.imageSize)+'"></label><label>Rotate<input data-range="imageRotation" type="range" min="-180" max="180" value="'+d.imageRotation+'"></label><button data-action="reset-image">'+I('rotate')+' Reset</button></div></section>':'')+
            '<section class="control-block print-control"><label>Printing type</label><div class="print-options">'+state.printMethods.map(p=>{const disabled=!!(p.lightOnly&&dark);return '<button data-action="print" data-value="'+S.esc(p.name)+'" class="'+(state.printType===p.name?'active ':'')+(disabled?'disabled':'')+'" '+(disabled?'disabled aria-disabled="true"':'')+'><span>'+(state.printType===p.name?I('check'):'')+'</span><b>'+S.esc(p.name)+'</b><small>'+S.esc(p.note)+'</small><strong>+'+S.money(p.price)+'</strong></button>';}).join('')+'</div>'+darkPrintNote()+'</section>'+
            '<div class="designer-total refined-total"><div><small>Estimated total</small><strong>'+S.money(unitPrice()*state.qty)+'</strong><span>'+state.model.type+' · '+state.material.name+' · '+designedCount()+' print area'+(designedCount()===1?'':'s')+' · '+state.qty+' piece'+(state.qty===1?'':'s')+'</span></div><div class="qty-control polished-qty"><button data-action="qty-minus">'+I('minus')+'</button><span>'+state.qty+'</span><button data-action="qty-plus">'+I('plus')+'</button></div></div><button class="primary wide refined-add" data-action="add">Add custom design to cart '+I('arrow')+'</button>'+
          '</aside></div></main>';
      bind();requestAnimationFrame(syncCurrentScale);
    }

    function handles(layer){return '<button class="layer-remove" data-action="remove" data-layer="'+layer+'" aria-label="Delete selected item">'+I('close')+'</button><button class="layer-rotate" data-transform="'+layer+'" aria-label="Rotate and resize selected item">'+I('rotate')+'</button>';}
    function chooseModel(value){const found=models.find(m=>m.name===value);if(found){state.model=found;saveDraft();}}
    function chooseMaterial(value){const found=materials.find(m=>m.name===value);if(found){state.material=found;saveDraft();}}
    function remove(layer){const d=current();if(layer==='text'){d.text='';d.textRotation=0;}else{d.uploadedImage='';d.imageRotation=0;}state.active=null;saveDraft();render();}
    function makeDesign(){syncCurrentScale();const front=state.designs.front;return {model:state.model.name,garmentType:state.model.type,materialQuality:state.material.name,materialPrice:state.material.price,garmentImage:state.model.image,garmentBackImage:state.model.backImage,sleeveImage,garmentColor:state.color,text:front.text,font:front.font,textColor:front.textColor,textSize:front.textSize,textScale:front.textScale,textRotation:front.textRotation,uploadedImage:front.uploadedImage,imageSize:front.imageSize,imageScale:front.imageScale,imageRotation:front.imageRotation,positions:front.positions,printType:state.printType,surfaceDesigns:clone(state.designs)};}
    function add(){const customDesign=makeDesign();hooks.onAdd({key:'custom-'+Date.now(),name:state.model.type+' · Custom',price:unitPrice(),qty:state.qty,color:state.color,size:state.size,detail:state.material.name+' cloth · '+state.printType+' · '+designedCount()+' print area'+(designedCount()===1?'':'s'),image:state.model.image,custom:true,customDesign});saveDraft();}
    function upload(file){
      if(!file||!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);current().uploadedImage=canvas.toDataURL('image/webp',.86);current().imageRotation=0;state.active='image';saveDraft();render();};img.src=String(reader.result);};reader.readAsDataURL(file);
    }
    function layerPosition(layer,clientX,clientY){const area=root.querySelector('[data-print-area]')?.getBoundingClientRect();if(!area)return;const x=(clientX-area.left)/area.width*100,y=(clientY-area.top)/area.height*100;current().positions[layer]={x:Math.max(-30,Math.min(130,x)),y:Math.max(-30,Math.min(130,y))};const el=root.querySelector('[data-layer="'+layer+'"]');if(el){el.style.left=current().positions[layer].x+'%';el.style.top=current().positions[layer].y+'%';}saveDraft();}
    function layerStyle(layer){const d=current(),el=root.querySelector('[data-layer="'+layer+'"]');if(!el)return;if(layer==='text'){d.textSize=clampText(d.textSize);el.style.fontSize=d.textSize+'px';el.style.transform='translate(-50%,-50%) rotate('+d.textRotation+'deg)';}else{el.style.width=d.imageSize+'px';el.style.transform='translate(-50%,-50%) rotate('+d.imageRotation+'deg)';}syncCurrentScale();}
    function focusTextEditor(){state.active='text';render();setTimeout(()=>{const input=root.querySelector('[data-text]');input?.focus();input?.select();input?.scrollIntoView({behavior:'smooth',block:'center'});},20);}

    function bind(){
      root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',e=>{
        const a=el.dataset.action;
        if(a==='back'){syncCurrentScale();hooks.onBack();}
        else if(a==='add')add();
        else if(a==='surface'){syncCurrentScale();state.surface=el.dataset.value;state.active=null;state.pickerOpen=null;saveDraft();render();}
        else if(a==='toggle-picker'){e.stopPropagation();state.pickerOpen=state.pickerOpen===el.dataset.pickerName?null:el.dataset.pickerName;render();}
        else if(a==='pick'){const n=el.dataset.pickerName,v=el.dataset.value;if(n==='size')state.size=v;if(n==='font')current().font=v;state.pickerOpen=null;saveDraft();render();}
        else if(a==='model-card'){chooseModel(el.dataset.value);render();}
        else if(a==='material-card'){chooseMaterial(el.dataset.value);render();}
        else if(a==='add-text'){if(!current().text)current().text='YOUR TEXT';focusTextEditor();}
        else if(a==='choose-image')root.querySelector('[data-file]')?.click();
        else if(a==='color'){state.color=el.dataset.value;if(S.isDarkColor(state.color)&&chosenPrint().lightOnly)state.printType=state.printMethods.find(p=>!p.lightOnly)?.name||'DTF Print';saveDraft();render();}
        else if(a==='remove'){e.preventDefault();e.stopPropagation();remove(el.dataset.layer);}
        else if(a==='print'){if(el.disabled)return;state.printType=el.dataset.value;saveDraft();render();}
        else if(a==='reset-image'){current().imageRotation=0;saveDraft();render();}
        else if(a==='qty-minus'){state.qty=Math.max(1,state.qty-1);saveDraft();render();}
        else if(a==='qty-plus'){state.qty++;saveDraft();render();}
      }));
      const file=root.querySelector('[data-file]');if(file)file.addEventListener('change',()=>upload(file.files?.[0]));
      const txt=root.querySelector('[data-text]');if(txt)txt.addEventListener('input',()=>{current().text=txt.value;state.active=txt.value?'text':null;const textEl=root.querySelector('.layer-text-content');if(textEl)textEl.textContent=txt.value;saveDraft();});
      const col=root.querySelector('[data-color-input]');if(col)col.addEventListener('input',()=>{current().textColor=col.value;const layer=root.querySelector('[data-layer="text"]');if(layer)layer.style.color=col.value;saveDraft();});
      root.querySelectorAll('[data-range]').forEach(el=>el.addEventListener('input',()=>{current()[el.dataset.range]=el.dataset.range==='textSize'?clampText(el.value):Number(el.value);const label=el.closest('label')?.querySelector('small');if(label&&(el.dataset.range==='textSize'||el.dataset.range==='imageSize'))label.textContent=Math.round(Number(el.value))+' px';layerStyle(el.dataset.range.startsWith('text')?'text':'image');saveDraft();}));
      root.querySelectorAll('[data-layer]').forEach(el=>{
        el.addEventListener('dblclick',e=>{if(el.dataset.layer==='text'){e.preventDefault();e.stopPropagation();focusTextEditor();}});
        el.addEventListener('pointerdown',e=>{
          if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();const layer=el.dataset.layer;const now=Date.now();if(layer==='text'&&lastTap.layer==='text'&&now-lastTap.time<330){lastTap={time:0,layer:""};focusTextEditor();return;}lastTap={time:now,layer};
          if(state.active!==layer){state.active=layer;render();return;}el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,layer});const pts=[...pointers.values()].filter(p=>p.layer===layer);if(pts.length===2)pinch={distance:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),size:layer==='text'?current().textSize:current().imageSize,layer};
        });
        el.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;e.preventDefault();const layer=el.dataset.layer;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,layer});const pts=[...pointers.values()].filter(p=>p.layer===layer);if(pts.length>=2&&pinch?.layer===layer){const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),size=pinch.size*(distance/Math.max(1,pinch.distance));if(layer==='text')current().textSize=clampText(size);else current().imageSize=clampMin(size,10);layerStyle(layer);}else if(pts.length===1)layerPosition(layer,e.clientX,e.clientY);});
        const end=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;syncCurrentScale();};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
      });
      root.querySelectorAll('[data-transform]').forEach(handle=>{
        handle.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const layer=handle.dataset.transform,box=handle.parentElement.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;transformGesture={id:e.pointerId,layer,cx,cy,angle:Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI,rotation:layer==='text'?current().textRotation:current().imageRotation,distance:Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy)),size:layer==='text'?current().textSize:current().imageSize};handle.setPointerCapture(e.pointerId);});
        handle.addEventListener('pointermove',e=>{const g=transformGesture;if(!g||g.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();const angle=Math.atan2(e.clientY-g.cy,e.clientX-g.cx)*180/Math.PI,distance=Math.max(1,Math.hypot(e.clientX-g.cx,e.clientY-g.cy));let rotation=g.rotation+angle-g.angle;if(Math.abs(rotation%45)<3)rotation=Math.round(rotation/45)*45;const size=g.size*(distance/g.distance);if(g.layer==='text'){current().textRotation=Math.round(rotation);current().textSize=clampText(size);}else{current().imageRotation=Math.round(rotation);current().imageSize=clampMin(size,10);}layerStyle(g.layer);});
        const finish=e=>{e.preventDefault();e.stopPropagation();transformGesture=null;syncCurrentScale();};handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
      });
      const stage=root.querySelector('[data-stage]');if(stage)stage.addEventListener('pointerdown',e=>{if(!e.target.closest('.design-layer')&&!e.target.closest('.custom-picker')&&state.active){state.active=null;render();}});
    }
    let resizeTimer=null;
    const onResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>render(),90);};
    window.addEventListener('resize',onResize);
    window.visualViewport?.addEventListener?.('resize',onResize);
    render();
    return{destroy(){clearTimeout(resizeTimer);window.removeEventListener('resize',onResize);window.visualViewport?.removeEventListener?.('resize',onResize);syncCurrentScale();root.innerHTML='';}};
  }
  window.OneLineDesigner={mount};
})();
