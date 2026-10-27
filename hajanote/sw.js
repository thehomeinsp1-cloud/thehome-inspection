// 자동 생성 파일 (tools/web-sw.py) — 직접 고치지 마세요
const CACHE = 'hajanote-077069e918f4';
const FILES = ["./apple-touch-icon.png", "./assets/_commonjs-dynamic-modules-TDtrdbi3.js", "./assets/code-KaFSeAJS.js", "./assets/exceljs.min-Bb6MJ5Or.js", "./assets/html2canvas.esm-Dw6mdHwC.js", "./assets/index-BW_Fu6HI.js", "./assets/index-CG_MHnFw.js", "./assets/index-CPodEVST.css", "./assets/index-Cl50C6M1.js", "./assets/index-DgLdrm1c.js", "./assets/index-MzatcQdM.js", "./assets/index.es-BPs3qWz7.js", "./assets/jspdf.es.min-CD4DAvRy.js", "./assets/jszip.min-BIxTstbs.js", "./assets/purify.es-C8T5ouKw.js", "./assets/web-CAytTh0i.js", "./assets/web-CBwotKl7.js", "./assets/web-F0t1XiB8.js", "./fonts/OFL-WantedSans.txt", "./fonts/WantedSansVariable.woff2", "./icon-192.png", "./icon-512.png", "./index.html", "./manifest.webmanifest"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...FILES])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('hajanote-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // 가입 정보 전송 등 바깥 주소는 건드리지 않음
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r).catch(() => (r.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
