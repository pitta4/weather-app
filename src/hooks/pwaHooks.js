import { useState, useEffect, useRef, useCallback } from 'react';

// Hook per gestire l'installazione PWA
export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Controlla se l'app è già installata
    const checkIfInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const webAppCapable = window.navigator.standalone === true;
      setIsStandalone(standalone || webAppCapable);
      setIsInstalled(standalone || webAppCapable);
    };

    checkIfInstalled();

    // Listener per l'evento di installazione
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Listener per quando l'app viene installata
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      const { outcome } = await result.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting PWA install:', error);
      return false;
    }
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall
  };
};

// Hook per Service Worker
export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setRegistration(reg);
      setIsRegistered(true);
      workerRef.current = reg;

      // Controlla aggiornamenti
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        setIsUpdating(true);

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
            setIsUpdating(false);
          }
        });
      });

      // Controlla aggiornamenti periodicamente
      setInterval(() => {
        reg.update();
      }, 30000); // Ogni 30 secondi

      console.log('✅ Service Worker registered successfully');
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = useCallback(() => {
    if (workerRef.current?.waiting) {
      workerRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      window.location.reload();
    }
  }, []);

  const sendMessage = useCallback((message) => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve(null);
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      if (workerRef.current.active) {
        workerRef.current.active.postMessage(message, [messageChannel.port2]);
      }
    });
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await sendMessage({ type: 'CLEAR_CACHE' });
      console.log('✅ Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      return false;
    }
  }, [sendMessage]);

  const cacheWeatherData = useCallback(async (data) => {
    try {
      await sendMessage({ 
        type: 'CACHE_WEATHER_DATA', 
        payload: data 
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to cache weather data:', error);
      return false;
    }
  }, [sendMessage]);

  return {
    isRegistered,
    isUpdating,
    updateAvailable,
    updateServiceWorker,
    clearCache,
    cacheWeatherData,
    sendMessage
  };
};

// Hook per notifiche push
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        checkExistingSubscription();
      }
    };

    checkSupport();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      // VAPID public key - sostituire con la propria
      const vapidPublicKey = 'BHjHKRzLYb5Y1pCjxQjRBBJ8vE4gH9wFCGPwKtN7oBpP0b8KrV2S3CdN4c1Z9wXcFGvnX7aBbNcLsQ6tPd4R';
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Invia subscription al server
      await sendSubscriptionToServer(pushSubscription);

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }, [isSupported, permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      
      setSubscription(null);
      setIsSubscribed(false);
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription]);

  const sendTestNotification = useCallback(async (title, options = {}) => {
    if (!isSupported || permission !== 'granted') return false;

    try {
      await new Notification(title, {
        icon: '/pwa-icons/icon-192x192.png',
        badge: '/pwa-icons/badge-72x72.png',
        ...options
      });
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [isSupported, permission]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};

// Hook per modalità offline
export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
        // Trigger sync quando torniamo online
        triggerBackgroundSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const triggerBackgroundSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('weather-update');
        console.log('🔄 Background sync scheduled');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }, []);

  return {
    isOnline,
    wasOffline,
    triggerBackgroundSync
  };
};

// Hook per gestire shortcut PWA
export const usePWAShortcuts = () => {
  const [activeShortcut, setActiveShortcut] = useState(null);

  useEffect(() => {
    // Controlla se l'app è stata aperta tramite shortcut
    const urlParams = new URLSearchParams(window.location.search);
    const shortcut = urlParams.get('shortcut');
    
    if (shortcut) {
      setActiveShortcut(shortcut);
      
      // Rimuovi il parametro dall'URL dopo averlo processato
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleShortcut = useCallback((shortcutType) => {
    setActiveShortcut(shortcutType);
    
    // Trigger azioni specifiche per shortcut
    switch (shortcutType) {
      case 'current':
        // Mostra meteo corrente
        break;
      case 'forecast':
        // Mostra previsioni
        break;
      case 'favorites':
        // Mostra preferiti
        break;
      default:
        break;
    }
  }, []);

  return {
    activeShortcut,
    handleShortcut
  };
};

// === UTILITY FUNCTIONS ===

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function sendSubscriptionToServer(subscription) {
  // Implementa l'invio della subscription al tuo server
  try {
    const response = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
    
    console.log('✅ Subscription sent to server');
  } catch (error) {
    console.error('❌ Failed to send subscription to server:', error);
  }
}

async function removeSubscriptionFromServer(subscription) {
  // Implementa la rimozione della subscription dal server
  try {
    const response = await fetch('/api/push-unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }
    
    console.log('✅ Subscription removed from server');
  } catch (error) {
    console.error('❌ Failed to remove subscription from server:', error);
  }
}
