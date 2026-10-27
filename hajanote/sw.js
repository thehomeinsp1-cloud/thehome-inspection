// 자동 생성 파일 (tools/web-sw.py) — 직접 고치지 마세요
const CACHE = 'hajanote-9508951e9bb4';
const FILES = ["./apple-touch-icon.png", "./assets/code-KaFSeAJS.js", "./assets/commonjs-dynamic-modules-TDtrdbi3.js", "./assets/exceljs.min-CEUqWbz_.js", "./assets/html2canvas.esm-Dw6mdHwC.js", "./assets/index-1uC9gkuq.css", "./assets/index-B4rQOJ8A.js", "./assets/index-BE9Tavo5.js", "./assets/index-CQ5CwpZn.js", "./assets/index-Cl50C6M1.js", "./assets/index-DcfKhKMS.js", "./assets/index.es-BQQdnlLz.js", "./assets/jspdf.es.min-cngexHY5.js", "./assets/jszip.min-Snrnh1nP.js", "./assets/purify.es-C8T5ouKw.js", "./assets/web-CBwotKl7.js", "./assets/web-CtxGhVoV.js", "./assets/web-F0t1XiB8.js", "./fonts/OFL-WantedSans.txt", "./fonts/WantedSansVariable.woff2", "./icon-192.png", "./icon-512.png", "./index.html", "./manifest.webmanifest"];

self.addEventListener('install', (e) => {
  // cache:'reload' — 브라우저 HTTP 캐시의 옛 index.html이 새 캐시에 들어가 흰 화면이 되는 것을 막는다 (검수 P-2)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...FILES].map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  // 바로 전 버전 캐시 하나는 남긴다 — 이미 열려 있던 옛 화면이 신호 없는 곳에서 PDF·엑셀 파일을 찾을 수 있게 (검수 P-3·D-7)
  e.waitUntil(caches.keys().then((ks) => { const old = ks.filter((k) => k.startsWith('hajanote-') && k !== CACHE); old.pop(); return Promise.all(old.map((k) => caches.delete(k))); }).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // 가입 정보 전송 등 바깥 주소는 건드리지 않음
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r).catch(() => (r.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
