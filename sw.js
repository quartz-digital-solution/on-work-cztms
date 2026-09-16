const CACHE='one-line-v19-20260916-true-native-scroll-gallery-history';
const CORE=[
  './index.html','./admin.html','./staff.html','./management.html','./receiver.html','./css/styles.css','./css/admin.css',
  './js/data.js','./js/designer.js','./js/app.js','./js/admin.js','./js/receiver.js',
  './one-line-mark.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest',
  './assets/tshirts-category.webp','./assets/crew-tee.webp','./assets/crew-tee-back.webp','./assets/polo-shirt.webp',
  './assets/polo-shirt-back.webp','./assets/sports-jersey.webp','./assets/sports-jersey-back.webp','./assets/sleeve-side-neutral.webp','./assets/contact-support.png'
];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  // HTML, JS and CSS are network-first so a newly deployed bug fix is not hidden by stale PWA code.
  const isCode=event.request.mode==='navigate'||/\.(?:js|css|html)$/.test(url.pathname);
  if(isCode){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-cache'});
        if(response&&response.ok){
          const cache=await caches.open(CACHE);
          cache.put(event.request,response.clone());
        }
        return response;
      }catch(_){
        return (await caches.match(event.request)) || (event.request.mode==='navigate'?await caches.match('./index.html'):Response.error());
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    const response=await fetch(event.request);
    if(response&&response.ok){
      const cache=await caches.open(CACHE);
      cache.put(event.request,response.clone());
    }
    return response;
  })());
});
