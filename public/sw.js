import { precacheAndRoute } from 'workbox-precaching';

// self.__WB_MANIFEST is injected by the build process
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('sync', (event) => {
  if (event.tag === 'webdav-sync') {
    event.waitUntil(syncWebdavData());
  }
});

async function syncWebdavData() {
  console.log('Service Worker: Syncing WebDAV data...');
  // 在这里，我们无法直接访问主线程的 useStore
  // 我们需要一种机制来触发主线程的同步逻辑
  // 一种方法是使用 client.postMessage 通知所有客户端
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_WEBDAV' });
  });
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});