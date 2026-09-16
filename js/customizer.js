(()=>{
  'use strict';
  const S=window.OneLine;
  const MODELS={
    tshirt:{id:'tshirt',name:'T-Shirt',base:499,front:'assets/tshirt-front.webp',back:'assets/tshirt-back.webp',rightSleeve:'assets/crew-tee-right-sleeve-close.webp',leftSleeve:'assets/crew-tee-left-sleeve-close.webp',sizes:['S','M','L','XL','XXL']},
    sports:{id:'sports',name:'Sportswear',base:649,front:'assets/sports-jersey.webp',back:'assets/sports-jersey-back.webp',rightSleeve:'assets/sports-jersey-right-sleeve-close.webp',leftSleeve:'assets/sports-jersey-left-sleeve-close.webp',sizes:['S','M','L','XL']},
    polo:{id:'polo',name:'Polo',base:599,front:'assets/polo-shirt.webp',back:'assets/polo-shirt-back.webp',rightSleeve:'assets/polo-shirt-right-sleeve-close.webp',leftSleeve:'assets/polo-shirt-left-sleeve-close.webp',sizes:['M','L','XL','XXL']}
  };
  const COLORS=['White','Black','Navy','Maroon','Olive','Sky','Sand','Red','Green','Yellow','Grey','Pink'];
  const FONTS=['Arial','Georgia','Impact','Trebuchet MS','Courier New','Verdana'];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const surfaceLabel={front:'Front',back:'Back',rightSleeve:'R sleeve',leftSleeve:'L sleeve'};
  const blankSurface=()=>({text:null,image:null});
  const newState=()=>({
    model:'tshirt',surface:'front',garmentColor:'White',size:'M',printId:'dtf',selected:null,
    surfaces:{front:blankSurface(),back:blankSurface(),rightSleeve:blankSurface(),leftSleeve:blankSurface()}
  });
  const validDraft=d=>d&&MODELS[d.model]&&d.surfaces?.front;
  function mount(root,options={}){
    let state=validDraft(S.getDraft())?S.getDraft():newState();
    let pointers=new Map(),gesture=null,lastTextTap=0,raf=0;
    const getModel=()=>MODELS[state.model];
    const getSurface=()=>state.surfaces[state.surface];
    const selectedObject=()=>state.selected?getSurface()[state.selected]:null;
    const getPrint=()=>S.getPrints().find(p=>p.id===state.printId)||S.getPrints()[0];
    const total=()=>getModel().base+Number(getPrint()?.price||0);
    const persist=()=>S.setDraft(S.clone({...state,selected:null}));
    const icon=(name)=>{
      const paths={back:'<path d="m15 18-6-6 6-6M9 12h11"/>',type:'<path d="M5 5h14M12 5v14M8 19h8"/>',image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/>',trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/>',bag:'<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>'};
      return `<svg class="icon" viewBox="0 0 24 24">${paths[name]||''}</svg>`;
    };
    root.innerHTML=`
      <div class="customizer-page">
        <div class="page">
          <div class="customizer-top">
            <button class="back-btn" id="designer-back" aria-label="Back">${icon('back')}</button>
            <div class="price-pill" id="designer-price">${S.money(total())}</div>
          </div>
          <div class="customizer-shell">
            <div class="designer-main">
              <div class="garment-type-row" id="type-row"></div>
              <div class="surface-tabs" id="surface-tabs"></div>
              <div class="design-stage" id="design-stage">
                <div class="garment-canvas" id="garment-canvas">
                  <img class="garment-base" id="garment-base" alt="Garment">
                  <span class="garment-tint" id="garment-tint"></span>
                  <div class="print-zone" id="print-zone"></div>
                </div>
                <div class="stage-help">Drag to move · pinch to resize/rotate · tap outside to deselect</div>
              </div>
              <div class="add-tools">
                <button class="btn btn-secondary" id="add-text">${icon('type')} Add text</button>
                <button class="btn btn-secondary" id="add-image">${icon('image')} Add image</button>
                <input id="image-input" type="file" accept="image/*" hidden>
              </div>
            </div>
            <aside class="design-sidebar">
              <section class="panel" id="garment-panel">
                <h3>Garment</h3>
                <div class="control-grid">
                  <div class="control-row"><label>Colour</label><div class="color-list" id="colour-list"></div></div>
                  <div class="control-row"><label>Size</label><div class="options" id="size-list"></div></div>
                </div>
              </section>
              <section class="panel" id="object-panel" hidden>
                <h3 id="object-title">Selected object</h3>
                <div id="object-controls"></div>
              </section>
              <section class="panel">
                <h3>Print method</h3>
                <div class="print-list" id="print-list"></div>
              </section>
              <section class="panel">
                <div class="customizer-summary"><span>Total</span><strong id="summary-total">${S.money(total())}</strong></div>
                <div class="customizer-footer-action" style="margin-top:14px">
                  <button class="btn btn-primary btn-wide" id="add-custom-cart">${icon('bag')} Add custom item to cart</button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>`;

    const q=s=>root.querySelector(s), zone=q('#print-zone'), base=q('#garment-base'), tint=q('#garment-tint');
    const renderTypes=()=>{q('#type-row').innerHTML=Object.values(MODELS).map(m=>`<button class="type-card ${state.model===m.id?'active':''}" data-model="${m.id}"><strong>${m.name}</strong><small>${S.money(m.base)} base</small></button>`).join('');};
    const renderSurfaces=()=>{q('#surface-tabs').innerHTML=Object.keys(surfaceLabel).map(k=>`<button class="surface-tab ${state.surface===k?'active':''}" data-surface="${k}">${surfaceLabel[k]}</button>`).join('');};
    const renderColours=()=>{q('#colour-list').innerHTML=COLORS.map(c=>`<button class="color-pick ${state.garmentColor===c?'active':''}" data-color="${c}" title="${c}" style="background:${S.palette[c]||c}"></button>`).join('');};
    const renderSizes=()=>{const sizes=getModel().sizes;q('#size-list').innerHTML=sizes.map(s=>`<button class="option ${state.size===s?'selected':''}" data-size="${s}">${s}</button>`).join('');};
    const renderPrints=()=>{
      const dark=S.isDarkColor(state.garmentColor);
      q('#print-list').innerHTML=S.getPrints().filter(p=>p.active!==false).map(p=>{
        const disabled=p.lightOnly&&dark;
        return `<button class="print-option ${state.printId===p.id?'active':''}" data-print="${p.id}" ${disabled?'disabled':''}><strong>${S.esc(p.name)} · ${S.money(p.price)}</strong><small>${S.esc(disabled?'Unavailable on dark garments':p.note)}</small></button>`;
      }).join('');
      if(getPrint()?.lightOnly&&dark){state.printId=S.getPrints().find(p=>!p.lightOnly&&p.active!==false)?.id||'dtf';renderPrints();return;}
    };
    const updatePrice=()=>{q('#designer-price').textContent=S.money(total());q('#summary-total').textContent=S.money(total());};
    const renderGarment=()=>{
      const m=getModel(),src=m[state.surface];
      base.src=src;
      tint.style.setProperty('--garment-color',S.palette[state.garmentColor]||state.garmentColor);
      tint.style.setProperty('--garment-mask',`url("${src}")`);
      zone.dataset.surface=state.surface;
    };
    const createLayer=(type,obj)=>{
      if(!obj)return null;
      const el=document.createElement(type==='text'?'div':'img');
      el.className=`design-layer design-${type}${state.selected===type?' selected':''}`;
      el.dataset.layer=type;
      if(type==='text')el.textContent=obj.value;
      else{el.src=obj.src;el.alt='Uploaded artwork';}
      bindLayer(el,type);
      zone.appendChild(el);
      applyLayerStyle(el,type,obj);
      return el;
    };
    const renderLayers=()=>{
      zone.innerHTML='';
      const surf=getSurface();
      createLayer('text',surf.text);createLayer('image',surf.image);
      zone.classList.toggle('empty',!surf.text&&!surf.image);
      renderObjectPanel();
    };
    const applyLayerStyle=(el,type,obj)=>{
      el.style.left=`${obj.x}%`;el.style.top=`${obj.y}%`;el.style.transform=`translate(-50%,-50%) rotate(${obj.rotation||0}deg)`;
      if(type==='text'){
        el.style.fontFamily=obj.font||'Arial';el.style.color=obj.color||'#111';el.style.fontSize=`${Math.max(10,(obj.size/100)*zone.clientWidth)}px`;
      }else{
        el.style.width=`${obj.size}%`;el.style.height='auto';
      }
    };
    const refreshStyles=()=>{zone.querySelectorAll('.design-layer').forEach(el=>{const t=el.dataset.layer,o=getSurface()[t];if(o)applyLayerStyle(el,t,o);});};
    const renderObjectPanel=()=>{
      const panel=q('#object-panel'),box=q('#object-controls'),obj=selectedObject();
      if(!obj){panel.hidden=true;box.innerHTML='';return;}
      panel.hidden=false;q('#object-title').textContent=state.selected==='text'?'Text':'Image';
      if(state.selected==='text'){
        box.innerHTML=`<div class="control-grid">
          <div class="control-row"><label>Text</label><input id="text-value" type="text" maxlength="60" value="${S.esc(obj.value)}"></div>
          <div class="control-row"><label>Font</label><select id="text-font">${FONTS.map(f=>`<option ${obj.font===f?'selected':''}>${f}</option>`).join('')}</select></div>
          <div class="control-row"><label>Text colour</label><input id="text-color" type="color" value="${S.esc(obj.color||'#111111')}"></div>
          <div class="control-row"><label>Size</label><input id="object-size" type="range" min="8" max="65" value="${obj.size}"></div>
          <div class="control-row"><label>Rotate</label><input id="object-rotate" type="range" min="-180" max="180" value="${obj.rotation||0}"></div>
          <button class="btn btn-danger btn-wide" id="delete-object">${icon('trash')} Remove text</button>
        </div>`;
      }else{
        box.innerHTML=`<div class="control-grid">
          <div class="control-row"><label>Size</label><input id="object-size" type="range" min="12" max="95" value="${obj.size}"></div>
          <div class="control-row"><label>Rotate</label><input id="object-rotate" type="range" min="-180" max="180" value="${obj.rotation||0}"></div>
          <button class="btn btn-danger btn-wide" id="delete-object">${icon('trash')} Remove image</button>
        </div>`;
      }
      const value=q('#text-value');if(value){value.addEventListener('input',e=>{obj.value=e.target.value;const el=zone.querySelector('[data-layer="text"]');if(el)el.childNodes[0].nodeValue=obj.value;persist();});}
      q('#text-font')?.addEventListener('change',e=>{obj.font=e.target.value;refreshStyles();persist();});
      q('#text-color')?.addEventListener('input',e=>{obj.color=e.target.value;refreshStyles();persist();});
      q('#object-size')?.addEventListener('input',e=>{obj.size=Number(e.target.value);refreshStyles();persist();});
      q('#object-rotate')?.addEventListener('input',e=>{obj.rotation=Number(e.target.value);refreshStyles();persist();});
      q('#delete-object')?.addEventListener('click',()=>{getSurface()[state.selected]=null;state.selected=null;persist();renderLayers();});
    };
    const select=(type)=>{state.selected=type;zone.querySelectorAll('.design-layer').forEach(x=>x.classList.toggle('selected',x.dataset.layer===type));renderObjectPanel();};
    function bindLayer(el,type){
      el.addEventListener('click',e=>{e.stopPropagation();select(type);});
      el.addEventListener('dblclick',e=>{if(type!=='text')return;e.preventDefault();select(type);requestAnimationFrame(()=>{const input=q('#text-value');input?.focus();input?.select();});});
      el.addEventListener('pointerdown',e=>{
        e.stopPropagation();select(type);el.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
        const obj=getSurface()[type];
        if(pointers.size===1){gesture={kind:'move',pointer:e.pointerId,startX:e.clientX,startY:e.clientY,x:obj.x,y:obj.y};}
        if(pointers.size===2){const [a,b]=[...pointers.values()];gesture={kind:'pinch',distance:Math.hypot(b.x-a.x,b.y-a.y)||1,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,size:obj.size,rotation:obj.rotation||0};}
      });
      el.addEventListener('pointermove',e=>{
        if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const obj=getSurface()[type];
        if(pointers.size>=2){const [a,b]=[...pointers.values()];if(!gesture||gesture.kind!=='pinch')gesture={kind:'pinch',distance:Math.hypot(b.x-a.x,b.y-a.y)||1,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,size:obj.size,rotation:obj.rotation||0};const d=Math.hypot(b.x-a.x,b.y-a.y)||1,ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;obj.size=clamp(gesture.size*(d/gesture.distance),type==='text'?8:12,type==='text'?65:95);obj.rotation=clamp(gesture.rotation+(ang-gesture.angle),-180,180);}
        else if(gesture?.kind==='move'){
          const r=zone.getBoundingClientRect();obj.x=clamp(gesture.x+(e.clientX-gesture.startX)/r.width*100,2,98);obj.y=clamp(gesture.y+(e.clientY-gesture.startY)/r.height*100,2,98);
        }
        if(!raf)raf=requestAnimationFrame(()=>{raf=0;applyLayerStyle(el,type,obj);});
      });
      const end=e=>{pointers.delete(e.pointerId);if(pointers.size===1){const [p]=[...pointers.entries()];const obj=getSurface()[type];gesture={kind:'move',pointer:p[0],startX:p[1].x,startY:p[1].y,x:obj.x,y:obj.y};}else if(!pointers.size){gesture=null;persist();renderObjectPanel();}};
      el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
      if(type==='text')el.addEventListener('touchend',()=>{const now=Date.now();if(now-lastTextTap<320){select('text');setTimeout(()=>q('#text-value')?.focus(),0);}lastTextTap=now;},{passive:true});
    }
    const renderAll=()=>{renderTypes();renderSurfaces();renderColours();renderSizes();renderPrints();renderGarment();renderLayers();updatePrice();};

    q('#designer-back').addEventListener('click',()=>options.onBack?.());
    q('#type-row').addEventListener('click',e=>{const b=e.target.closest('[data-model]');if(!b)return;state.model=b.dataset.model;const sizes=getModel().sizes;if(!sizes.includes(state.size))state.size=sizes[0];persist();renderAll();});
    q('#surface-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-surface]');if(!b)return;state.surface=b.dataset.surface;state.selected=null;persist();renderAll();});
    q('#colour-list').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;state.garmentColor=b.dataset.color;persist();renderColours();renderPrints();renderGarment();updatePrice();});
    q('#size-list').addEventListener('click',e=>{const b=e.target.closest('[data-size]');if(!b)return;state.size=b.dataset.size;persist();renderSizes();});
    q('#print-list').addEventListener('click',e=>{const b=e.target.closest('[data-print]');if(!b||b.disabled)return;state.printId=b.dataset.print;persist();renderPrints();updatePrice();});
    q('#add-text').addEventListener('click',()=>{const surf=getSurface();if(!surf.text)surf.text={value:'Your text',font:'Arial',color:'#111111',size:24,rotation:0,x:50,y:42};state.selected='text';persist();renderLayers();requestAnimationFrame(()=>{const input=q('#text-value');input?.focus();input?.select();});});
    q('#add-image').addEventListener('click',()=>q('#image-input').click());
    q('#image-input').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){alert('Please choose an image under 5 MB.');return;}const r=new FileReader();r.onload=()=>{getSurface().image={src:r.result,size:42,rotation:0,x:50,y:58};state.selected='image';persist();renderLayers();};r.readAsDataURL(f);e.target.value='';});
    zone.addEventListener('click',e=>{if(e.target===zone){state.selected=null;zone.querySelectorAll('.design-layer').forEach(x=>x.classList.remove('selected'));renderObjectPanel();}});
    q('#add-custom-cart').addEventListener('click',()=>{
      const hasDesign=Object.values(state.surfaces).some(x=>x.text||x.image);
      const item={cartKey:S.uid('CUSTOM'),custom:true,productId:'custom',name:`Custom ${getModel().name}`,price:total(),image:getModel().front,qty:1,color:state.garmentColor,size:state.size,print:getPrint()?.name||'',design:S.clone({...state,selected:null})};
      S.addCart(item);persist();options.onAdd?.(item);if(!options.onAdd)alert(hasDesign?'Custom item added to cart.':'Blank custom garment added to cart.');
    });
    window.addEventListener('resize',refreshStyles,{passive:true});
    renderAll();
    return {destroy(){window.removeEventListener('resize',refreshStyles);}};
  }
  window.OneLineCustomizer={mount};
})();
