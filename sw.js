/* اضرب الأشرار: يحفظ ملفات اللعبة ليعمل بلا إنترنت بعد أول زيارة.
   الصفحة: من الشبكة أولًا (تصل التحديثات فورًا) ثم من النسخة المحفوظة عند انقطاع الاتصال.
   الصور والخطوط: من النسخة المحفوظة أولًا بلا أي طلب في الزيارات التالية.
   عند تغيير أي صورة غيّر رقم الإصدار في CACHE حتى يحصل اللاعبون على الجديدة. */
const CACHE = 'hitmouse-v1';
const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'images/bg.webp',
  'images/board.webp',
  'images/logo.webp',
  'images/villains.webp',
  'images/cat-full.webp',
  'images/bunny-full.webp',
  'images/hammer.webp',
  'images/mouse.webp',
  'images/weasel.webp',
  'images/cat.webp',
  'images/bunny.webp',
  'images/bomb.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'no-cache' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(isFont ? new Request(req.url, { mode: 'cors', credentials: 'omit' }) : req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
