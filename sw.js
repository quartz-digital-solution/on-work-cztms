/* One-Line release 20260915-r7. App caches never contain customer records. */
const CACHE='one-line-static-20260915-r7';
const CORE=[
  "./admin.html",
  "./assets/category-shirts.webp",
  "./assets/category-sportswear.webp",
  "./assets/category-tags-labels.webp",
  "./assets/category-tshirts.webp",
  "./assets/category-uniforms.webp",
  "./assets/crew-tee-back.webp",
  "./assets/crew-tee-left-sleeve-close.webp",
  "./assets/crew-tee-right-sleeve-close.webp",
  "./assets/crew-tee-sleeve.webp",
  "./assets/crew-tee.webp",
  "./assets/oxford-shirt.webp",
  "./assets/polo-shirt-back.webp",
  "./assets/polo-shirt-left-sleeve-close.webp",
  "./assets/polo-shirt-right-sleeve-close.webp",
  "./assets/polo-shirt-sleeve.webp",
  "./assets/polo-shirt.webp",
  "./assets/school-belt.webp",
  "./assets/sleeve-side-neutral.webp",
  "./assets/sports-jersey-back.webp",
  "./assets/sports-jersey-left-sleeve-close.webp",
  "./assets/sports-jersey-right-sleeve-close.webp",
  "./assets/sports-jersey-sleeve.webp",
  "./assets/sports-jersey.webp",
  "./assets/student-id-tag.webp",
  "./assets/uniform-shirt-back.webp",
  "./assets/uniform-shirt-front.webp",
  "./assets/uniform-shirt-left-sleeve-close.webp",
  "./assets/uniform-shirt-right-sleeve-close.webp",
  "./assets/uniform-shirt-sleeve.webp",
  "./b2b.html",
  "./css/styles.css?v=20260915-r7",
  "./css/upgrade.css?v=20260915-r7",
  "./icon-192.png",
  "./icon-512.png",
  "./index.html",
  "./js/admin.js?v=20260915-r7",
  "./js/app.js?v=20260915-r7",
  "./js/catalog.js?v=20260915-r7",
  "./js/data.js?v=20260915-r7",
  "./js/designer.js?v=20260915-r7",
  "./js/filters.js?v=20260915-r7",
  "./js/product-editor.js?v=20260915-r7",
  "./js/pwa.js?v=20260915-r7",
  "./js/receiver.js?v=20260915-r7",
  "./js/staff.js?v=20260915-r7",
  "./js/stock-desk.js?v=20260915-r7",
  "./management.html",
  "./manifest.webmanifest?v=20260915-r7",
  "./one-line-mark.svg",
  "./receiver.html",
  "./staff.html",
  "./icon-192.png?v=20260915-r7",
  "./icon-512.png?v=20260915-r7",
  "./one-line-mark.svg?v=20260915-r7"
];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(name=>name!==CACHE&&(name.startsWith('one-line-')||name.startsWith('custom-store-'))).map(name=>caches.delete(name)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try {const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}
   catch(error){const hit=await cache.match(request);if(hit)return hit;
     if(request.mode==='navigate'){const path=url.pathname.endsWith('/')?'./index.html':'./'+url.pathname.split('/').pop();const page=await cache.match(path);if(page)return page;}
     throw error;
   }
 })());
});
