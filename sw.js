// 简单离线缓存：安装时先存好核心文件；平时网络优先，断网时用缓存
const C='panbao-home-v34',V='?v=38';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-180.png','style.css'+V,
 ...['sfx','sprites','data','game','ui'].map(f=>'js/'+f+'.js'+V),
 ...['idle0','idle1','cry0','cry1','laugh0','laugh1'].map(f=>'img/baby/beige-'+f+'.png')];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('panbao-home-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||!q.url.startsWith(self.location.origin))return;
 e.respondWith(fetch(q).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp))}return r})
  .catch(()=>caches.match(q).then(m=>m||(q.mode==='navigate'?caches.match('./'):caches.match(q,{ignoreSearch:true})))))});
