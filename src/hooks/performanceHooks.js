import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Hook per gestire stati di loading avanzati
export const useAdvancedLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage(message);
    setError(null);
  }, []);

  const updateProgress = useCallback((progress, message) => {
    setLoadingProgress(Math.min(100, Math.max(0, progress)));
    if (message) setLoadingMessage(message);
  }, []);

  const finishLoading = useCallback(() => {
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }, 300);
  }, []);

  const setLoadingError = useCallback((errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    setLoadingProgress(0);
  }, []);

  return {
    isLoading,
    loadingProgress,
    loadingMessage,
    error,
    startLoading,
    updateProgress,
    finishLoading,
    setLoadingError
  };
};

// Hook per lazy loading con intersection observer
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return { elementRef, isVisible, hasLoaded };
};

// Hook per debounce avanzato con cancel
export const useAdvancedDebounce = (value, delay, options = {}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef(null);

  const { immediate = false, maxWait = null } = options;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    setDebouncedValue(value);
  }, [cancel, value]);

  useEffect(() => {
    if (immediate && !timeoutRef.current) {
      setDebouncedValue(value);
    }

    setIsPending(true);
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
      timeoutRef.current = null;
    }, delay);

    // Max wait implementation
    if (maxWait && !timeoutRef.current) {
      setTimeout(() => {
        setDebouncedValue(value);
        setIsPending(false);
      }, maxWait);
    }

    return cancel;
  }, [value, delay, immediate, maxWait, cancel]);

  return { debouncedValue, isPending, cancel, flush };
};

// Hook per gestire retry logic
export const useRetryLogic = (asyncFunction, maxRetries = 3, retryDelay = 1000) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  const executeWithRetry = useCallback(async (...args) => {
    let currentRetry = 0;
    setRetryCount(0);
    setLastError(null);

    while (currentRetry <= maxRetries) {
      try {
        setIsRetrying(currentRetry > 0);
        const result = await asyncFunction(...args);
        setIsRetrying(false);
        setRetryCount(currentRetry);
        return result;
      } catch (error) {
        setLastError(error);
        currentRetry++;
        setRetryCount(currentRetry);

        if (currentRetry <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry));
        } else {
          setIsRetrying(false);
          throw error;
        }
      }
    }
  }, [asyncFunction, maxRetries, retryDelay]);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError
  };
};

// Hook per performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderStart = useRef(Date.now());
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    renderCount: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const renderEnd = Date.now();
    const renderTime = renderEnd - renderStart.current;
    
    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1;
      const totalTime = prev.averageRenderTime * prev.renderCount + renderTime;
      const newAverageRenderTime = totalTime / newRenderCount;

      return {
        renderTime,
        renderCount: newRenderCount,
        averageRenderTime: newAverageRenderTime
      };
    });

    renderStart.current = Date.now();
  });

  const logPerformance = useCallback(() => {
    console.group(`Performance Metrics: ${componentName}`);
    console.log(`Last render time: ${metrics.renderTime}ms`);
    console.log(`Total renders: ${metrics.renderCount}`);
    console.log(`Average render time: ${metrics.averageRenderTime.toFixed(2)}ms`);
    console.groupEnd();
  }, [componentName, metrics]);

  return { metrics, logPerformance };
};

// Hook per gestire cache con TTL
export const useCacheWithTTL = (key, defaultValue, ttlMs = 300000) => { // 5 min default
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttlMs) {
          return value;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return defaultValue;
  });

  const setCachedData = useCallback((newData) => {
    try {
      const cacheData = {
        value: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      setData(newData);
    } catch (error) {
      console.warn('Cache write error:', error);
      setData(newData);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(defaultValue);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }, [key, defaultValue]);

  const isExpired = useMemo(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        return Date.now() - timestamp >= ttlMs;
      }
    } catch (error) {
      return true;
    }
    return true;
  }, [key, ttlMs]);

  return {
    data,
    setCachedData,
    clearCache,
    isExpired
  };
};

// Hook per network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};
