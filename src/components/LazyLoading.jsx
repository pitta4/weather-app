import React, { lazy, Suspense, memo } from 'react';
import { useLazyLoading } from '../hooks/performanceHooks';
import { Skeleton } from './SkeletonLoader';

// Higher-order component per lazy loading
export const withLazyLoading = (
  ComponentToLazy,
  fallbackComponent = null,
  loadingOptions = {}
) => {
  const LazyComponent = memo((props) => {
    const { elementRef, isVisible } = useLazyLoading(loadingOptions.threshold);

    if (!isVisible) {
      return (
        <div ref={elementRef} style={{ minHeight: loadingOptions.minHeight || '200px' }}>
          {fallbackComponent || <Skeleton height={loadingOptions.minHeight || '200px'} />}
        </div>
      );
    }

    return <ComponentToLazy {...props} />;
  });

  LazyComponent.displayName = `LazyLoaded(${ComponentToLazy.displayName || ComponentToLazy.name})`;
  return LazyComponent;
};

// Componente Lazy Loading container
export const LazyContainer = ({ 
  children, 
  fallback = null, 
  threshold = 0.1,
  minHeight = '200px',
  className = '',
  style = {}
}) => {
  const { elementRef, isVisible } = useLazyLoading(threshold);

  if (!isVisible) {
    return (
      <div 
        ref={elementRef} 
        className={className}
        style={{ 
          minHeight, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style 
        }}
      >
        {fallback || <Skeleton height={minHeight} />}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

// Componenti lazy per le sezioni principali
export const LazyWeatherCharts = lazy(() => import('../WeatherCharts'));
export const LazyWeatherMaps = lazy(() => import('../WeatherMaps'));
export const LazyHourlyForecast = lazy(() => import('../HourlyForecast'));
export const LazyWeatherAlerts = lazy(() => import('../WeatherAlerts'));

// Wrapper Suspense con fallback personalizzato
export const SuspenseWrapper = ({ 
  children, 
  fallback = null, 
  componentType = 'default'
}) => {
  const getFallback = () => {
    if (fallback) return fallback;
    
    switch (componentType) {
      case 'charts':
        return (
          <div style={{ padding: '20px' }}>
            <Skeleton width="200px" height="24px" style={{ marginBottom: '20px' }} />
            <Skeleton width="100%" height="300px" />
          </div>
        );
      
      case 'hourly':
        return (
          <div style={{ padding: '20px' }}>
            <Skeleton width="150px" height="24px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ minWidth: '80px', textAlign: 'center' }}>
                  <Skeleton width="80px" height="100px" />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'maps':
        return (
          <div style={{ padding: '20px' }}>
            <Skeleton width="120px" height="24px" style={{ marginBottom: '16px' }} />
            <Skeleton width="100%" height="400px" borderRadius="12px" />
          </div>
        );
      
      case 'alerts':
        return (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Skeleton width="24px" height="24px" borderRadius="50%" style={{ marginRight: '12px' }} />
              <Skeleton width="120px" height="20px" />
            </div>
            <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80%" height="16px" />
          </div>
        );
      
      default:
        return <Skeleton width="100%" height="200px" />;
    }
  };

  return (
    <Suspense fallback={getFallback()}>
      {children}
    </Suspense>
  );
};

// Componente per gestire il lazy loading progressivo
export const ProgressiveLazyLoader = ({ 
  components = [], 
  delay = 100,
  onLoadComplete 
}) => {
  const [loadedComponents, setLoadedComponents] = React.useState(new Set());
  const timeoutRefs = React.useRef([]);

  React.useEffect(() => {
    components.forEach((component, index) => {
      const timeout = setTimeout(() => {
        setLoadedComponents(prev => {
          const newSet = new Set(prev);
          newSet.add(component.id);
          
          if (newSet.size === components.length && onLoadComplete) {
            onLoadComplete();
          }
          
          return newSet;
        });
      }, delay * (index + 1));
      
      timeoutRefs.current.push(timeout);
    });

    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, [components, delay, onLoadComplete]);

  return (
    <>
      {components.map((component) => (
        <LazyContainer
          key={component.id}
          threshold={0.1}
          minHeight={component.minHeight || '200px'}
          fallback={component.fallback}
        >
          {loadedComponents.has(component.id) ? component.element : null}
        </LazyContainer>
      ))}
    </>
  );
};

// Hook per preload dei componenti
export const useComponentPreloader = () => {
  const [preloadedComponents, setPreloadedComponents] = React.useState(new Set());

  const preloadComponent = React.useCallback(async (componentImport, componentName) => {
    if (preloadedComponents.has(componentName)) return;

    try {
      await componentImport();
      setPreloadedComponents(prev => new Set(prev).add(componentName));
    } catch (error) {
      console.warn(`Failed to preload component ${componentName}:`, error);
    }
  }, [preloadedComponents]);

  const preloadAll = React.useCallback(async (componentMap) => {
    const promises = Object.entries(componentMap).map(([name, importFn]) =>
      preloadComponent(importFn, name)
    );
    
    await Promise.allSettled(promises);
  }, [preloadComponent]);

  return {
    preloadComponent,
    preloadAll,
    preloadedComponents: Array.from(preloadedComponents)
  };
};

export default LazyContainer;
