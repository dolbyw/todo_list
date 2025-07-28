import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim, skipWaiting } from 'workbox-core';

// 立即激活新的Service Worker
skipWaiting();
clientsClaim();

// 清理过期缓存
cleanupOutdatedCaches();

// self.__WB_MANIFEST is injected by the build process
precacheAndRoute(self.__WB_MANIFEST || []);

// 添加fetch事件处理器 - PWA安装的必需条件
self.addEventListener('fetch', (event) => {
  // 跳过非HTTP(S)请求
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // 对于导航请求，返回缓存的页面或网络请求
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).catch(() => {
            // 如果离线且没有缓存，返回离线页面
            return caches.match('/') || new Response('离线模式', {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        })
    );
  }
  // 对于其他资源请求，使用网络优先策略（更适合开发环境）
  else {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 克隆响应以便缓存
          const responseClone = response.clone();
          if (response.status === 200 && event.request.method === 'GET') {
            caches.open('runtime-cache').then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败时使用缓存
          return caches.match(event.request);
        })
    );
  }
});

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