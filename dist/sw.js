// Service Worker per Weather App 10.0
const CACHE_NAME = 'weather-app-v10.0.0';
const STATIC_CACHE = 'weather-static-v10.0.0';
const API_CACHE = 'weather-api-v10.0.0';
const IMAGE_CACHE = 'weather-images-v10.0.0';

// Risorse da cachare immediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  // Verranno aggiunte automaticamente durante il build
];

// API endpoints da cachare
const API_ENDPOINTS = [
  'https://api.openweathermap.org/data/2.5/',
  'https://api.openweathermap.org/data/3.0/'
];

// Strategie di cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Configurazione cache per tipo di risorsa
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 giorni
    maxEntries: 100
  },
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 10 * 60 * 1000, // 10 minuti
    maxEntries: 50
  },
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
    maxEntries: 200
  }
};

// Installa Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache delle risorse statiche
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pre-cache dati meteo per Milano (default)
      cacheDefaultWeatherData()
    ]).then(() => {
      console.log('✅ Service Worker: Installed successfully');
      // Forza l'attivazione immediata
      return self.skipWaiting();
    })
  );
});

// Attiva Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Pulisci vecchie cache
      cleanupOldCaches(),
      
      // Prendi controllo di tutte le schede
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activated successfully');
    })
  );
});

// Gestisci richieste di rete
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora richieste non-http
  if (!url.protocol.startsWith('http')) return;
  
  // Determina la strategia di cache
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Gestisci messaggi dal main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CACHE_WEATHER_DATA':
      cacheWeatherData(payload);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHED_CITIES':
      getCachedCities().then((cities) => {
        event.ports[0].postMessage({ cities });
      });
      break;
  }
});

// Gestisci notifiche push
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions || [
      {
        action: 'open',
        title: 'Apri App',
        icon: '/pwa-icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Ignora',
        icon: '/pwa-icons/action-dismiss.png'
      }
    ],
    tag: data.tag || 'weather-update',
    renotify: true,
    requireInteraction: data.urgent || false,
    silent: false,
    vibrate: data.urgent ? [200, 100, 200] : [100, 50, 100]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestisci click su notifiche
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  const { action, data } = event;
  
  switch (action) {
    case 'open':
      event.waitUntil(openApp(data?.url));
      break;
      
    case 'dismiss':
      // Notification già chiusa
      break;
      
    default:
      // Click sulla notificazione principale
      event.waitUntil(openApp(data?.url));
      break;
  }
});

// Gestisci sincronizzazione in background
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  switch (event.tag) {
    case 'weather-update':
      event.waitUntil(updateWeatherData());
      break;
      
    case 'cache-cleanup':
      event.waitUntil(cleanupExpiredCache());
      break;
  }
});

// === UTILITY FUNCTIONS ===

function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // API requests
  if (API_ENDPOINTS.some(endpoint => url.href.startsWith(endpoint))) {
    return CACHE_CONFIG.api.strategy;
  }
  
  // Images
  if (request.destination === 'image') {
    return CACHE_CONFIG.images.strategy;
  }
  
  // Static assets
  return CACHE_CONFIG.static.strategy;
}

async function handleRequest(request, strategy) {
  const cacheName = getCacheName(request);
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
      
    default:
      return networkFirst(request, cacheName);
  }
}

function getCacheName(request) {
  const url = new URL(request.url);
  
  if (API_ENDPOINTS.some(endpoint => url.href.startsWith(endpoint))) {
    return API_CACHE;
  }
  
  if (request.destination === 'image') {
    return IMAGE_CACHE;
  }
  
  return STATIC_CACHE;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Network failed, no cache available:', error);
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback per API meteo
    if (request.url.includes('openweathermap.org')) {
      return createOfflineWeatherResponse();
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Aggiorna in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(console.error);
  
  // Restituisci cache se disponibile, altrimenti aspetta la rete
  return cached || fetchPromise;
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(name => !currentCaches.includes(name))
      .map(name => {
        console.log('🗑️ Deleting old cache:', name);
        return caches.delete(name);
      })
  );
}

async function cleanupExpiredCache() {
  const caches = await self.caches.keys();
  
  for (const cacheName of caches) {
    const cache = await self.caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cacheDate = response.headers.get('sw-cache-date');
      
      if (cacheDate) {
        const age = Date.now() - parseInt(cacheDate);
        const maxAge = getCacheMaxAge(cacheName);
        
        if (age > maxAge) {
          await cache.delete(request);
          console.log('🗑️ Deleted expired cache entry:', request.url);
        }
      }
    }
  }
}

function getCacheMaxAge(cacheName) {
  if (cacheName === API_CACHE) return CACHE_CONFIG.api.maxAge;
  if (cacheName === IMAGE_CACHE) return CACHE_CONFIG.images.maxAge;
  return CACHE_CONFIG.static.maxAge;
}

async function cacheDefaultWeatherData() {
  try {
    const apiKey = 'd2a84776dc62d59050876f1ae7c124a6';
    const defaultCity = 'Milano';
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${apiKey}&units=metric&lang=it`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${defaultCity}&appid=${apiKey}&units=metric&lang=it`;
    
    const cache = await caches.open(API_CACHE);
    
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ]);
    
    if (weatherResponse.ok && forecastResponse.ok) {
      await Promise.all([
        cache.put(weatherUrl, weatherResponse),
        cache.put(forecastUrl, forecastResponse)
      ]);
      console.log('✅ Default weather data cached');
    }
  } catch (error) {
    console.warn('Failed to cache default weather data:', error);
  }
}

async function cacheWeatherData(data) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'sw-cache-date': Date.now().toString()
    }
  });
  
  await cache.put(`/offline-weather/${data.city}`, response);
}

function createOfflineWeatherResponse() {
  const offlineData = {
    name: 'Offline',
    weather: [{ description: 'Dati non disponibili offline' }],
    main: {
      temp: '--',
      humidity: '--',
      pressure: '--'
    },
    wind: {
      speed: '--'
    },
    visibility: '--'
  };
  
  return new Response(JSON.stringify(offlineData), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function openApp(url = '/') {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  // Se l'app è già aperta, portala in primo piano
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      return client.focus();
    }
  }
  
  // Altrimenti apri nuova finestra
  return self.clients.openWindow(url);
}

async function updateWeatherData() {
  // Aggiorna dati meteo in background
  const cachedCities = await getCachedCities();
  
  for (const city of cachedCities) {
    try {
      await updateCityWeather(city);
    } catch (error) {
      console.warn(`Failed to update weather for ${city}:`, error);
    }
  }
}

async function getCachedCities() {
  // Ottieni lista città dai dati cachati
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  const cities = requests
    .map(req => {
      const url = new URL(req.url);
      const cityMatch = url.searchParams.get('q');
      return cityMatch;
    })
    .filter(Boolean);
  
  return [...new Set(cities)]; // Rimuovi duplicati
}

async function updateCityWeather(city) {
  const apiKey = 'd2a84776dc62d59050876f1ae7c124a6';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=it`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put(url, response);
    }
  } catch (error) {
    console.warn(`Failed to update weather for ${city}:`, error);
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

console.log('🌦️ Weather App Service Worker loaded');
