import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { 
    Search, 
    MapPin, 
    Star, 
    Plus, 
    BarChart3, 
    AlertTriangle, 
    Map, 
    Palette, 
    Sun, 
    Moon, 
    Sunset,
    Waves,
    Thermometer,
    Wind,
    Eye,
    Droplets,
    Gauge,
    Navigation,
    Clock,
    Calendar,
    Sunrise as SunriseIcon,
    Compass,
    Activity,
    Heart,
    X,
    Settings,
    Volume2,
    VolumeX
} from 'lucide-react';
import weatherService from './weatherService';
import favoritesService from './favoritesService';
import themeService from './themeService';
import notificationService from './notificationService';
import { getThemeIcon } from './themeIcons';
import { useTouchGestures, useIsMobile, useScreenOrientation, useHapticFeedback } from './mobileHooks';
import { useAdvancedLoading, useAdvancedDebounce, useRetryLogic, useCacheWithTTL, useNetworkStatus } from './hooks/performanceHooks';
import { 
    useKeyboardNavigation, 
    useFocusManagement, 
    useScreenReader, 
    useAccessibilityPreferences,
    useSkipLinks 
} from './hooks/accessibilityHooks';
import { 
    SuspenseWrapper, 
    LazyWeatherCharts, 
    LazyWeatherMaps, 
    LazyWeatherAlerts,
    useComponentPreloader 
} from './components/LazyLoading';
import { 
    WeatherCardSkeleton, 
    HourlyForecastSkeleton, 
    ChartsSkeleton, 
    AlertsSkeleton,
    SkeletonStyles 
} from './components/SkeletonLoader';
import {
    SkipLinks,
    AccessibleButton,
    AccessibleInput,
    AccessibleModal,
    AccessibleAlert,
    AccessibilityStyles
} from './components/AccessibilityComponents';
import { 
    usePWAInstall, 
    useServiceWorker, 
    usePushNotifications, 
    useOfflineMode 
} from './hooks/pwaHooks';
import { 
    PWAInstallPrompt, 
    OfflineIndicator, 
    ServiceWorkerUpdate, 
    PWASettingsModal,
    PWAStyles 
} from './components/PWAComponents';

import API_CONFIG from './config.js';

