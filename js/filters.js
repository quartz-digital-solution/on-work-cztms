(function(){
 'use strict';
 const S=window.OneLineStore,E=S.esc;
 function open(products,current,onApply){
   const host=document.createElement('div');document.body.append(host);let draft=S.clone(current||{});
   const fields=['categories','subcategories','sizes','colors'];fields.forEach(k=>draft[k]||=[]);
   const unique=rows=>[...new Set(rows.filter(Boolean))];
   function render(){
     const cats=S.categoriesForCustomer(),subs=S.getSubcategories().filter(s=>s.active&&cats.some(c=>c.id===s.categoryId)&&(!draft.categories.length||draft.categories.includes(s.categoryId)));
     const relevant=products.filter(p=>(!draft.categories.length||draft.categories.includes(p.categoryId))&&(!draft.subcategories.length||draft.subcategories.includes(p.subcategoryId)));
     const groups=[['categories','Category',cats.map(c=>[c.id,c.name])],['subcategories','Subcategory',subs.map(s=>[s.id,s.name])],['sizes','Size / option',unique(relevant.flatMap(p=>p.sizes)).map(s=>[s,s])],['colors','Colour',unique(relevant.flatMap(p=>p.colors)).map(c=>[c,c])]];
     host.innerHTML=`<div class="filter-overlay"><section class="filter-panel" role="dialog" aria-modal="true" aria-label="Filter products"><header><div><span>REFINE YOUR SEARCH</span><h2>Filters</h2></div><button data-close aria-label="Close filters">${S.icon('close')}</button></header><form><div class="filter-scroll">${groups.map(([key,label,options])=>`<fieldset><legend>${label}</legend><div class="filter-choices">${options.map(([id,name])=>`<label><input type="checkbox" data-filter="${key}" value="${E(id)}" ${draft[key].includes(id)?'checked':''}><span>${key==='colors'?`<i style="background:${E(S.palette[name]||name)}"></i>`:''}${E(name)}</span></label>`).join('')||'<small>No options in this selection</small>'}</div></fieldset>`).join('')}<fieldset><legend>Availability</legend><select data-availability><option value="">All products</option><option value="available" ${draft.availability==='available'?'selected':''}>Available now</option><option value="unavailable" ${draft.availability==='unavailable'?'selected':''}>Out of stock</option></select><p>Size and colour filters match the same available variant.</p></fieldset></div><footer><button type="button" data-reset>Reset</button><button class="primary" type="submit">Show products ${S.icon('arrow')}</button></footer></form></section></div>`;
     host.querySelector('[data-close]').onclick=()=>host.remove();
     host.querySelector('.filter-overlay').onclick=e=>{if(e.target===e.currentTarget)host.remove();};
     host.querySelector('[data-reset]').onclick=()=>{draft={categories:[],subcategories:[],sizes:[],colors:[],availability:''};render();};
     host.querySelectorAll('[data-filter]').forEach(el=>el.onchange=()=>{const key=el.dataset.filter;draft[key]=[...host.querySelectorAll(`[data-filter="${key}"]:checked`)].map(x=>x.value);if(key==='categories'){draft.subcategories=draft.subcategories.filter(id=>S.getSubcategories().some(s=>s.id===id&&(!draft.categories.length||draft.categories.includes(s.categoryId))));render();}});
     host.querySelector('[data-availability]').onchange=e=>draft.availability=e.target.value;
     host.querySelector('form').onsubmit=async e=>{e.preventDefault();host.innerHTML='<div class="filter-overlay"><div class="filter-loading" role="status"><span></span>Finding your products…</div></div>';await new Promise(r=>setTimeout(r,180));onApply(draft);host.remove();};
   }
   render();host.querySelector('[data-close]').focus();
   host.addEventListener('keydown',e=>{if(e.key==='Escape')host.remove();if(e.key==='Tab'){const els=[...host.querySelectorAll('button,input,select')],a=els[0],b=els[els.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}});
 }
 window.OneLineFilters={open};
})();
