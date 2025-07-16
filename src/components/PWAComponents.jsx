import React, { useState } from 'react';
import { Download, Wifi, WifiOff, Bell, BellOff, RefreshCw, Trash2, Smartphone } from 'lucide-react';
import { AccessibleButton, AccessibleModal, AccessibleAlert } from './AccessibilityComponents';

// Componente per il prompt di installazione PWA
export const PWAInstallPrompt = ({ 
  isVisible, 
  onInstall, 
  onDismiss,
  theme 
}) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 10000,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '12px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Smartphone size={24} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
            Installa Weather App
          </h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Accesso rapido, notifiche push e funzionalità offline
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <AccessibleButton
            onClick={onDismiss}
            variant="secondary"
            size="small"
            ariaLabel="Rifiuta installazione"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 16px'
            }}
          >
            Dopo
          </AccessibleButton>
          
          <AccessibleButton
            onClick={onInstall}
            variant="primary"
            size="small"
            ariaLabel="Installa app"
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '8px 16px',
              fontWeight: '600'
            }}
          >
            <Download size={16} />
            Installa
          </AccessibleButton>
        </div>
      </div>
    </div>
  );
};

// Componente per lo stato offline
export const OfflineIndicator = ({ 
  isOnline, 
  wasOffline,
  theme,
  onRetry 
}) => {
  if (isOnline && !wasOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: isOnline ? '#4caf50' : '#ff9800',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 10000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
      
      {isOnline ? (
        <span>✅ Connessione ripristinata</span>
      ) : (
        <>
          <span>📱 Modalità offline attiva</span>
          {onRetry && (
            <AccessibleButton
              onClick={onRetry}
              size="small"
              ariaLabel="Riprova connessione"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                marginLeft: '8px'
              }}
            >
              <RefreshCw size={12} />
            </AccessibleButton>
          )}
        </>
      )}
    </div>
  );
};

// Componente per aggiornamenti Service Worker
export const ServiceWorkerUpdate = ({ 
  isVisible, 
  onUpdate, 
  onDismiss,
  theme 
}) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#2196f3',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(33,150,243,0.3)',
      zIndex: 10000,
      maxWidth: '320px',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <RefreshCw size={20} />
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Aggiornamento disponibile
          </h4>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Nuove funzionalità e miglioramenti
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <AccessibleButton
          onClick={onDismiss}
          size="small"
          ariaLabel="Ignora aggiornamento"
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none'
          }}
        >
          Dopo
        </AccessibleButton>
        
        <AccessibleButton
          onClick={onUpdate}
          size="small"
          ariaLabel="Aggiorna ora"
          style={{
            background: 'white',
            color: '#2196f3',
            border: 'none',
            fontWeight: '600'
          }}
        >
          Aggiorna
        </AccessibleButton>
      </div>
    </div>
  );
};

