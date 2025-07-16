import React from 'react';

// Skeleton base component
export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className = '',
  animated = true 
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
    background: animated 
      ? 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
      : '#f0f0f0',
    backgroundSize: '200% 100%',
    animation: animated ? 'skeleton-loading 1.5s infinite' : 'none',
  };

  return (
    <div 
      className={`skeleton ${className}`}
      style={skeletonStyle}
      aria-label="Loading..."
    />
  );
};

// Weather card skeleton
export const WeatherCardSkeleton = () => (
  <div className="weather-card-skeleton" style={{
    padding: '24px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '20px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <Skeleton width="120px" height="24px" />
      <Skeleton width="60px" height="60px" borderRadius="50%" />
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
      <Skeleton width="80px" height="48px" style={{ marginRight: '16px' }} />
      <div style={{ flex: 1 }}>
        <Skeleton width="100%" height="20px" style={{ marginBottom: '8px' }} />
        <Skeleton width="70%" height="16px" />
      </div>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      <div>
        <Skeleton width="100%" height="16px" style={{ marginBottom: '4px' }} />
        <Skeleton width="60%" height="20px" />
      </div>
      <div>
        <Skeleton width="100%" height="16px" style={{ marginBottom: '4px' }} />
        <Skeleton width="80%" height="20px" />
      </div>
      <div>
        <Skeleton width="100%" height="16px" style={{ marginBottom: '4px' }} />
        <Skeleton width="70%" height="20px" />
      </div>
    </div>
  </div>
);

// Hourly forecast skeleton
export const HourlyForecastSkeleton = () => (
  <div className="hourly-forecast-skeleton" style={{
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    marginBottom: '20px'
  }}>
    <Skeleton width="150px" height="24px" style={{ marginBottom: '16px' }} />
    
    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      overflowX: 'auto',
      paddingBottom: '8px'
    }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          minWidth: '80px',
          textAlign: 'center',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="40px" height="40px" borderRadius="50%" style={{ margin: '8px auto' }} />
          <Skeleton width="100%" height="20px" style={{ marginBottom: '4px' }} />
          <Skeleton width="80%" height="14px" />
        </div>
      ))}
    </div>
  </div>
);

// Charts skeleton
export const ChartsSkeleton = () => (
  <div className="charts-skeleton" style={{
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    marginBottom: '20px'
  }}>
    <Skeleton width="200px" height="24px" style={{ marginBottom: '20px' }} />
    
    <div style={{ height: '300px', position: 'relative' }}>
      {/* Chart area */}
      <Skeleton width="100%" height="240px" style={{ marginBottom: '16px' }} />
      
      {/* Chart legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton width="16px" height="16px" borderRadius="50%" />
          <Skeleton width="80px" height="16px" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton width="16px" height="16px" borderRadius="50%" />
          <Skeleton width="70px" height="16px" />
        </div>
      </div>
    </div>
  </div>
);

// Weather alerts skeleton
export const AlertsSkeleton = () => (
  <div className="alerts-skeleton" style={{
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    marginBottom: '20px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
      <Skeleton width="24px" height="24px" borderRadius="50%" style={{ marginRight: '12px' }} />
      <Skeleton width="120px" height="20px" />
    </div>
    <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
    <Skeleton width="80%" height="16px" />
  </div>
);

// CSS for skeleton animations
export const SkeletonStyles = () => (
  <style jsx>{`
    @keyframes skeleton-loading {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .skeleton {
      display: block;
    }
    
    /* Dark theme skeletons */
    .dark-theme .skeleton {
      background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%) !important;
      background-size: 200% 100% !important;
    }
    
    /* Responsive skeletons */
    @media (max-width: 768px) {
      .hourly-forecast-skeleton > div {
        gap: 12px;
      }
      
      .hourly-forecast-skeleton > div > div {
        min-width: 70px;
        padding: 8px;
      }
    }
  `}</style>
);
