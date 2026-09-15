(function(){
 'use strict';
 const version='20260915-r7';
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 let refreshing=false;
 const hadController=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!refreshing){refreshing=true;location.reload();}});
 navigator.serviceWorker.register('./sw.js?v='+version,{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
})();
