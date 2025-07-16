import { useState, useEffect, useRef, useCallback } from 'react';

// Hook per gestire la navigazione da tastiera
export const useKeyboardNavigation = (items = [], options = {}) => {
  const [activeIndex, setActiveIndex] = useState(options.initialIndex || 0);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef(null);

  const { 
    loop = true, 
    onSelect, 
    onEscape,
    enabledKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space', 'Escape']
  } = options;

  const handleKeyDown = useCallback((event) => {
    if (!enabledKeys.includes(event.key)) return;

    setIsNavigating(true);
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev + 1;
          return loop ? nextIndex % items.length : Math.min(nextIndex, items.length - 1);
        });
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setActiveIndex(prev => {
          const prevIndex = prev - 1;
          return loop ? (prevIndex < 0 ? items.length - 1 : prevIndex) : Math.max(prevIndex, 0);
        });
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onSelect && items[activeIndex]) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        if (onEscape) {
          onEscape();
        }
        setIsNavigating(false);
        break;
        
      default:
        break;
    }
  }, [items, activeIndex, loop, onSelect, onEscape, enabledKeys]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  const focusItem = useCallback((index) => {
    if (containerRef.current) {
      const item = containerRef.current.children[index];
      if (item && item.focus) {
        item.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (isNavigating) {
      focusItem(activeIndex);
    }
  }, [activeIndex, isNavigating, focusItem]);

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
    isNavigating,
    focusItem
  };
};

// Hook per gestire il focus management
export const useFocusManagement = (options = {}) => {
  const [focusedElement, setFocusedElement] = useState(null);
  const [focusStack, setFocusStack] = useState([]);
  const trapRef = useRef(null);

  const { trapFocus = false, restoreOnUnmount = true } = options;

  // Salva il focus corrente
  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement;
    setFocusStack(prev => [...prev, activeElement]);
    return activeElement;
  }, []);

  // Ripristina il focus precedente
  const restoreFocus = useCallback(() => {
    setFocusStack(prev => {
      const newStack = [...prev];
      const elementToFocus = newStack.pop();
      if (elementToFocus && elementToFocus.focus) {
        elementToFocus.focus();
      }
      return newStack;
    });
  }, []);

  // Imposta il focus su un elemento specifico
  const setFocus = useCallback((element) => {
    if (element && element.focus) {
      element.focus();
      setFocusedElement(element);
    }
  }, []);

  // Trova elementi focusabili
  const getFocusableElements = useCallback((container = document) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')));
  }, []);

  // Trap focus all'interno di un container
  const handleFocusTrap = useCallback((event) => {
    if (!trapFocus || !trapRef.current) return;

    const focusableElements = getFocusableElements(trapRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [trapFocus, getFocusableElements]);

  useEffect(() => {
    if (trapFocus) {
      document.addEventListener('keydown', handleFocusTrap);
      return () => document.removeEventListener('keydown', handleFocusTrap);
    }
  }, [trapFocus, handleFocusTrap]);

  useEffect(() => {
    return () => {
      if (restoreOnUnmount && focusStack.length > 0) {
        restoreFocus();
      }
    };
  }, []);

  return {
    trapRef,
    focusedElement,
    saveFocus,
    restoreFocus,
    setFocus,
    getFocusableElements
  };
};

// Hook per screen reader announcements
export const useScreenReader = () => {
  const announceRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    if (!announceRef.current) {
      // Crea l'elemento live region se non esiste
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
      announceRef.current = liveRegion;
    }

    // Pulisce e aggiunge il nuovo messaggio
    announceRef.current.textContent = '';
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message;
      }
    }, 100);
  }, []);

  const announceWeatherUpdate = useCallback((weather) => {
    if (weather) {
      const message = `Meteo aggiornato per ${weather.name}. Temperatura ${Math.round(weather.temperature)} gradi, ${weather.description}. Umidità ${weather.humidity}%, vento ${weather.windSpeed} chilometri orari.`;
      announce(message);
    }
  }, [announce]);

  const announceError = useCallback((error) => {
    announce(`Errore: ${error}`, 'assertive');
  }, [announce]);

  const announceLoading = useCallback((isLoading, message = '') => {
    if (isLoading) {
      announce(`Caricamento in corso. ${message}`, 'polite');
    } else {
      announce('Caricamento completato', 'polite');
    }
  }, [announce]);

  useEffect(() => {
    return () => {
      if (announceRef.current) {
        document.body.removeChild(announceRef.current);
      }
    };
  }, []);

  return {
    announce,
    announceWeatherUpdate,
    announceError,
    announceLoading
  };
};

// Hook per gestire le preferenze di accessibilità
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    return saved ? JSON.parse(saved) : {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      largeText: false,
      screenReaderMode: false,
      keyboardNavigation: true
    };
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      localStorage.setItem('accessibility-preferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  }, []);

  // Monitora le preferenze del sistema
  useEffect(() => {
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReduceMotionChange = (e) => {
      updatePreference('reduceMotion', e.matches);
    };

    const handleHighContrastChange = (e) => {
      updatePreference('highContrast', e.matches);
    };

    reduceMotionQuery.addEventListener('change', handleReduceMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reduceMotionQuery.removeEventListener('change', handleReduceMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, [updatePreference]);

  return {
    preferences,
    updatePreference
  };
};

// Hook per Skip Links
export const useSkipLinks = (sections = []) => {
  const skipLinksRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const skipToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleKeyDown = useCallback((event) => {
    // Mostra skip links quando Tab è premuto
    if (event.key === 'Tab' && !event.shiftKey) {
      setIsVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Nascondi skip links quando il focus esce dall'area
    setTimeout(() => {
      if (!skipLinksRef.current?.contains(document.activeElement)) {
        setIsVisible(false);
      }
    }, 100);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    skipLinksRef,
    isVisible,
    skipToSection,
    handleBlur
  };
};
