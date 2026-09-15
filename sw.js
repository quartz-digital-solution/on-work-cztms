const CACHE='one-line-v10-20260915-2316';
const CORE=[
  "./index.html","./admin.html","./receiver.html","./css/styles.css","./css/admin.css",
  "./js/data.js","./js/designer.js","./js/app.js","./js/admin.js","./js/receiver.js",
  "./one-line-mark.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest",
  "./assets/crew-tee.webp","./assets/crew-tee-back.webp","./assets/polo-shirt.webp",
  "./assets/polo-shirt-back.webp","./assets/sports-jersey.webp","./assets/sports-jersey-back.webp","./assets/sleeve-side-neutral.webp"
];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));});
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin){event.respondWith(fetch(event.request));return;}
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;})));
});
