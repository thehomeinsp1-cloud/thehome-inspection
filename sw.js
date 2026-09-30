/* ==================== 더홈점검 Service Worker v2 ====================
 * 전략:
 *  - 페이지(내비게이션): 네트워크 우선 → 배포 즉시 반영.
 *    각 페이지를 자기 주소로 캐시하고, 오프라인 시 그 페이지의 캐시를 보여줌
 *    (캐시가 없을 때 첫 화면 주소만 index.html로 대체)
 *  - CDN 라이브러리(버전 고정): 캐시 우선 → 오프라인에서도 PDF/엑셀 생성 가능
 *  - Google 시트/로그인/Apps Script: 캐시하지 않음 (항상 실시간)
 * 업데이트: 이 파일이 1바이트라도 바뀌면 브라우저가 새 SW로 교체함.
 *           캐시 구조 변경 시 CACHE_VERSION 숫자를 올릴 것.
 * =================================================================== */
// v2: v1이 모든 페이지를 './index.html'에 덮어써 오염된 캐시를 activate에서 지우기 위해 올림
const CACHE_VERSION = 'ths-cache-v2';

const LIB_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js'
];

// 캐시 금지 호스트 (실시간 데이터/인증)
const BYPASS_HOSTS = [
  'docs.google.com',        // 직원 CSV
  'script.google.com',      // Apps Script
  'script.googleusercontent.com',
  'accounts.google.com',
  'oauth2.googleapis.com',
  'www.googleapis.com',
  'apis.google.com'
];

// 앱 첫 화면 주소 (오프라인인데 그 주소의 캐시가 없을 때만 index.html로 대체)
const SCOPE_PATH = new URL('./', self.location).pathname;
const APP_SHELL_PATHS = [SCOPE_PATH, SCOPE_PATH + 'index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // 앱 셸: 실패해도 설치는 진행 (개별 add로 처리)
    try { await cache.add(new Request('./index.html', { cache: 'no-store' })); } catch (e) {}
    for (const url of LIB_URLS) {
      try { await cache.add(new Request(url, { mode: 'cors' })); } catch (e) {}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // POST 등은 그대로 통과

  const url = new URL(req.url);

  // 실시간 데이터/인증은 SW 개입 없이 통과
  if (BYPASS_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  // 1) 페이지 진입(내비게이션): 네트워크 우선, 오프라인 시 그 페이지의 캐시
  if (req.mode === 'navigate') {
    const key = url.origin + url.pathname; // ?code= 같은 쿼리는 캐시 키에서 뺌 (oauth-callback 등)
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(key, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await cache.match(key);
        if (cached) return cached;
        if (APP_SHELL_PATHS.includes(url.pathname)) {
          const shell = await cache.match('./index.html');
          if (shell) return shell;
        }
        return Response.error();
      }
    })());
    return;
  }

  // 2) CDN 라이브러리/폰트: 캐시 우선, 없으면 네트워크 후 캐시
  const isCdn = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com']
    .includes(url.hostname);
  if (isCdn) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (e) {
        return Response.error();
      }
    })());
    return;
  }

  // 3) 동일 출처 기타 GET: 네트워크 우선, 오프라인 시 캐시
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })());
  }
  // 그 외 외부 요청은 SW 개입 없이 기본 동작
});