// Componente per gestione notifiche push
export const PushNotificationManager = ({ 
  isSupported,
  isSubscribed,
  permission,
  onSubscribe,
  onUnsubscribe,
  onTest,
  theme 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await onSubscribe();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await onUnsubscribe();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    await onTest('Test Notifica', {
      body: 'Questa è una notifica di test per verificare il funzionamento',
      tag: 'test',
      requireInteraction: false
    });
  };

  if (!isSupported) {
    return (
      <div style={{
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <BellOff size={20} color="#999" />
          <span style={{ fontWeight: '500', color: '#666' }}>
            Notifiche non supportate
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          Il tuo browser non supporta le notifiche push
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      background: theme?.cardBg || '#fff',
      borderRadius: '12px',
      border: `1px solid ${theme?.cardBorder || '#ddd'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {isSubscribed ? <Bell size={20} color="#4caf50" /> : <BellOff size={20} color="#999" />}
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Notifiche Push
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {isSubscribed 
              ? 'Riceverai allerte meteo importanti' 
              : 'Abilita per ricevere allerte meteo'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {!isSubscribed ? (
          <AccessibleButton
            onClick={handleSubscribe}
            loading={isLoading}
            disabled={permission === 'denied'}
            variant="primary"
            size="small"
            ariaLabel="Abilita notifiche push"
          >
            <Bell size={16} />
            {permission === 'denied' ? 'Bloccate dal browser' : 'Abilita notifiche'}
          </AccessibleButton>
        ) : (
          <>
            <AccessibleButton
              onClick={handleTest}
              variant="secondary"
              size="small"
              ariaLabel="Invia notifica di test"
            >
              Test
            </AccessibleButton>
            
            <AccessibleButton
              onClick={handleUnsubscribe}
              loading={isLoading}
              variant="danger"
              size="small"
              ariaLabel="Disabilita notifiche push"
            >
              <BellOff size={16} />
              Disabilita
            </AccessibleButton>
          </>
        )}
      </div>

      {permission === 'denied' && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#856404'
        }}>
          💡 Per riabilitare le notifiche, vai nelle impostazioni del browser e consenti le notifiche per questo sito
        </div>
      )}
    </div>
  );
};

// Modal per impostazioni PWA
export const PWASettingsModal = ({ 
  isOpen, 
  onClose,
  pwaState,
  swState,
  pushState,
  theme,
  onClearCache,
  onInstall,
  onSubscribeNotifications,
  onUnsubscribeNotifications,
  onTestNotification
}) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await onClearCache();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Impostazioni PWA"
      size="medium"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Stato installazione */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
            📱 Installazione App
          </h3>
          
          <div style={{
            padding: '16px',
            background: pwaState.isInstalled ? '#e8f5e8' : '#f8f9fa',
            border: `1px solid ${pwaState.isInstalled ? '#4caf50' : '#ddd'}`,
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: pwaState.isInstalled ? '#4caf50' : '#999'
              }} />
              <span style={{ fontWeight: '500' }}>
                {pwaState.isInstalled ? 'App installata' : 'App non installata'}
              </span>
            </div>
            
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
              {pwaState.isInstalled 
                ? 'L\'app è installata e può funzionare offline'
                : 'Installa l\'app per un accesso più rapido e funzionalità offline'}
            </p>

            {!pwaState.isInstalled && pwaState.isInstallable && (
              <AccessibleButton
                onClick={onInstall}
                variant="primary"
                size="small"
                ariaLabel="Installa applicazione"
              >
                <Download size={16} />
                Installa ora
              </AccessibleButton>
            )}
          </div>
        </div>

        {/* Service Worker */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
            ⚙️ Service Worker
          </h3>
          
          <div style={{
            padding: '16px',
            background: swState.isRegistered ? '#e8f5e8' : '#fff3cd',
            border: `1px solid ${swState.isRegistered ? '#4caf50' : '#ffeaa7'}`,
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: swState.isRegistered ? '#4caf50' : '#ff9800'
              }} />
              <span style={{ fontWeight: '500' }}>
                {swState.isRegistered ? 'Attivo' : 'Non registrato'}
              </span>
            </div>
            
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
              Gestisce cache, aggiornamenti e funzionalità offline
            </p>

            {swState.isRegistered && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <AccessibleButton
                  onClick={handleClearCache}
                  loading={isClearing}
                  variant="secondary"
                  size="small"
                  ariaLabel="Svuota cache applicazione"
                >
                  <Trash2 size={16} />
                  Svuota cache
                </AccessibleButton>

                {swState.updateAvailable && (
                  <AccessibleButton
                    onClick={swState.updateServiceWorker}
                    variant="primary"
                    size="small"
                    ariaLabel="Aggiorna service worker"
                  >
                    <RefreshCw size={16} />
                    Aggiorna
                  </AccessibleButton>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notifiche Push */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
            🔔 Notifiche Push
          </h3>
          
          <PushNotificationManager
            isSupported={pushState.isSupported}
            isSubscribed={pushState.isSubscribed}
            permission={pushState.permission}
            onSubscribe={onSubscribeNotifications}
            onUnsubscribe={onUnsubscribeNotifications}
            onTest={onTestNotification}
            theme={theme}
          />
        </div>

        {/* Informazioni generali */}
        <div style={{
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
            💡 Vantaggi della PWA
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Accesso rapido dalla home screen</li>
            <li>Funzionalità offline con cache intelligente</li>
            <li>Notifiche push per allerte meteo</li>
            <li>Aggiornamenti automatici in background</li>
            <li>Esperienza app nativa nel browser</li>
          </ul>
        </div>
      </div>
    </AccessibleModal>
  );
};

// CSS per animazioni PWA
export const PWAStyles = () => (
  <style jsx global>{`
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* PWA display mode styles */
    @media (display-mode: standalone) {
      body {
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }
    }

    /* iOS Safari PWA styles */
    @supports (-webkit-touch-callout: none) {
      .pwa-ios-padding {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    }
  `}</style>
);
