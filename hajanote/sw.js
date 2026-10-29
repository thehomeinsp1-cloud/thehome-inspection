// 자동 생성 파일 (tools/web-sw.py) — 직접 고치지 마세요
const CACHE = 'hajanote-fe5f6bb3f30c';
const FILES = ["./apple-touch-icon.png", "./assets/code-KaFSeAJS.js", "./assets/commonjs-dynamic-modules-TDtrdbi3.js", "./assets/exceljs.min-CyId6c_u.js", "./assets/feedback-A4gglaYR.js", "./assets/html2canvas.esm-Dw6mdHwC.js", "./assets/index-B45OUufe.js", "./assets/index-B_udwyPw.js", "./assets/index-Bpk5j7Wz.js", "./assets/index-Cl50C6M1.js", "./assets/index-D06kWB34.css", "./assets/index-D5VIzxcu.js", "./assets/index.es-DKSkuEXq.js", "./assets/jspdf.es.min-CLaXlDBR.js", "./assets/jszip.min-BDadI8PW.js", "./assets/purify.es-C8T5ouKw.js", "./assets/web-CBwotKl7.js", "./assets/web-CE1Dtyzv.js", "./assets/web-F0t1XiB8.js", "./fonts/OFL-WantedSans.txt", "./fonts/WantedSansVariable.woff2", "./icon-192.png", "./icon-512.png", "./index.html", "./manifest.webmanifest", "./privacy.html"];

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
  // 화면(index.html)은 인터넷 먼저 — 새 버전이 첫 실행에 바로 보이게. 4초 안에 안 오거나 오프라인이면 저장해 둔 것
  // (예전엔 caches.match가 남겨 둔 옛 캐시를 먼저 찾아 늘 한 버전 전 화면이 떴다, 2026-10-27 대표님 폰)
  const own = caches.open(CACHE).then((c) => c.match(r.mode === 'navigate' ? './' : r, { ignoreSearch: true }));
  if (r.mode === 'navigate') {
    const net = fetch(r.url, { cache: 'no-cache' }).then((res) => { if (!res.ok) throw res; return res; });   // 받아 온 화면은 캐시에 넣지 않는다: 옛 캐시에 새 화면이 들어가면 오프라인 때 새 파일을 못 찾아 흰 화면 (검수 2차 S-2)
    const late = new Promise((ok) => setTimeout(ok, 4000)).then(() => own).then((hit) => hit || net);
    e.respondWith(Promise.race([net, late]).catch(() => own.then((hit) => hit || Response.error())));
    return;
  }
  // 나머지(이름에 내용 지문이 붙은 파일)는 이번 버전 캐시 → 바로 전 버전 캐시 → 인터넷
  e.respondWith(own.then((hit) => hit || caches.match(r, { ignoreSearch: true })).then((hit) => hit || fetch(r)));
});
