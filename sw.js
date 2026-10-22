/* Offline edition cd840675fefd4409de05a2d0a4c4c8f183138757ed952147c96aa8a443e834f5. Generated from the complete build. */
const CACHE = "seked-cd840675fefd4409de05a2d0a4c4c8f183138757ed952147c96aa8a443e834f5";
const EDITION = "cd840675fefd4409de05a2d0a4c4c8f183138757ed952147c96aa8a443e834f5";
const BASE = "/seked/";
const FILES = ["/seked/assets/index-CFKdRvGt.css","/seked/assets/index-DA15Zk1Z.js","/seked/favicon.svg","/seked/fonts/Atkinson-OFL.txt","/seked/fonts/AtkinsonHyperlegibleNext.ttf","/seked/fonts/NotoSerif-OFL.txt","/seked/fonts/NotoSerif-Regular.ttf","/seked/index.html","/seked/sources/chace2-036.jpg","/seked/sources/chace2-037.jpg","/seked/sources/chace2-203.jpg","/seked/sources/chace2-204.jpg","/seked/sources/chace2-205.jpg","/seked/sources/chace2-206.jpg","/seked/sources/chace2-207.jpg","/seked/sources/chace2-208.jpg","/seked/sources/chace2-209.jpg","/seked/sources/chace2-210.jpg","/seked/sources/chace2-211.jpg","/seked/sources/chace2-212.jpg","/seked/sources/peet-100.jpg"];
const INTEGRITY = {"/seked/assets/index-CFKdRvGt.css":"sha256-vnUqvTiiBEx19W69wVo6z267S/ak62Df45Ob1vnUPa8=","/seked/assets/index-DA15Zk1Z.js":"sha256-IAnIRmqBZLsz6cOrDPqfNLtNlwTVIWcbNbknYI19GFs=","/seked/favicon.svg":"sha256-MuSrJv/qfyPBrREk3YvKBOjZQ2S6iE1jWEBwlx/sJtE=","/seked/fonts/Atkinson-OFL.txt":"sha256-rKakKFgJZdIpfRtxgELdQnwqlEPs47DQLXWOFh4MQDA=","/seked/fonts/AtkinsonHyperlegibleNext.ttf":"sha256-WkVdHPoJm2AatwdRu5Zz6P4YVNxFAMgOGiINDXXjF0U=","/seked/fonts/NotoSerif-OFL.txt":"sha256-zumJL58MyP6ILJ6VN+5qiWIdhu586vcLAuKyscJcBho=","/seked/fonts/NotoSerif-Regular.ttf":"sha256-VHPS5DvdAY7hJKSt26gJH9CimJSxIcu3QQI69lSWYrY=","/seked/index.html":"sha256-7cTafQEswk5h0Qw+P4N55bd18N70fpnUipx4p3s0X88=","/seked/sources/chace2-036.jpg":"sha256-DnUoh5+swIXD08/iK3St48ZZ7WgIAATi61wn/f2TvrE=","/seked/sources/chace2-037.jpg":"sha256-aynnCacET0dKHsWXqiOVsNjRhkYEqoesCjF/p6SZH0g=","/seked/sources/chace2-203.jpg":"sha256-xSpOlX8EJk+nW9HM3VJsLZ1xJ3d5Sv4z0qEKo0nA+ow=","/seked/sources/chace2-204.jpg":"sha256-zEwMdpfeFW0I1IXsNGxaBi0cA3vE2DgUwBPA1gXe7M4=","/seked/sources/chace2-205.jpg":"sha256-ygWWJ4uxM5pKL24HXJdikm+K6sMlWxp+4IcVMgN8IiY=","/seked/sources/chace2-206.jpg":"sha256-9mB6aL4wqGIWV/Mi5lFltf732nEQpSsAoHLStuJ7tAo=","/seked/sources/chace2-207.jpg":"sha256-iJ3uA6LWaxkHVEwi6WAQodnn95X7dtVl7r5hSsq7Iis=","/seked/sources/chace2-208.jpg":"sha256-T5Mv2AGlhQV9JZhIeZ0wlVP7rfCJSdB5Uq2scAyZLiI=","/seked/sources/chace2-209.jpg":"sha256-/sdL44qjOURwxiSO/LgW/lI4PiS5hqYdj3lj2V6SHZY=","/seked/sources/chace2-210.jpg":"sha256-0VWdeMq9VrC0mA9kRTp01dlREab+nd9oCLBdIMLzJy4=","/seked/sources/chace2-211.jpg":"sha256-34I5ZVXIoBBuzTCqt8gXLF8Vyjsb83rvZkb2PDEMYls=","/seked/sources/chace2-212.jpg":"sha256-03nfkYzVKDYDSNX59JkgRjnZLt/KxquKgL6hfcIsy4Y=","/seked/sources/peet-100.jpg":"sha256-2fMxCticQkABmoUh0plsqhy/61bqHVy8+B9Vs5XM88c="};
self.addEventListener("install", event => {
  // HTTP success does not establish edition identity. A stale entry page or
  // substituted scan must fail the complete install before this worker activates.
  const requests = FILES.map(url => new Request(url, { cache: "reload", integrity: INTEGRITY[url] }));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("seked-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SEKED_ACTIVATE") {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (event.data?.type !== "SEKED_INSPECT" || !event.ports[0]) return;
  // A late reply from a superseded worker must not recreate its deleted cache.
  event.waitUntil(Promise.all(FILES.map(file => caches.match(file, { cacheName: CACHE }))).then(saved => {
    event.ports[0].postMessage({ type: "SEKED_EDITION", edition: EDITION, complete: saved.every(Boolean) });
  }).catch(() => event.ports[0].postMessage({ type: "SEKED_EDITION", edition: EDITION, complete: false })));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    const page = url.pathname === BASE || url.pathname === BASE + "index.html" ? BASE + "index.html" : url.pathname;
    if (FILES.includes(page)) event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(page))));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
