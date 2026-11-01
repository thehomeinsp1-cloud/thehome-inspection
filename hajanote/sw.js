// 하자노트는 hajanote.haechium.com으로 이사 (2026-11-02) — 예전에 설치된 앱을 스스로 지우고 이사 안내를 띄운다.
// 같은 주소의 직원용 앱 캐시는 건드리지 않게 'hajanote-' 캐시만 지운다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('hajanote-')) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
})()));