const WeatherApp = memo(() => {
    // Performance hooks
    const { 
        isLoading, 
        loadingProgress, 
        loadingMessage, 
        startLoading, 
        updateProgress, 
        finishLoading,
        setLoadingError 
    } = useAdvancedLoading();
    
    const { executeWithRetry, isRetrying, retryCount } = useRetryLogic(
        async (city) => {
            return await Promise.all([
                weatherService.getCurrentWeather(city),
                weatherService.getForecast(city),
                weatherService.getHourlyForecast(city)
            ]);
        },
        3,
        1000
    );
    
    const { isOnline, connectionType } = useNetworkStatus();
    const { preloadAll } = useComponentPreloader();
    
    // Accessibility hooks
    const { 
        announce, 
        announceWeatherUpdate, 
        announceError, 
        announceLoading 
    } = useScreenReader();
    
    const { preferences, updatePreference } = useAccessibilityPreferences();
    const { saveFocus, restoreFocus, setFocus, getFocusableElements } = useFocusManagement();
    
    // Skip links per navigazione rapida
    const skipSections = [
        { id: 'main-weather', label: 'Vai al meteo principale' },
        { id: 'controls', label: 'Vai ai controlli' },
        { id: 'forecast', label: 'Vai alle previsioni' },
        { id: 'charts', label: 'Vai ai grafici' }
    ];
    const { skipLinksRef, isVisible: skipLinksVisible, skipToSection } = useSkipLinks(skipSections);
    
    // Cache per dati meteo con TTL di 10 minuti
    const { data: cachedWeather, setCachedData: setCachedWeather } = useCacheWithTTL(
        'weather-cache',
        null,
        600000
    );

    // Stati dell'applicazione
    const [currentWeather, setCurrentWeather] = useState(cachedWeather);
    const [forecast, setForecast] = useState([]);
    const [hourlyForecast, setHourlyForecast] = useState([]);
    const [searchCity, setSearchCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [showFavorites, setShowFavorites] = useState(false);
    const [favoritesWeather, setFavoritesWeather] = useState([]);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('light');
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [showCharts, setShowCharts] = useState(false);
    const [weatherWarnings, setWeatherWarnings] = useState([]);
    const [showAlerts, setShowAlerts] = useState(false);
    const [showMaps, setShowMaps] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);
    
    // Stati per accessibilità
    const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
    const [accessibilityAlert, setAccessibilityAlert] = useState(null);
    
    // PWA hooks
    const { 
        isInstallable, 
        isInstalled, 
        promptInstall, 
        dismissInstall,
        showInstallPrompt,
        installEvent 
    } = usePWAInstall();
    
    const { 
        isRegistered: swRegistered,
        updateAvailable,
        updateServiceWorker,
        isRegistering,
        error: swError
    } = useServiceWorker();
    
    const {
        isSupported: pushSupported,
        isSubscribed: pushSubscribed,
        permission: pushPermission,
        subscribe: subscribePush,
        unsubscribe: unsubscribePush,
        sendNotification: sendPushNotification
    } = usePushNotifications();
    
    const {
        isOnline: pwaOnline,
        wasOffline,
        triggerBackgroundSync,
        lastSyncTime
    } = useOfflineMode();
    
    // Stati PWA
    const [showPWASettings, setShowPWASettings] = useState(false);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

    // Mobile hooks per esperienza ottimizzata
    const isMobile = useIsMobile();
    const orientation = useScreenOrientation();
    const { lightTap, mediumTap, strongTap } = useHapticFeedback();
    
    // Touch gestures per navigazione swipe
    const handleSwipeLeft = () => {
        if (showFavorites) {
            setShowFavorites(false);
            lightTap();
        } else if (!showCharts && !showAlerts && !showMaps) {
            setShowCharts(true);
            mediumTap();
        }
    };
    
    const handleSwipeRight = () => {
        if (showCharts) {
            setShowCharts(false);
            lightTap();
        } else if (showAlerts) {
            setShowAlerts(false);
            lightTap();
        } else if (showMaps) {
            setShowMaps(false);
            lightTap();
        } else if (!showFavorites) {
            setShowFavorites(true);
            mediumTap();
        }
    };
    
    const touchGestures = useTouchGestures(handleSwipeLeft, handleSwipeRight, 80);

    // Carica tema salvato all'avvio
    useEffect(() => {
        const savedTheme = themeService.getCurrentTheme();
        setCurrentTheme(savedTheme);
    }, []);

    // Inizializza l'app con dati meteo all'avvio
    useEffect(() => {
        const initializeApp = async () => {
            console.log('🚀 Inizializzazione app...');
            
            try {
                // Piccolo delay per assicurarsi che tutti i hook siano pronti
                await new Promise(resolve => setTimeout(resolve, 100));

                // Preload componenti per performance
                preloadAll({
                    charts: () => import('./WeatherCharts'),
                    maps: () => import('./WeatherMaps'),
                    alerts: () => import('./WeatherAlerts')
                });
                console.log('✅ Componenti precaricati');

                // Carica dati meteo iniziali
                console.log('🌤️ Caricamento dati meteo iniziali...');
                await fetchWeatherData('Milano');
                console.log('✅ Dati meteo caricati');
                
            } catch (error) {
                console.error('❌ Errore inizializzazione:', error);
            }
        };

        initializeApp();
    }, []); // Rimuoviamo le dipendenze per evitare loop

    // Carica i preferiti all'avvio
    useEffect(() => {
        const savedFavorites = favoritesService.getFavorites();
        setFavorites(savedFavorites);
    }, []);

    // Carica meteo per i preferiti quando vengono mostrati
    useEffect(() => {
        if (showFavorites && favorites.length > 0) {
            loadFavoritesWeather();
        }
    }, [showFavorites, favorites]);

    // Controlla allerte meteo quando cambiano i dati
    useEffect(() => {
        if (currentWeather || forecast.length > 0) {
            checkWeatherAlerts();
        }
    }, [currentWeather, forecast]);

    // PWA Effects
    
    // Gestisce aggiornamenti Service Worker
    useEffect(() => {
        if (updateAvailable) {
            setShowUpdatePrompt(true);
            announce('Aggiornamento disponibile per l\'applicazione');
        }
    }, [updateAvailable, announce]);

    // Notifica errori Service Worker
    useEffect(() => {
        if (swError) {
            console.error('Service Worker Error:', swError);
            announceError('Errore durante l\'aggiornamento dell\'applicazione');
        }
    }, [swError, announceError]);

    // Gestisce cambi di stato connessione per PWA
    useEffect(() => {
        if (pwaOnline !== undefined) {
            if (!pwaOnline) {
                announce('Modalità offline attivata');
                showToast('📱 Modalità offline attiva', 'info');
            } else if (wasOffline) {
                announce('Connessione ripristinata');
                showToast('✅ Connessione ripristinata', 'success');
                
                // Trigger sync automatico quando torna online
                triggerBackgroundSync().catch(console.error);
            }
        }
    }, [pwaOnline, wasOffline, announce, triggerBackgroundSync]);

    // Auto-installa PWA su Chrome Android se già installata come bookmark
    useEffect(() => {
        if (isInstallable && window.matchMedia('(display-mode: browser)').matches) {
            // Solo su mobile e se l'utente ha mostrato interesse
            const hasInteracted = localStorage.getItem('pwa-interaction');
            if (hasInteracted && window.innerWidth <= 768) {
                setTimeout(() => {
                    if (showInstallPrompt) {
                        // Mostra prompt dopo 30 secondi di utilizzo
                    }
                }, 30000);
            }
        }
    }, [isInstallable, showInstallPrompt]);

    // Registra interazioni utente per installazione intelligente
    useEffect(() => {
        const registerInteraction = () => {
            localStorage.setItem('pwa-interaction', 'true');
            localStorage.setItem('pwa-last-visit', Date.now().toString());
        };

        // Registra dopo primo click/touch
        const handleFirstInteraction = () => {
            registerInteraction();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    // Ottieni configurazione tema corrente
    const theme = themeService.getThemeConfig(currentTheme);

    // Ottieni background dinamico animato
    const getBackgroundStyle = () => {
        if (currentWeather) {
            return themeService.getAnimatedBackground(currentTheme, currentWeather.temperature);
        }
        return theme.primary;
    };

    // Utility per applicare stili moderni
    const getModernCardStyle = (options = {}) => {
        return themeService.getCardStyles(currentTheme, {
            borderRadius: theme.borderRadius.lg,
            withShadow: true,
            ...options
        });
    };

    const getModernButtonStyle = (variant = 'primary', state = 'default') => {
        return themeService.getButtonStyles(currentTheme, variant, state);
    };

    // Debounced search per ottimizzare le ricerche
    const { debouncedValue: debouncedSearchCity } = useAdvancedDebounce(
        searchCity, 
        500, 
        { maxWait: 2000 }
    );

    // Funzioni principali ottimizzate
    const fetchWeatherData = useCallback(async (city = 'Milano') => {
        if (!isOnline) {
            setError('Connessione internet non disponibile');
            return;
        }

        startLoading('Caricamento dati meteo...');
        setError('');

        try {
            updateProgress(20, 'Recupero dati meteo...');
            
            // Usa executeWithRetry che ora gestisce tutte e 3 le chiamate API
            const [currentData, forecastData, hourlyData] = await executeWithRetry(city);

            updateProgress(80, 'Elaborazione dati...');

            setCurrentWeather(currentData);
            setCachedWeather(currentData); // Cache i dati
            setForecast(forecastData);
            setHourlyForecast(hourlyData);
            setShowFavorites(false);

            updateProgress(100, 'Completato!');
            finishLoading();
            
        } catch (err) {
            console.error('Errore nel caricamento:', err);
            setLoadingError(err.message || 'Errore nel caricamento dei dati meteo');
        }
    }, [isOnline, startLoading, updateProgress, finishLoading, setLoadingError, executeWithRetry, setCachedWeather]);

    const handleSearch = useCallback(async () => {
        if (debouncedSearchCity.trim()) {
            await fetchWeatherData(debouncedSearchCity.trim());
            setSearchCity('');
            setShowSuggestions(false);
        }
    }, [debouncedSearchCity, fetchWeatherData]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchCity(value);

        if (value.length > 2) {
            try {
                const suggestions = await weatherService.searchCities(value);
                setSearchSuggestions(suggestions);
                setShowSuggestions(suggestions.length > 0);
            } catch (error) {
                console.error('Errore ricerca suggerimenti:', error);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = async (suggestion) => {
        setSearchCity(suggestion.displayName);
        setShowSuggestions(false);
        await fetchWeatherData(suggestion.name);
        setSearchCity('');
    };

    // Funzioni di accessibilità
    const handleAccessibilityToggle = useCallback((setting, value) => {
        updatePreference(setting, value);
        
        const messages = {
            reduceMotion: value ? 'Animazioni ridotte attivate' : 'Animazioni complete riattivate',
            highContrast: value ? 'Alto contrasto attivato' : 'Contrasto normale ripristinato',
            largeText: value ? 'Testo ingrandito attivato' : 'Testo normale ripristinato',
            screenReaderMode: value ? 'Modalità screen reader attivata' : 'Modalità screen reader disattivata',
            keyboardNavigation: value ? 'Navigazione da tastiera attivata' : 'Navigazione da tastiera disattivata'
        };
        
        announce(messages[setting] || 'Impostazione modificata');
        
        // Mostra alert temporaneo
        setAccessibilityAlert({
            type: 'success',
            message: messages[setting],
            id: Date.now()
        });
        
        setTimeout(() => setAccessibilityAlert(null), 3000);
    }, [updatePreference, announce]);

    const announceWeatherChange = useCallback((weather) => {
        if (weather && preferences.screenReaderMode) {
            announceWeatherUpdate(weather);
        }
    }, [announceWeatherUpdate, preferences.screenReaderMode]);

    const handleError = useCallback((errorMessage) => {
        setError(errorMessage);
        if (preferences.screenReaderMode) {
            announceError(errorMessage);
        }
    }, [announceError, preferences.screenReaderMode]);

    const handleLoadingAnnouncement = useCallback((loading, message = '') => {
        if (preferences.screenReaderMode) {
            announceLoading(loading, message);
        }
    }, [announceLoading, preferences.screenReaderMode]);

    const getCurrentLocation = () => {
        setLoading(true);
        setError('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const [currentData, forecastData, hourlyData] = await Promise.all([
                            weatherService.getCurrentWeatherByCoords(latitude, longitude),
                            weatherService.getForecastByCoords(latitude, longitude),
                            weatherService.getHourlyForecastByCoords(latitude, longitude)
                        ]);

                        setCurrentWeather(currentData);
                        setForecast(forecastData);
                        setHourlyForecast(hourlyData);
                        setShowFavorites(false);
                        setShowCharts(false);
                        setShowAlerts(false);
                        setShowMaps(false);
                    } catch (err) {
                        setError('Errore nel caricamento dati per la tua posizione');
                        fetchWeatherData('Milano');
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error('Errore geolocalizzazione:', error);
                    setError('Impossibile ottenere la posizione. Usando Milano...');
                    fetchWeatherData('Milano');
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        } else {
            setError('Geolocalizzazione non supportata. Usando Milano...');
            fetchWeatherData('Milano');
        }
    };

    const toggleFavorite = () => {
        if (!currentWeather) return;

        const isFav = favoritesService.isFavorite(currentWeather.name);

        if (isFav) {
            const success = favoritesService.removeFavorite(currentWeather.name);
            if (success) {
                const updatedFavorites = favoritesService.getFavorites();
                setFavorites(updatedFavorites);
                showToast(`${currentWeather.name} rimossa dai preferiti`, '❌');
            }
        } else {
            const success = favoritesService.addFavorite({
                name: currentWeather.name,
                country: currentWeather.country,
                lat: currentWeather.lat,
                lon: currentWeather.lon
            });
            if (success) {
                const updatedFavorites = favoritesService.getFavorites();
                setFavorites(updatedFavorites);
                showToast(`${currentWeather.name} aggiunta ai preferiti!`, '⭐');
            } else {
                showToast(`${currentWeather.name} è già nei preferiti`, '⚠️');
            }
        }
    };

    const loadFavoritesWeather = async () => {
        if (favorites.length === 0) return;

        setLoading(true);
        try {
            const weatherData = await weatherService.getMultipleCitiesWeather(favorites);
            setFavoritesWeather(weatherData);
        } catch (error) {
            console.error('Errore caricamento meteo preferiti:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorites = () => {
        setShowFavorites(!showFavorites);
        if (!showFavorites) {
            setShowCharts(false);
            setShowAlerts(false);
            setShowMaps(false);
        }
        if (isMobile) lightTap();
    };

    const selectFavoriteCity = async (favorite) => {
        setShowFavorites(false);
        setLoading(true);
        try {
            const [currentData, forecastData, hourlyData] = await Promise.all([
                weatherService.getCurrentWeatherByCoords(favorite.lat, favorite.lon),
                weatherService.getForecastByCoords(favorite.lat, favorite.lon),
                weatherService.getHourlyForecastByCoords(favorite.lat, favorite.lon)
            ]);
            setCurrentWeather(currentData);
            setForecast(forecastData);
            setHourlyForecast(hourlyData);
            setShowCharts(false);
            setShowAlerts(false);
            setShowMaps(false);
        } catch (error) {
            setError('Errore nel caricamento dati per ' + favorite.name);
        } finally {
            setLoading(false);
        }
    };

    // Funzioni per gestione tema con feedback mobile
    const changeTheme = (themeName) => {
        setCurrentTheme(themeName);
        themeService.setTheme(themeName);
        setShowThemeSelector(false);
        if (isMobile) mediumTap();
        showToast(`Tema cambiato: ${themeService.getThemeConfig(themeName).display}`, '🎨');
    };

    // Funzioni per visualizzazione componenti con haptic feedback
    const toggleCharts = () => {
        if (forecast.length > 0) {
            setShowCharts(!showCharts);
            setShowFavorites(false);
            setShowAlerts(false);
            setShowMaps(false);
            if (isMobile) lightTap();
            showToast(showCharts ? 'Grafici nascosti' : 'Grafici visualizzati', '📊');
        } else {
            if (isMobile) strongTap();
            showToast('Cerca una città per vedere i grafici', '⚠️');
        }
    };

    const toggleMaps = () => {
        setShowMaps(!showMaps);
        setShowFavorites(false);
        setShowCharts(false);
        setShowAlerts(false);
        if (isMobile) lightTap();
        showToast(showMaps ? 'Mappe nascoste' : 'Mappe visualizzate', '🗺️');
    };

    // Funzioni per gestione allerte
    const checkWeatherAlerts = () => {
        const warnings = notificationService.analyzeWeatherConditions(currentWeather, forecast);
        setWeatherWarnings(warnings);

        // Mostra automaticamente le allerte se ci sono avvisi di pericolo
        const dangerWarnings = warnings.filter(w => w.level === 'danger');
        if (dangerWarnings.length > 0) {
            setShowAlerts(true);

            // Invia notifiche browser se abilitate
            if (notificationsEnabled) {
                dangerWarnings.forEach(warning => {
                    notificationService.showBrowserNotification(warning);
                });
            }
        }
    };

    const toggleAlerts = () => {
        if (weatherWarnings.length > 0) {
            setShowAlerts(!showAlerts);
            setShowFavorites(false);
            setShowCharts(false);
            setShowMaps(false);
            if (isMobile) lightTap();
        } else {
            if (isMobile) strongTap();
            showToast('Nessuna allerta meteo attiva', 'ℹ️');
        }
    };

    const dismissAlerts = () => {
        setShowAlerts(false);
        showToast('Allerte nascoste', '✅');
    };

    // Funzioni per gestione notifiche
    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const permission = await notificationService.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                showToast('Notifiche abilitate!', '🔔');
            } else {
                showToast('Permesso notifiche negato', '🔕');
            }
        } else {
            setNotificationsEnabled(false);
            showToast('Notifiche disabilitate', '🔕');
        }
    };

    // Funzioni PWA
    const handlePWAInstall = useCallback(async () => {
        try {
            const result = await promptInstall();
            if (result) {
                showToast('App installata con successo!', '📱');
                announce('Applicazione installata correttamente');
            }
        } catch (error) {
            console.error('Errore installazione PWA:', error);
            showToast('Errore durante l\'installazione', '❌');
            announceError('Errore durante l\'installazione dell\'applicazione');
        }
    }, [promptInstall, announce, announceError]);

    const handleServiceWorkerUpdate = useCallback(async () => {
        try {
            await updateServiceWorker();
            setShowUpdatePrompt(false);
            showToast('App aggiornata! Ricarica la pagina', '🔄');
            announce('Applicazione aggiornata');
        } catch (error) {
            console.error('Errore aggiornamento SW:', error);
            showToast('Errore durante l\'aggiornamento', '❌');
        }
    }, [updateServiceWorker, announce]);

    const handlePushSubscribe = useCallback(async () => {
        try {
            await subscribePush();
            showToast('Notifiche push abilitate!', '🔔');
            announce('Notifiche push abilitate');
        } catch (error) {
            console.error('Errore iscrizione push:', error);
            showToast('Errore abilitazione notifiche', '❌');
            announceError('Errore durante l\'abilitazione delle notifiche push');
        }
    }, [subscribePush, announce, announceError]);

    const handlePushUnsubscribe = useCallback(async () => {
        try {
            await unsubscribePush();
            showToast('Notifiche push disabilitate', '🔕');
            announce('Notifiche push disabilitate');
        } catch (error) {
            console.error('Errore rimozione iscrizione push:', error);
            showToast('Errore disabilitazione notifiche', '❌');
        }
    }, [unsubscribePush, announce]);

    const handleTestNotification = useCallback(async (title, options) => {
        try {
            await sendPushNotification(title, options);
            showToast('Notifica di test inviata!', '✅');
        } catch (error) {
            console.error('Errore notifica test:', error);
            showToast('Errore invio notifica test', '❌');
        }
    }, [sendPushNotification]);

    const handleClearCache = useCallback(async () => {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }
            
            // Cancella anche cache locale
            localStorage.removeItem('weather-cache');
            setCachedWeather(null);
            
            showToast('Cache svuotata con successo!', '🗑️');
            announce('Cache dell\'applicazione svuotata');
        } catch (error) {
            console.error('Errore pulizia cache:', error);
            showToast('Errore durante la pulizia cache', '❌');
        }
    }, [setCachedWeather, announce]);

    const handleRetryConnection = useCallback(async () => {
        if (!pwaOnline) {
            try {
                await triggerBackgroundSync();
                showToast('Tentativo di riconnessione...', '🔄');
            } catch (error) {
                console.error('Errore riconnessione:', error);
                showToast('Errore durante la riconnessione', '❌');
            }
        }
    }, [pwaOnline, triggerBackgroundSync]);

    // Funzioni di utilità con stili moderni
    const showToast = (message, icon) => {
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">${icon}</span>
                <span style="font-weight: 500;">${message}</span>
            </div>
        `;
        
        const cardStyles = getModernCardStyle({
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
        });
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${theme.cardBg};
            backdrop-filter: ${theme.backdropBlur};
            color: ${theme.textPrimary};
            padding: ${theme.spacing.md};
            border-radius: ${theme.borderRadius.md};
            border: 1px solid ${theme.cardBorder};
            box-shadow: ${theme.cardShadow};
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(0);
        `;

        // Aggiungi stili di animazione
        const style = document.createElement('style');
        style.textContent = `
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
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);

        // Animazione di uscita
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 3000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const getTemperatureColor = (temp) => {
        if (temp >= 30) return '#ff4444';
        if (temp >= 25) return '#ff8800';
        if (temp >= 20) return '#ffbb00';
        if (temp >= 15) return '#88dd00';
        if (temp >= 10) return '#00bbff';
        if (temp >= 5) return '#0088ff';
        return '#0044ff';
    };

    const getWindDirection = (degrees) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    };

    const getHoursForSelectedDay = () => {
        if (!hourlyForecast.length || !forecast.length) return [];

        const selectedDate = forecast[selectedDay]?.date;
        if (!selectedDate) return hourlyForecast.slice(0, 12);

        // Se è oggi, mostra le prossime 12 ore
        if (selectedDay === 0) {
            return hourlyForecast.slice(0, 12);
        }

        // Per altri giorni, filtra per data
        return hourlyForecast.filter(hour => {
            const hourDate = new Date(hour.datetime).toISOString().split('T')[0];
            return hourDate === selectedDate;
        }).slice(0, 12);
    };

    // Effetto per aggiungere animazioni CSS e media queries
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            @keyframes gradientShift {
                0% { background-size: 200% 200%; background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes slideInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            /* Responsive utilities */
            .mobile-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            @media (min-width: 640px) {
                .mobile-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }
            }
            
            @media (min-width: 1024px) {
                .mobile-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
            }
            
            /* Scrollbar styling */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }

            /* Mobile Touch Optimizations */
            @media (max-width: 768px) {
                /* Aumenta area di tocco per elementi interattivi */
                button, .clickable {
                    min-height: 48px !important;
                    min-width: 48px !important;
                }
                
                /* Ottimizza layout grid per mobile */
                .mobile-responsive-grid {
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                }
                
                /* Nasconde testo nei bottoni piccoli */
                .button-text {
                    display: none;
                }
                
                /* Migliora leggibilità su schermi piccoli */
                .search-container input {
                    font-size: 16px !important; /* Previene zoom automatico su iOS */
                }
            }
            
            @media (max-width: 480px) {
                /* Layout ultra-compatto per schermi molto piccoli */
                .mobile-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 12px !important;
                }
            }
            
            @media (orientation: landscape) and (max-height: 500px) {
                /* Ottimizzazioni per landscape su mobile */
                .mobile-landscape {
                    padding: 8px !important;
                }
            }
            
            /* Prevenzione zoom indesiderato */
            @media (max-width: 768px) {
                input, select, textarea {
                    font-size: 16px !important;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    // Effetto per geolocalizzazione all'avvio
    useEffect(() => {
        // Verifica se le API keys sono disponibili
        if (!API_CONFIG.API_KEY || API_CONFIG.API_KEY === 'your_api_key_here') {
            setError('Chiave API non configurata. Contatta l\'amministratore.');
            setLoading(false);
            return;
        }
        
        // Prova prima con geolocalizzazione, poi fallback su Milano
        const initializeApp = async () => {
            try {
                await getCurrentLocation();
            } catch (err) {
                console.log('Geolocalizzazione fallita, usando Milano come default');
                await fetchWeatherData('Milano');
            }
        };
        
        initializeApp();
    }, []);

    // Gestisci click fuori dal selettore tema per chiuderlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showThemeSelector && !event.target.closest('.theme-selector')) {
                setShowThemeSelector(false);
            }
            if (showSuggestions && !event.target.closest('.search-container')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showThemeSelector, showSuggestions]);

    const selectedDayHours = getHoursForSelectedDay();

    return (
        <div style={{
            minHeight: '100vh',
            background: getBackgroundStyle(),
            backgroundSize: '400% 400%',
            animation: preferences.reduceMotion ? 'none' : 'gradientShift 15s ease infinite',
            padding: 'clamp(12px, 3vw, 24px)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: preferences.reduceMotion ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            fontSize: preferences.largeText ? '18px' : '16px'
        }}>
            {/* Skip Links per accessibilità */}
            <SkipLinks 
                sections={skipSections} 
                isVisible={skipLinksVisible}
                ref={skipLinksRef}
            />
            
            {/* Accessibility Styles */}
            <AccessibilityStyles />
            
            {/* Alert di accessibilità */}
            {accessibilityAlert && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 10001
                }}>
                    <AccessibleAlert
                        type={accessibilityAlert.type}
                        onDismiss={() => setAccessibilityAlert(null)}
                    >
                        {accessibilityAlert.message}
                    </AccessibleAlert>
                </div>
            )}

            {/* Pattern geometrico decorativo */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: `
                    radial-gradient(circle at 25% 25%, ${theme.textAccent}22 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, ${theme.buttonBg}33 0%, transparent 50%),
                    linear-gradient(45deg, transparent 40%, ${theme.cardBorder}11 50%, transparent 60%)
                `,
                backgroundSize: '150px 150px, 200px 200px, 100px 100px',
                animation: 'float 20s ease-in-out infinite',
                pointerEvents: 'none'
            }} />
            
            <div 
                {...(isMobile ? touchGestures : {})}
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'grid',
                    gap: 'clamp(16px, 3vw, 24px)',
                    gridTemplateColumns: '1fr',
                    touchAction: 'pan-y', // Permette scroll verticale ma gestisce swipe orizzontali
                    '@media (min-width: 768px)': {
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
                    }
                }}>
                {/* Debug info per verificare le environment variables */}
                {(!API_CONFIG.API_KEY || API_CONFIG.API_KEY === 'your_api_key_here') && (
                    <div style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid red',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        color: 'red'
                    }}>
                        ⚠️ ERRORE: Chiave API non configurata. Verifica le environment variables in Vercel.
                    </div>
                )}
                
                {/* Header moderno con gradiente */}
                <div style={{ 
                    textAlign: 'center', 
                    marginBottom: theme.spacing.lg,
                    ...getModernCardStyle({
                        borderRadius: theme.borderRadius.xl,
                        padding: theme.spacing.lg
                    })
                }}>
                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: '800',
                        background: `linear-gradient(135deg, ${theme.textPrimary} 0%, ${theme.textAccent} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: theme.spacing.xs,
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        🌤️ MeteoApp Pro
                    </h1>
                    <p style={{ 
                        color: theme.textSecondary,
                        fontSize: '16px',
                        fontWeight: '400',
                        lineHeight: '1.5',
                        margin: 0
                    }}>
                        <span style={{ fontWeight: '600' }}>App meteo professionale</span> con previsioni 8 giorni e orarie • 
                        <span style={{ color: theme.textAccent }}> One Call API 3.0</span>
                    </p>
                </div>

                {/* Indicatore swipe per dispositivi mobili */}
                {isMobile && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: `${theme.cardBg}88`,
                        backdropFilter: 'blur(10px)',
                        borderRadius: theme.borderRadius.lg,
                        marginBottom: theme.spacing.sm,
                        border: `1px solid ${theme.cardBorder}55`,
                        animation: 'pulse 3s infinite'
                    }}>
                        <div style={{ color: theme.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>👈</span>
                            <span>Scorri per navigare</span>
                            <span>👉</span>
                        </div>
                    </div>
                )}

                {/* Search Bar con layout responsive */}
                <div style={{
                    ...getModernCardStyle({
                        borderRadius: theme.borderRadius.xl,
                        padding: 'clamp(16px, 3vw, 24px)'
                    }),
                    marginBottom: theme.spacing.md,
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Search input e bottoni */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                        alignItems: 'center'
                    }}>
                        <div className="search-container" style={{ flex: 1, position: 'relative' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search 
                                    size={20} 
                                    style={{ 
                                        position: 'absolute', 
                                        left: '12px', 
                                        color: theme.textSecondary,
                                        zIndex: 2,
                                        pointerEvents: 'none'
                                    }} 
                                />
                                <input
                                    type="text"
                                    placeholder="Cerca una città..."
                                    value={searchCity}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleKeyPress}
                                    onFocus={(e) => {
                                        if (searchCity.length > 2) setShowSuggestions(true);
                                        e.target.style.transform = 'translateY(-1px) scale(1.01)';
                                        e.target.style.boxShadow = `0 0 0 3px ${theme.textAccent}33`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{
                                        ...themeService.getInputStyles(currentTheme),
                                        width: '100%',
                                        fontSize: 'clamp(14px, 2.5vw, 16px)',
                                        fontWeight: '400',
                                        padding: 'clamp(12px, 2vw, 16px) clamp(12px, 2vw, 16px) clamp(12px, 2vw, 16px) 44px',
                                        borderRadius: theme.borderRadius.lg,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </div>

                            {/* Suggerimenti con design migliorato */}
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    ...getModernCardStyle({
                                        borderRadius: theme.borderRadius.md,
                                        padding: '0'
                                    }),
                                    marginTop: theme.spacing.xs,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 9999
                                }}>
                                    {searchSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectSuggestion(suggestion)}
                                            style={{
                                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                                cursor: 'pointer',
                                                color: theme.textPrimary,
                                                borderBottom: index < searchSuggestions.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: theme.spacing.sm,
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderRadius: index === 0 ? `${theme.borderRadius.md} ${theme.borderRadius.md} 0 0` :
                                                           index === searchSuggestions.length - 1 ? `0 0 ${theme.borderRadius.md} ${theme.borderRadius.md}` : '0'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = theme.buttonHover;
                                                e.target.style.transform = 'translateX(4px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'transparent';
                                                e.target.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            <MapPin size={16} style={{ color: theme.textAccent, flexShrink: 0 }} />
                                            <span>{suggestion.displayName}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Bottoni moderni con icone Lucide React */}
                        <button
                            onClick={handleSearch}
                            style={{
                                ...getModernButtonStyle('primary'),
                                padding: `clamp(${isMobile ? '12px' : '8px'}, 1.5vw, ${isMobile ? '16px' : '12px'}) clamp(16px, 3vw, 24px)`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing.xs,
                                fontWeight: '600',
                                minWidth: 'clamp(80px, 15vw, 100px)',
                                justifyContent: 'center',
                                fontSize: 'clamp(14px, 2.2vw, 16px)',
                                minHeight: isMobile ? '48px' : 'auto', // Area touch minima consigliata
                                touchAction: 'manipulation' // Disabilita zoom su tap
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = theme.buttonHover;
                                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                e.target.style.boxShadow = `0 4px 12px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = theme.buttonBg;
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                            onTouchStart={() => {
                                if (isMobile) lightTap();
                            }}
                        >
                            <Search size={18} />
                            <span className="button-text">Cerca</span>
                        </button>
                        <button
                            onClick={getCurrentLocation}
                            style={{
                                ...getModernButtonStyle('primary'),
                                padding: 'clamp(10px, 2vw, 12px)',
                                width: 'clamp(40px, 8vw, 48px)',
                                height: 'clamp(40px, 8vw, 48px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: theme.borderRadius.md
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = theme.buttonHover;
                                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                                e.target.style.boxShadow = `0 4px 12px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = theme.buttonBg;
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                            title="Usa la mia posizione"
                        >
                            <Navigation size={20} />
                        </button>
                    </div>

                    {/* Controlli principali ottimizzati per mobile */}
                    <div 
                        id="controls"
                        role="navigation"
                        aria-label="Controlli principali dell'applicazione"
                        style={{ 
                        display: 'grid',
                        gridTemplateColumns: isMobile && orientation === 'portrait' 
                            ? 'repeat(2, 1fr)' 
                            : 'repeat(auto-fit, minmax(clamp(120px, 20vw, 140px), 1fr))',
                        gap: isMobile ? 'clamp(12px, 2vw, 16px)' : 'clamp(8px, 1.5vw, 12px)',
                        marginBottom: theme.spacing.sm
                    }}>
                        <button
                            onClick={toggleFavorites}
                            style={{
                                ...getModernButtonStyle(showFavorites ? 'success' : 'primary'),
                                padding: `clamp(${isMobile ? '12px' : '8px'}, 1.5vw, ${isMobile ? '16px' : '12px'}) clamp(12px, 2.5vw, 16px)`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'clamp(4px, 1vw, 8px)',
                                justifyContent: 'center',
                                fontWeight: '500',
                                fontSize: 'clamp(13px, 2.2vw, 15px)',
                                minHeight: isMobile ? '52px' : 'auto',
                                touchAction: 'manipulation'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px) scale(1.02)';
                                e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                            onTouchStart={() => {
                                if (isMobile) lightTap();
                            }}
                        >
                            <Star size={18} fill={showFavorites ? 'currentColor' : 'none'} />
                            <span className="button-text">Preferiti</span>
                            <span style={{
                                background: theme.textAccent,
                                color: 'white',
                                borderRadius: '12px',
                                padding: '2px 6px',
                                fontSize: 'clamp(10px, 1.8vw, 11px)',
                                fontWeight: 'bold',
                                minWidth: '20px',
                                textAlign: 'center'
                            }}>
                                {favorites.length}
                            </span>
                        </button>

                        {currentWeather && (
                            <button
                                onClick={toggleFavorite}
                                style={{
                                    ...getModernButtonStyle(
                                        favoritesService.isFavorite(currentWeather.name) ? 'warning' : 'primary'
                                    ),
                                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                    justifyContent: 'center',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-1px) scale(1.02)';
                                    e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                {favoritesService.isFavorite(currentWeather.name) ? (
                                    <Heart size={18} fill="currentColor" />
                                ) : (
                                    <Plus size={18} />
                                )}
                                <span>
                                    {favoritesService.isFavorite(currentWeather.name) ? 'Rimuovi' : 'Aggiungi'}
                                </span>
                            </button>
                        )}

                        <button
                            onClick={toggleCharts}
                            style={{
                                ...getModernButtonStyle(showCharts ? 'success' : 'primary'),
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing.xs,
                                justifyContent: 'center',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <BarChart3 size={18} />
                            <span>Grafici</span>
                        </button>

                        <button
                            onClick={toggleMaps}
                            style={{
                                ...getModernButtonStyle(showMaps ? 'success' : 'primary'),
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing.xs,
                                justifyContent: 'center',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <Map size={18} />
                            <span>Mappe</span>
                        </button>

                        <button
                            onClick={toggleAlerts}
                            style={{
                                ...getModernButtonStyle(showAlerts ? 'success' : 'primary'),
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing.xs,
                                justifyContent: 'center',
                                fontWeight: '500',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <AlertTriangle size={18} />
                            <span>Allerte</span>
                            {weatherWarnings.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: weatherWarnings.some(w => w.level === 'danger') ? '#ff3b30' : '#ff9500',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    border: '2px solid white',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    {weatherWarnings.length}
                                </span>
                            )}
                        </button>

                        <div className="theme-selector" style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowThemeSelector(!showThemeSelector)}
                                style={{
                                    ...getModernButtonStyle(showThemeSelector ? 'success' : 'primary'),
                                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                    justifyContent: 'center',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{theme.icon}</span>
                                <span>Tema</span>
                            </button>

                            {showThemeSelector && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    marginTop: theme.spacing.xs,
                                    ...getModernCardStyle({
                                        borderRadius: theme.borderRadius.md,
                                        padding: theme.spacing.sm
                                    }),
                                    zIndex: 10000,
                                    minWidth: '200px',
                                    animation: 'float 0.3s ease-out'
                                }}>
                                    <div style={{
                                        color: theme.textSecondary,
                                        fontSize: '12px',
                                        marginBottom: theme.spacing.xs,
                                        textAlign: 'center',
                                        fontWeight: '500'
                                    }}>
                                        Scegli un tema
                                    </div>
                                    {themeService.getAllThemes().map((themeOption) => (
                                        <button
                                            key={themeOption.name}
                                            onClick={() => changeTheme(themeOption.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: theme.spacing.sm,
                                                width: '100%',
                                                padding: theme.spacing.sm,
                                                background: currentTheme === themeOption.name ? theme.buttonHover : 'transparent',
                                                border: currentTheme === themeOption.name ? `2px solid ${theme.textAccent}` : '2px solid transparent',
                                                borderRadius: theme.borderRadius.sm,
                                                color: theme.textPrimary,
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                marginBottom: theme.spacing.xs,
                                                textAlign: 'left',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentTheme !== themeOption.name) {
                                                    e.target.style.background = theme.buttonHover;
                                                    e.target.style.transform = 'translateX(4px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentTheme !== themeOption.name) {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.transform = 'translateX(0)';
                                                }
                                            }}
                                        >
                                            {getThemeIcon(themeOption.name, 20)}
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{themeOption.display}</div>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: theme.textTertiary,
                                                    marginTop: '2px'
                                                }}>
                                                    {themeOption.name === 'light' && 'Moderno e luminoso'}
                                                    {themeOption.name === 'dark' && 'Elegante e rilassante'}
                                                    {themeOption.name === 'sunset' && 'Caldo e accogliente'}
                                                    {themeOption.name === 'ocean' && 'Fresco e profondo'}
                                                </div>
                                            </div>
                                            {currentTheme === themeOption.name && (
                                                <div style={{
                                                    marginLeft: 'auto',
                                                    color: theme.textAccent,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <Activity size={16} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controlli notifiche moderni */}
                    <div style={{ 
                        display: 'flex', 
                        gap: theme.spacing.md, 
                        alignItems: 'center',
                        ...getModernCardStyle({
                            borderRadius: theme.borderRadius.md,
                            padding: theme.spacing.sm
                        }),
                        marginTop: theme.spacing.xs
                    }}>
                        <button
                            onClick={toggleNotifications}
                            style={{
                                ...getModernButtonStyle(notificationsEnabled ? 'success' : 'primary'),
                                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing.xs,
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = `0 2px 8px ${theme.textAccent}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>
                                {notificationsEnabled ? '🔔' : '🔕'}
                            </span>
                            <span>{notificationsEnabled ? 'Notifiche ON' : 'Notifiche OFF'}</span>
                        </button>

                        <div style={{
                            color: theme.textTertiary,
                            fontSize: '12px',
                            lineHeight: '1.4',
                            flex: 1
                        }}>
                            {notificationsEnabled
                                ? '✅ Riceverai allerte per condizioni pericolose'
                                : '💡 Abilita per ricevere allerte meteo in tempo reale'}
                        </div>
                    </div>

                    {/* Controlli accessibilità e PWA */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: theme.spacing.sm,
                        marginTop: theme.spacing.xs
                    }}>
                        {/* Accessibilità */}
                        <div style={{ 
                            display: 'flex', 
                            gap: theme.spacing.md, 
                            alignItems: 'center',
                            ...getModernCardStyle({
                                borderRadius: theme.borderRadius.md,
                                padding: theme.spacing.sm
                            })
                        }}>
                            <AccessibleButton
                                onClick={() => setShowAccessibilitySettings(true)}
                                variant="primary"
                                size="medium"
                                ariaLabel="Apri impostazioni di accessibilità"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                    fontSize: '13px'
                                }}
                            >
                                <Settings size={16} />
                                <span>Accessibilità</span>
                            </AccessibleButton>

                            <div style={{
                                color: theme.textTertiary,
                                fontSize: '12px',
                                lineHeight: '1.4',
                                flex: 1
                            }}>
                                🔧 Personalizza l'esperienza
                            </div>
                        </div>

                        {/* PWA Settings */}
                        <div style={{ 
                            display: 'flex', 
                            gap: theme.spacing.md, 
                            alignItems: 'center',
                            ...getModernCardStyle({
                                borderRadius: theme.borderRadius.md,
                                padding: theme.spacing.sm
                            })
                        }}>
                            <AccessibleButton
                                onClick={() => setShowPWASettings(true)}
                                variant="primary"
                                size="medium"
                                ariaLabel="Apri impostazioni app"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                    fontSize: '13px'
                                }}
                            >
                                📱
                                <span>App</span>
                            </AccessibleButton>

                            <div style={{
                                color: theme.textTertiary,
                                fontSize: '12px',
                                lineHeight: '1.4',
                                flex: 1
                            }}>
                                {isInstalled ? '✅ Installata' : '📲 Installa app'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{
                        background: theme.cardBg,
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center',
                        color: theme.textPrimary,
                        marginBottom: '20px',
                        border: `1px solid ${theme.cardBorder}`
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
                        <p>Caricamento dati meteo One Call API orari...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        background: theme.errorBg,
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '20px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        color: theme.textPrimary,
                        border: `1px solid ${theme.cardBorder}`
                    }}>
                        <p>❌ {error}</p>
                        <p style={{ fontSize: '14px', marginTop: '10px' }}>
                            Verifica che la città esista e riprova
                        </p>
                    </div>
                )}

                {/* Allerte Meteo */}
                {showAlerts && weatherWarnings.length > 0 && (
                    <SuspenseWrapper 
                        componentType="alerts"
                        fallback={<AlertsSkeleton />}
                    >
                        <LazyWeatherAlerts
                            warnings={weatherWarnings}
                            theme={theme}
                            onDismiss={dismissAlerts} 
                        />
                    </SuspenseWrapper>
                )}

                {/* Grafici Meteo */}
                {showCharts && forecast.length > 0 && !loading && (
                    <SuspenseWrapper 
                        componentType="charts"
                        fallback={<ChartsSkeleton />}
                    >
                        <LazyWeatherCharts
                            forecast={forecast}
                            currentWeather={currentWeather}
                            theme={theme} 
                        />
                    </SuspenseWrapper>
                )}

                {/* Mappe Meteo */}
                {showMaps && (
                    <SuspenseWrapper 
                        componentType="maps"
                        fallback={<div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px', color: theme.textPrimary }}>
                                🗺️ Caricamento mappe...
                            </div>
                            <div style={{ 
                                height: '400px', 
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ color: theme.textPrimary, opacity: 0.7 }}>
                                    Preparazione vista satellitare...
                                </div>
                            </div>
                        </div>}
                    >
                        <LazyWeatherMaps
                            currentWeather={currentWeather}
                            theme={theme} 
                        />
                    </SuspenseWrapper>
                )}

                {/* Città Preferite */}
                {showFavorites && (
                    <div style={{
                        background: theme.cardBg,
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: `1px solid ${theme.cardBorder}`
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: theme.textPrimary,
                            marginBottom: '20px'
                        }}>
                            ⭐ Le tue città preferite
                        </h3>

                        {favorites.length === 0 ? (
                            <p style={{ color: theme.textTertiary, textAlign: 'center' }}>
                                Nessuna città nei preferiti. Cerca una città e clicca "⭐ Aggiungi"
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {favoritesWeather.map((cityWeather, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectFavoriteCity(favorites.find(f => f.name === cityWeather.name))}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '15px',
                                            background: theme.buttonBg,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: `1px solid ${theme.cardBorder}`
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = theme.buttonHover}
                                        onMouseLeave={(e) => e.target.style.background = theme.buttonBg}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ fontSize: '24px' }}>{cityWeather.icon}</span>
                                            <div>
                                                <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
                                                    {cityWeather.name}
                                                </div>
                                                <div style={{ color: theme.textTertiary, fontSize: '14px' }}>
                                                    {cityWeather.description}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: theme.textPrimary, fontWeight: 'bold', fontSize: '18px' }}>
                                                {cityWeather.temperature}°
                                            </div>
                                            <div style={{ color: theme.textTertiary, fontSize: '12px' }}>
                                                Percepita {cityWeather.feels_like}°
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State con Skeleton */}
                {(isLoading || loading) && (
                    <div>
                        <WeatherCardSkeleton />
                        {loadingProgress > 0 && (
                            <div style={{
                                marginTop: '16px',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    color: theme.textPrimary
                                }}>
                                    <span style={{ fontSize: '14px' }}>{loadingMessage}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        {Math.round(loadingProgress)}%
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${loadingProgress}%`,
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                                        borderRadius: '3px',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                {isRetrying && (
                                    <div style={{
                                        marginTop: '8px',
                                        fontSize: '12px',
                                        color: theme.warning,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <Activity size={12} />
                                        Tentativo {retryCount} di 3...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Network Status Warning */}
                {!isOnline && (
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 193, 7, 0.1)',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#FF8F00'
                    }}>
                        <AlertTriangle size={20} />
                        <span>Connessione offline - Visualizzazione dati in cache</span>
                    </div>
                )}

                {/* HOMEPAGE PRINCIPALE - Layout 3B Meteo Style con 8 Giorni e Previsioni Orarie */}
                {currentWeather && !isLoading && !loading && !showFavorites && !showCharts && !showAlerts && !showMaps && (
                    <main 
                        id="main-weather"
                        role="main"
                        aria-label={`Meteo attuale per ${currentWeather.name}`}
                        style={{ display: 'grid', gap: '15px' }}
                    >

                        {/* Barra giorni 8 giorni - stile 3B Meteo */}
                        <div style={{
                            background: theme.cardBg,
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: `1px solid ${theme.cardBorder}`,
                            overflow: 'hidden'
                        }}>
                            {/* Header con indicatore giorni */}
                            <div style={{
                                padding: '8px 16px',
                                background: 'rgba(74, 144, 226, 0.1)',
                                borderBottom: `1px solid ${theme.cardBorder}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '14px' }}>📅</span>
                                    <span style={{
                                        color: theme.textPrimary,
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }}>
                                        Previsioni 8 Giorni - One Call API
                                    </span>
                                </div>
                                <div style={{
                                    color: theme.textSecondary,
                                    fontSize: '11px'
                                }}>
                                    {forecast.length} giorni • Dati precisi • Scorri →
                                </div>
                            </div>

                            {/* Scroll orizzontale giorni */}
                            <div style={{
                                display: 'flex',
                                overflowX: 'auto',
                                scrollbarWidth: 'thin',
                                scrollbarColor: `${theme.cardBorder} transparent`,
                                WebkitOverflowScrolling: 'touch'
                            }}>
                                {forecast.map((day, index) => {
                                    const isToday = index === 0;
                                    const isTomorrow = index === 1;
                                    const isSelected = index === selectedDay;
                                    const isPrecise = day.isPrecise;

                                    let dayName;
                                    if (isToday) {
                                        dayName = 'OGGI';
                                    } else if (isTomorrow) {
                                        dayName = 'DOMANI';
                                    } else {
                                        dayName = new Date(day.date).toLocaleDateString('it-IT', {
                                            weekday: 'short'
                                        }).toUpperCase();
                                    }

                                    const dayNum = new Date(day.date).getDate();
                                    const monthShort = new Date(day.date).toLocaleDateString('it-IT', {
                                        month: 'short'
                                    });

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedDay(index)}
                                            style={{
                                                minWidth: '95px',
                                                padding: '14px 8px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(74, 144, 226, 0.2)' : 'transparent',
                                                borderBottom: isSelected ? '3px solid #4A90E2' : '3px solid transparent',
                                                borderRight: index < forecast.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.target.style.background = 'rgba(74, 144, 226, 0.1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.target.style.background = 'transparent';
                                                }
                                            }}
                                        >
                                            {/* Indicatore precisione */}
                                            {isPrecise && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: 'rgba(76, 175, 80, 0.8)',
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    fontSize: '8px',
                                                    padding: '2px 4px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}

                                            {/* Nome giorno */}
                                            <div style={{
                                                color: isSelected ? '#4A90E2' : (isToday ? '#4CAF50' : theme.textSecondary),
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                marginBottom: '4px'
                                            }}>
                                                {dayName}
                                            </div>

                                            {/* Data */}
                                            <div style={{
                                                color: isSelected ? '#4A90E2' : theme.textPrimary,
                                                fontSize: '15px',
                                                fontWeight: 'bold',
                                                marginBottom: '2px'
                                            }}>
                                                {dayNum}
                                            </div>

                                            {/* Mese */}
                                            <div style={{
                                                color: theme.textTertiary,
                                                fontSize: '9px',
                                                marginBottom: '8px'
                                            }}>
                                                {monthShort}
                                            </div>

                                            {/* Icona meteo */}
                                            <div style={{
                                                fontSize: '18px',
                                                marginBottom: '6px'
                                            }}>
                                                {day.icon}
                                            </div>

                                            {/* Temperature */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: '3px',
                                                fontSize: '11px',
                                                marginBottom: '4px'
                                            }}>
                                                <span style={{
                                                    color: isSelected ? '#4A90E2' : theme.textPrimary,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {day.temp_max}°
                                                </span>
                                                <span style={{ color: theme.textTertiary }}>
                                                    {day.temp_min}°
                                                </span>
                                            </div>

                                            {/* Probabilità pioggia se > 20% */}
                                            {day.pop && day.pop > 20 && (
                                                <div style={{
                                                    color: '#4A90E2',
                                                    fontSize: '9px',
                                                    marginBottom: '2px'
                                                }}>
                                                    💧 {day.pop}%
                                                </div>
                                            )}

                                            {/* Indicatore confidenza */}
                                            {day.confidence && (
                                                <div style={{
                                                    color: theme.textTertiary,
                                                    fontSize: '8px',
                                                    marginTop: '2px'
                                                }}>
                                                    {day.confidence}%
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer con legenda */}
                            <div style={{
                                padding: '6px 16px',
                                background: 'rgba(0, 0, 0, 0.02)',
                                borderTop: `1px solid ${theme.cardBorder}`,
                                fontSize: '9px',
                                color: theme.textTertiary,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                <span>🎯 Dati da One Call API 3.0</span>
                                <span>✓ = Previsione precisa</span>
                                <span>8 giorni di alta qualità</span>
                            </div>
                        </div>

                        {/* Meteo attuale principale */}
                        <div style={{
                            background: theme.cardBg,
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '30px',
                            marginBottom: '20px',
                            border: `1px solid ${theme.cardBorder}`
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '30px'
                            }}>
                                <div>
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: theme.textPrimary,
                                        marginBottom: '10px'
                                    }}>
                                        📍 {currentWeather.location}
                                    </h2>
                                    <p style={{ color: theme.textSecondary }}>
                                        Condizioni attuali • Dati live One Call API • Previsioni orarie ogni ora
                                        {weatherWarnings.length > 0 && (
                                            <span style={{
                                                marginLeft: '8px',
                                                color: weatherWarnings.some(w => w.level === 'danger') ? '#ff3b30' : '#ff9500',
                                                fontWeight: 'bold'
                                            }}>
                                                • {weatherWarnings.length} allerta/e attiva/e
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '48px',
                                        fontWeight: 'bold',
                                        color: theme.textPrimary,
                                        marginBottom: '10px'
                                    }}>
                                        {currentWeather.temperature}°
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        color: theme.textSecondary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span>{currentWeather.icon}</span>
                                        <span>{currentWeather.description}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dettagli */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '15px'
                            }}>
                                <div style={{
                                    background: theme.buttonBg,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    border: `1px solid ${theme.cardBorder}`
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌡️</div>
                                    <p style={{ color: theme.textTertiary, fontSize: '14px' }}>Percepita</p>
                                    <p style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{currentWeather.feels_like}°</p>
                                </div>
                                <div style={{
                                    background: theme.buttonBg,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    border: `1px solid ${theme.cardBorder}`
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💧</div>
                                    <p style={{ color: theme.textTertiary, fontSize: '14px' }}>Umidità</p>
                                    <p style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{currentWeather.humidity}%</p>
                                </div>
                                <div style={{
                                    background: theme.buttonBg,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    border: `1px solid ${theme.cardBorder}`
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💨</div>
                                    <p style={{ color: theme.textTertiary, fontSize: '14px' }}>Vento</p>
                                    <p style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{currentWeather.wind_speed} km/h</p>
                                </div>
                                <div style={{
                                    background: theme.buttonBg,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    border: `1px solid ${theme.cardBorder}`
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👁️</div>
                                    <p style={{ color: theme.textTertiary, fontSize: '14px' }}>Visibilità</p>
                                    <p style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{currentWeather.visibility} km</p>
                                </div>
                            </div>
                        </div>

                        {/* Previsioni orarie integrate - OGNI ORA con One Call API */}
                        {selectedDayHours.length > 0 && (
                            <div style={{
                                background: theme.cardBg,
                                backdropFilter: 'blur(10px)',
                                borderRadius: '20px',
                                border: `1px solid ${theme.cardBorder}`,
                                overflow: 'hidden'
                            }}>
                                {/* Header previsioni orarie MIGLIORATE */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: `1px solid ${theme.cardBorder}`,
                                    background: 'rgba(74, 144, 226, 0.1)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '16px' }}>⏰</span>
                                            <span style={{
                                                color: theme.textPrimary,
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}>
                                                Previsioni Orarie
                                            </span>
                                            {/* Indicatore qualità dati orari */}
                                            {selectedDayHours[0]?.isPreciseHourly && (
                                                <span style={{
                                                    background: 'rgba(76, 175, 80, 0.8)',
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    fontSize: '9px',
                                                    padding: '2px 4px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    OGNI ORA
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            color: theme.textSecondary,
                                            fontSize: '12px'
                                        }}>
                                            {selectedDay === 0 ? 'Oggi' :
                                                selectedDay === 1 ? 'Domani' :
                                                    new Date(forecast[selectedDay]?.date).toLocaleDateString('it-IT', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })} • {selectedDayHours[0]?.isPreciseHourly ? 'One Call API' : 'Standard API'}
                                        </div>
                                    </div>
                                </div>

                                {/* Lista ore orizzontale MIGLIORATA */}
                                <div style={{
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        minWidth: 'fit-content'
                                    }}>
                                        {selectedDayHours.map((hour, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    minWidth: '85px',
                                                    padding: '16px 8px',
                                                    textAlign: 'center',
                                                    borderRight: index < selectedDayHours.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                                                    position: 'relative',
                                                    background: hour.isCurrentHour ? 'rgba(74, 144, 226, 0.1)' : 'transparent'
                                                }}
                                            >
                                                {/* Indicatore ora attuale */}
                                                {hour.isCurrentHour && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(74, 144, 226, 0.8)',
                                                        color: 'white',
                                                        borderRadius: '6px',
                                                        fontSize: '8px',
                                                        padding: '2px 4px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ORA
                                                    </div>
                                                )}

                                                {/* Ora */}
                                                <div style={{
                                                    color: hour.isCurrentHour ? '#4A90E2' : theme.textPrimary,
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    marginBottom: '8px'
                                                }}>
                                                    {hour.time}
                                                </div>

                                                {/* Icona meteo */}
                                                <div style={{
                                                    fontSize: '22px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {hour.icon}
                                                </div>

                                                {/* Temperatura */}
                                                <div style={{
                                                    color: getTemperatureColor(hour.temperature),
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    marginBottom: '6px'
                                                }}>
                                                    {hour.temperature}°
                                                </div>

                                                {/* Temperatura percepita */}
                                                <div style={{
                                                    color: theme.textTertiary,
                                                    fontSize: '10px',
                                                    marginBottom: '4px'
                                                }}>
                                                    Perc. {hour.feels_like}°
                                                </div>

                                                {/* Precipitazioni se > 20% */}
                                                {hour.pop > 20 && (
                                                    <div style={{
                                                        color: '#4A90E2',
                                                        fontSize: '11px',
                                                        marginBottom: '4px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        💧 {hour.pop}%
                                                    </div>
                                                )}

                                                {/* Pioggia/Neve se presente (solo One Call API) */}
                                                {(hour.rain > 0 || hour.snow > 0) && (
                                                    <div style={{
                                                        color: hour.snow > 0 ? '#87CEEB' : '#4A90E2',
                                                        fontSize: '10px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {hour.snow > 0 ? `❄️ ${hour.snow}mm` : `🌧️ ${hour.rain}mm`}
                                                    </div>
                                                )}

                                                {/* Vento */}
                                                <div style={{
                                                    color: theme.textTertiary,
                                                    fontSize: '10px',
                                                    marginBottom: '2px'
                                                }}>
                                                    💨 {hour.wind_speed} km/h
                                                </div>

                                                {/* Direzione vento */}
                                                <div style={{
                                                    color: theme.textTertiary,
                                                    fontSize: '9px',
                                                    marginBottom: '2px'
                                                }}>
                                                    {getWindDirection(hour.wind_direction)}
                                                </div>

                                                {/* Umidità */}
                                                <div style={{
                                                    color: theme.textTertiary,
                                                    fontSize: '10px',
                                                    marginBottom: '2px'
                                                }}>
                                                    💧 {hour.humidity}%
                                                </div>

                                                {/* UV Index se disponibile (solo One Call API) */}
                                                {hour.uvi !== undefined && hour.uvi > 0 && (
                                                    <div style={{
                                                        color: hour.uvi > 6 ? '#ff4444' : hour.uvi > 3 ? '#ffbb00' : '#88dd00',
                                                        fontSize: '9px',
                                                        marginBottom: '2px'
                                                    }}>
                                                        ☀️ UV {hour.uvi}
                                                    </div>
                                                )}

                                                {/* Pressione se spazio disponibile */}
                                                {hour.pressure && (
                                                    <div style={{
                                                        color: theme.textTertiary,
                                                        fontSize: '9px'
                                                    }}>
                                                        📊 {hour.pressure}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer con dettagli aggiuntivi MIGLIORATO */}
                                <div style={{
                                    padding: '8px 16px',
                                    background: 'rgba(0, 0, 0, 0.02)',
                                    borderTop: `1px solid ${theme.cardBorder}`,
                                    fontSize: '11px',
                                    color: theme.textTertiary,
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    <span>💡 Scorri orizzontalmente per vedere tutte le ore</span>
                                    <span>•</span>
                                    <span>⏰ {selectedDayHours[0]?.isPreciseHourly ? 'Dati ogni ora' : 'Dati ogni 3 ore'}</span>
                                    <span>•</span>
                                    <span>🎯 {selectedDayHours[0]?.isPreciseHourly ? 'One Call API' : 'Standard API'}</span>
                                </div>
                            </div>
                        )}

                        {/* Statistiche giornaliere migliorata */}
                        {selectedDayHours.length > 0 && (
                            <div style={{
                                background: theme.cardBg,
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '16px',
                                border: `1px solid ${theme.cardBorder}`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px'
                                }}>
                                    <h4 style={{
                                        color: theme.textPrimary,
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        📊 Riepilogo {selectedDay === 0 ? 'Oggi' :
                                            selectedDay === 1 ? 'Domani' :
                                                new Date(forecast[selectedDay]?.date).toLocaleDateString('it-IT', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                    </h4>

                                    {/* Indicatori qualità previsione MIGLIORATI */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        {forecast[selectedDay]?.isPrecise ? (
                                            <div style={{
                                                background: 'rgba(76, 175, 80, 0.1)',
                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                borderRadius: '6px',
                                                padding: '2px 6px',
                                                fontSize: '10px',
                                                color: '#4CAF50',
                                                fontWeight: 'bold'
                                            }}>
                                                ✅ ONE CALL API ({forecast[selectedDay].confidence || 95}%)
                                            </div>
                                        ) : (
                                            <div style={{
                                                background: 'rgba(255, 152, 0, 0.1)',
                                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                                borderRadius: '6px',
                                                padding: '2px 6px',
                                                fontSize: '10px',
                                                color: '#FF9800',
                                                fontWeight: 'bold'
                                            }}>
                                                📊 STANDARD ({forecast[selectedDay]?.confidence || 80}%)
                                            </div>
                                        )}

                                        {/* Indicatore precisione oraria */}
                                        {selectedDayHours[0]?.isPreciseHourly ? (
                                            <div style={{
                                                background: 'rgba(33, 150, 243, 0.1)',
                                                border: '1px solid rgba(33, 150, 243, 0.3)',
                                                borderRadius: '6px',
                                                padding: '2px 6px',
                                                fontSize: '10px',
                                                color: '#2196F3',
                                                fontWeight: 'bold'
                                            }}>
                                                ⏰ OGNI ORA
                                            </div>
                                        ) : (
                                            <div style={{
                                                background: 'rgba(158, 158, 158, 0.1)',
                                                border: '1px solid rgba(158, 158, 158, 0.3)',
                                                borderRadius: '6px',
                                                padding: '2px 6px',
                                                fontSize: '10px',
                                                color: '#9E9E9E',
                                                fontWeight: 'bold'
                                            }}>
                                                ⏰ OGNI 3H
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                    gap: '12px'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: theme.textTertiary, fontSize: '11px' }}>🌡️ Max</div>
                                        <div style={{
                                            color: getTemperatureColor(Math.max(...selectedDayHours.map(h => h.temperature))),
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {Math.max(...selectedDayHours.map(h => h.temperature))}°
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: theme.textTertiary, fontSize: '11px' }}>🌡️ Min</div>
                                        <div style={{
                                            color: getTemperatureColor(Math.min(...selectedDayHours.map(h => h.temperature))),
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {Math.min(...selectedDayHours.map(h => h.temperature))}°
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: theme.textTertiary, fontSize: '11px' }}>💧 Max Pioggia</div>
                                        <div style={{
                                            color: '#4A90E2',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {Math.max(...selectedDayHours.map(h => h.pop))}%
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: theme.textTertiary, fontSize: '11px' }}>💨 Vento Max</div>
                                        <div style={{
                                            color: theme.textPrimary,
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {Math.max(...selectedDayHours.map(h => h.wind_speed))}
                                        </div>
                                        <div style={{ color: theme.textTertiary, fontSize: '9px' }}>km/h</div>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: theme.textTertiary, fontSize: '11px' }}>💧 Umidità Media</div>
                                        <div style={{
                                            color: theme.textPrimary,
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {Math.round(selectedDayHours.reduce((sum, h) => sum + h.humidity, 0) / selectedDayHours.length)}%
                                        </div>
                                    </div>

                                    {/* Statistiche UV Index se disponibili (solo One Call API) */}
                                    {selectedDayHours.some(h => h.uvi !== undefined) && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: theme.textTertiary, fontSize: '11px' }}>☀️ UV Max</div>
                                            <div style={{
                                                color: theme.textPrimary,
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}>
                                                {Math.max(...selectedDayHours.filter(h => h.uvi !== undefined).map(h => h.uvi))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info aggiuntive per qualità dati MIGLIORATA */}
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px',
                                    background: selectedDayHours[0]?.isPreciseHourly
                                        ? 'rgba(76, 175, 80, 0.05)'
                                        : 'rgba(255, 152, 0, 0.05)',
                                    borderRadius: '6px',
                                    border: selectedDayHours[0]?.isPreciseHourly
                                        ? '1px solid rgba(76, 175, 80, 0.2)'
                                        : '1px solid rgba(255, 152, 0, 0.2)',
                                    fontSize: '11px',
                                    color: theme.textSecondary,
                                    textAlign: 'center'
                                }}>
                                    {selectedDayHours[0]?.isPreciseHourly ? (
                                        <>🎯 Dati di alta qualità da One Call API 3.0 con previsioni ogni ora e dettagli avanzati (UV, precipitazioni precise, punto di rugiada).</>
                                    ) : (
                                        <>📊 Dati da API standard con previsioni ogni 3 ore. Accuratezza buona ma inferiore a One Call API.</>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                )}

                {/* Footer aggiornato per previsioni orarie */}
                {(currentWeather || forecast.length > 0) && (
                    <div style={{
                        background: theme.cardBg,
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        border: `1px solid ${theme.cardBorder}`,
                        marginTop: '20px'
                    }}>
                        <div style={{
                            color: theme.textTertiary,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            <span>🌍 OpenWeatherMap One Call API 3.0</span>
                            <span>•</span>
                            <span>📡 Tempo reale</span>
                            <span>•</span>
                            <span>⏰ Previsioni ogni ora (48h)</span>
                            <span>•</span>
                            <span>📅 8 giorni precisi</span>
                            <span>•</span>
                            <span>🎯 Alta qualità</span>
                            <span>•</span>
                            <span>⚠️ Allerte integrate</span>
                            <span>•</span>
                            <span>🗺️ Mappe interattive</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Modal Impostazioni Accessibilità */}
            <AccessibleModal
                isOpen={showAccessibilitySettings}
                onClose={() => setShowAccessibilitySettings(false)}
                title="Impostazioni di Accessibilità"
                size="medium"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Animazioni */}
                    <div>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            background: preferences.reduceMotion ? '#e8f5e8' : 'transparent',
                            border: `1px solid ${preferences.reduceMotion ? '#4caf50' : '#ddd'}`
                        }}>
                            <input
                                type="checkbox"
                                checked={preferences.reduceMotion}
                                onChange={(e) => handleAccessibilityToggle('reduceMotion', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500' }}>Riduci animazioni</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Disabilita animazioni e transizioni per ridurre distrazioni
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Alto contrasto */}
                    <div>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            background: preferences.highContrast ? '#e8f5e8' : 'transparent',
                            border: `1px solid ${preferences.highContrast ? '#4caf50' : '#ddd'}`
                        }}>
                            <input
                                type="checkbox"
                                checked={preferences.highContrast}
                                onChange={(e) => handleAccessibilityToggle('highContrast', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500' }}>Alto contrasto</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Aumenta il contrasto per una migliore leggibilità
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Testo grande */}
                    <div>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            background: preferences.largeText ? '#e8f5e8' : 'transparent',
                            border: `1px solid ${preferences.largeText ? '#4caf50' : '#ddd'}`
                        }}>
                            <input
                                type="checkbox"
                                checked={preferences.largeText}
                                onChange={(e) => handleAccessibilityToggle('largeText', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500' }}>Testo ingrandito</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Aumenta la dimensione del testo per una lettura più comoda
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Screen reader */}
                    <div>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            background: preferences.screenReaderMode ? '#e8f5e8' : 'transparent',
                            border: `1px solid ${preferences.screenReaderMode ? '#4caf50' : '#ddd'}`
                        }}>
                            <input
                                type="checkbox"
                                checked={preferences.screenReaderMode}
                                onChange={(e) => handleAccessibilityToggle('screenReaderMode', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {preferences.screenReaderMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                    Modalità screen reader
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Attiva annunci vocali per cambiamenti e aggiornamenti
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Navigazione da tastiera */}
                    <div>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            background: preferences.keyboardNavigation ? '#e8f5e8' : 'transparent',
                            border: `1px solid ${preferences.keyboardNavigation ? '#4caf50' : '#ddd'}`
                        }}>
                            <input
                                type="checkbox"
                                checked={preferences.keyboardNavigation}
                                onChange={(e) => handleAccessibilityToggle('keyboardNavigation', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500' }}>Navigazione da tastiera</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Abilita controlli completi da tastiera (Tab, frecce, Enter)
                                </div>
                            </div>
                        </label>
                    </div>

                    <div style={{ 
                        marginTop: '20px', 
                        padding: '16px', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        <strong>💡 Suggerimenti di accessibilità:</strong>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            <li>Usa Tab per navigare tra gli elementi</li>
                            <li>Usa le frecce per navigare nelle liste</li>
                            <li>Usa Invio o Spazio per attivare i pulsanti</li>
                            <li>Usa Esc per chiudere i menu</li>
                        </ul>
                    </div>
                </div>
            </AccessibleModal>
            
            {/* PWA Components */}
            <PWAInstallPrompt
                isVisible={showInstallPrompt && isInstallable && !isInstalled}
                onInstall={handlePWAInstall}
                onDismiss={dismissInstall}
                theme={theme}
            />
            
            <OfflineIndicator
                isOnline={pwaOnline}
                wasOffline={wasOffline}
                theme={theme}
                onRetry={handleRetryConnection}
            />
            
            <ServiceWorkerUpdate
                isVisible={showUpdatePrompt}
                onUpdate={handleServiceWorkerUpdate}
                onDismiss={() => setShowUpdatePrompt(false)}
                theme={theme}
            />
            
            <PWASettingsModal
                isOpen={showPWASettings}
                onClose={() => setShowPWASettings(false)}
                pwaState={{
                    isInstalled,
                    isInstallable,
                    showInstallPrompt
                }}
                swState={{
                    isRegistered: swRegistered,
                    updateAvailable,
                    updateServiceWorker: handleServiceWorkerUpdate
                }}
                pushState={{
                    isSupported: pushSupported,
                    isSubscribed: pushSubscribed,
                    permission: pushPermission
                }}
                theme={theme}
                onClearCache={handleClearCache}
                onInstall={handlePWAInstall}
                onSubscribeNotifications={handlePushSubscribe}
                onUnsubscribeNotifications={handlePushUnsubscribe}
                onTestNotification={handleTestNotification}
            />
            
            <PWAStyles />
            <SkeletonStyles />
        </div>
    );
});

WeatherApp.displayName = 'WeatherApp';

export default WeatherApp;