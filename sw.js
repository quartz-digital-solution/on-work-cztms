const CACHE="one-line-static-v5";
const CORE=[
  "./index.html","./admin.html","./staff.html","./receiver.html","./css/styles.css",
  "./js/data.js","./js/designer.js","./js/app.js","./js/admin.js","./js/staff.js",
  "./one-line-mark.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest",
  "./assets/crew-tee.webp","./assets/crew-tee-back.webp","./assets/polo-shirt.webp",
  "./assets/polo-shirt-back.webp","./assets/sports-jersey.webp","./assets/sports-jersey-back.webp",
  "./assets/crew-tee-left-sleeve-close.webp","./assets/crew-tee-right-sleeve-close.webp",
  "./assets/polo-shirt-left-sleeve-close.webp","./assets/polo-shirt-right-sleeve-close.webp",
  "./assets/sports-jersey-left-sleeve-close.webp","./assets/sports-jersey-right-sleeve-close.webp",
  "./assets/uniform-shirt-left-sleeve-close.webp","./assets/uniform-shirt-right-sleeve-close.webp","./assets/uniform-shirt-front.webp","./assets/uniform-shirt-back.webp",
  "./assets/category-tshirts.webp","./assets/category-uniforms.webp","./assets/category-sportswear.webp","./assets/category-shirts.webp","./assets/category-tags-labels.webp",
  "./assets/school-belt.webp","./assets/student-id-tag.webp","./assets/oxford-shirt.webp"
];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));});
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok&&new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;})));
});
