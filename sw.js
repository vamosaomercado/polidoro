/* Polidoro — service worker
   IMPORTANTE: a cada atualização do index.html, troque a versão abaixo
   (polidoro-v1.0.1, v1.0.2…). Assim os celulares recebem a versão nova. */
const VERSAO = 'polidoro-v1.3.1';
const CACHE_CDN = 'polidoro-cdn';

const ESSENCIAIS = ['./', './index.html', './manifest.json'];
const OPCIONAIS = [
  './instalar.html',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-192.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];
/* só arquivos estáticos de fora: fontes e bibliotecas do Firebase (nunca os dados) */
const CDN = ['https://fonts.googleapis.com/', 'https://fonts.gstatic.com/', 'https://www.gstatic.com/firebasejs/'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSAO);
    await c.addAll(ESSENCIAIS);
    await Promise.all(OPCIONAIS.map((u) => c.add(u).catch(() => {})));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n !== VERSAO && n !== CACHE_CDN).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);

  /* páginas: tenta a internet primeiro (pega atualizações); sem internet, usa a cópia guardada */
  if (r.mode === 'navigate' && u.origin === location.origin) {
    e.respondWith((async () => {
      try {
        const res = await fetch(r);
        if (res.ok) { const c = await caches.open(VERSAO); c.put(u.pathname.endsWith('/') ? './' : r, res.clone()); }
        return res;
      } catch (err) {
        return (await caches.match(r, { ignoreSearch: true })) || (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  /* arquivos do próprio site: cópia guardada primeiro */
  if (u.origin === location.origin) {
    e.respondWith((async () => {
      const m = await caches.match(r, { ignoreSearch: true });
      if (m) return m;
      const res = await fetch(r);
      if (res.ok) { const c = await caches.open(VERSAO); c.put(r, res.clone()); }
      return res;
    })());
    return;
  }

  /* fontes e Firebase SDK: usa a cópia e atualiza em segundo plano */
  if (CDN.some((p) => r.url.startsWith(p))) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE_CDN);
      const m = await c.match(r);
      const rede = fetch(r).then((res) => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => m);
      return m || rede;
    })());
  }
});
