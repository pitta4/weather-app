import React, { useState, useEffect } from 'react';
import API_CONFIG from './config.js';

const WeatherMaps = ({ currentWeather, theme }) => {
  const [activeMap, setActiveMap] = useState('precipitation');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [opacity, setOpacity] = useState(0.8);
  const [debugInfo, setDebugInfo] = useState(null);

  // Configurazione mappe
  const mapTypes = {
    precipitation: {
      title: '🌧️ Precipitazioni',
      description: 'Radar delle precipitazioni in tempo reale',
      layer: 'precipitation_new',
      icon: '🌦️',
      colorInfo: 'Blu: Pioggia leggera → Rosso: Pioggia intensa'
    },
    clouds: {
      title: '☁️ Nuvolosità',
      description: 'Copertura nuvolosa attuale',
      layer: 'clouds_new',
      icon: '☁️',
      colorInfo: 'Trasparente: Cielo sereno → Bianco: Nuvole dense'
    },
    temperature: {
      title: '🌡️ Temperature',
      description: 'Mappa delle temperature',
      layer: 'temp_new',
      icon: '🌡️',
      colorInfo: 'Blu: Freddo → Giallo/Rosso: Caldo'
    },
    wind: {
      title: '💨 Vento',
      description: 'Velocità e direzione del vento',
      layer: 'wind_new',
      icon: '💨',
      colorInfo: 'Frecce mostrano direzione e intensità'
    },
    pressure: {
      title: '📊 Pressione',
      description: 'Pressione atmosferica',
      layer: 'pressure_new',
      icon: '📊',
      colorInfo: 'Linee indicano sistemi di alta/bassa pressione'
    }
  };

  // Determina il centro della mappa
  const getMapCenter = () => {
    if (currentWeather?.coordinates) {
      return {
        lat: currentWeather.coordinates.lat,
        lon: currentWeather.coordinates.lon
      };
    }
    return { lat: 45.4642, lon: 9.1900 }; // Milano default
  };

  const center = getMapCenter();

  // Genera mappa semplificata
  const generateMapIframe = () => {
    const mapConfig = mapTypes[activeMap];
    const API_KEY = API_CONFIG.API_KEY;
    
    const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Weather Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background: ${theme.cardBg || '#ffffff'};
      font-family: Arial, sans-serif;
    }
    #map { 
      height: 100vh; 
      width: 100%;
    }
    .map-status {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      max-width: 200px;
    }
    .map-legend {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-size: 11px;
      max-width: 180px;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-status" id="status">Inizializzazione...</div>
  <div class="map-legend">
    <strong>${mapConfig.icon} ${mapConfig.title}</strong><br>
    <small>${mapConfig.colorInfo}</small>
  </div>
  
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const status = document.getElementById('status');
    
    try {
      status.textContent = 'Caricamento mappa...';
      
      // Inizializza mappa
      const map = L.map('map').setView([${center.lat}, ${center.lon}], ${zoom});
      
      // Tile base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        opacity: 0.8
      }).addTo(map);
      
      status.textContent = 'Caricamento layer meteo...';
      
      // Layer meteo
      const weatherLayer = L.tileLayer(
        'https://tile.openweathermap.org/map/${mapConfig.layer}/{z}/{x}/{y}.png?appid=${API_KEY}',
        {
          attribution: '© OpenWeatherMap',
          opacity: ${opacity}
        }
      );
      
      weatherLayer.addTo(map);
      
      // Eventi
      weatherLayer.on('load', () => {
        status.textContent = '✅ ${mapConfig.title} caricato';
      });
      
      weatherLayer.on('tileerror', () => {
        status.textContent = '⚠️ Alcuni tiles non disponibili';
      });
      
      // Marker posizione
      ${currentWeather ? `
      L.marker([${center.lat}, ${center.lon}])
        .addTo(map)
        .bindPopup('📍 ${currentWeather.location || 'Posizione corrente'}')
        .openPopup();
      ` : ''}
      
      // Status finale
      setTimeout(() => {
        if (status.textContent.includes('Caricamento')) {
          status.textContent = '🗺️ ${mapConfig.title} attivo';
        }
      }, 5000);
      
    } catch (error) {
      status.textContent = '❌ Errore: ' + error.message;
      console.error('Map error:', error);
    }
  </script>
</body>
</html>`;
    
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(mapHtml);
  };

  // Test API
  const testApiConnection = async () => {
    const API_KEY = API_CONFIG.API_KEY;
    const testUrl = `https://tile.openweathermap.org/map/precipitation_new/1/0/0.png?appid=${API_KEY}`;
    
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      setDebugInfo({
        status: response.ok ? 'OK' : 'ERROR',
        statusCode: response.status,
        apiKey: API_KEY ? 'Configurata' : 'Mancante'
      });
    } catch (error) {
      setDebugInfo({
        status: 'ERROR',
        error: error.message,
        apiKey: API_KEY ? 'Configurata' : 'Mancante'
      });
    }
  };

  useEffect(() => {
    setMapLoaded(false);
    testApiConnection();
    
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    const fallbackTimer = setTimeout(() => {
      setMapLoaded(true);
      console.warn('Timeout caricamento mappa');
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [activeMap, currentWeather, zoom, opacity]);

  if (!API_CONFIG.API_KEY) {
    return (
      <div style={{
        background: theme.cardBg,
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        border: `1px solid ${theme.cardBorder}`,
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
        <h3 style={{ color: theme.textPrimary, marginBottom: '12px' }}>
          Mappe Meteo Non Disponibili
        </h3>
        <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '16px' }}>
          API Key OpenWeatherMap necessaria per visualizzare le mappe meteo interattive
        </p>
        
        <div style={{
          background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.secondary}20 100%)`,
          borderRadius: '12px',
          padding: '60px 20px',
          margin: '20px 0',
          border: `2px dashed ${theme.cardBorder}`,
          position: 'relative'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌍</div>
          <div style={{ color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            Anteprima Mappa Meteo
          </div>
          <div style={{ color: theme.textSecondary, fontSize: '13px', lineHeight: '1.4' }}>
            Qui verranno visualizzate le mappe interattive con:<br/>
            🌧️ Precipitazioni • ☁️ Nuvolosità • 🌡️ Temperature<br/>
            💨 Vento • 📊 Pressione atmosferica
          </div>
        </div>
        
        <div style={{ color: theme.textTertiary, fontSize: '12px', lineHeight: '1.4' }}>
          💡 <strong>Come abilitare:</strong><br/>
          1. Ottieni una API key gratuita da openweathermap.org<br/>
          2. Aggiungila al file config.js<br/>
          3. Riavvia l'applicazione
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.cardBg,
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px',
      border: `1px solid ${theme.cardBorder}`
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: theme.textPrimary,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🗺️ Mappe Meteorologiche
        {debugInfo && (
          <span style={{
            fontSize: '12px',
            padding: '2px 8px',
            background: debugInfo.status === 'OK' ? '#4caf50' : '#ff5757',
            color: 'white',
            borderRadius: '12px'
          }}>
            {debugInfo.status}
          </span>
        )}
      </h3>

      {/* Selezione tipo mappa */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {Object.entries(mapTypes).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveMap(key)}
            style={{
              padding: '12px 8px',
              background: activeMap === key ? theme.primary : theme.buttonBg,
              color: activeMap === key ? 'white' : theme.textPrimary,
              border: `1px solid ${activeMap === key ? theme.primary : theme.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>{config.icon}</div>
            <div>{config.title.replace(/🌧️|☁️|🌡️|💨|📊/, '').trim()}</div>
          </button>
        ))}
      </div>

      {/* Controlli */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Zoom */}
        <div style={{ 
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            🔍 Zoom: {zoom}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setZoom(Math.max(3, zoom - 1))}
              disabled={zoom <= 3}
              style={{
                flex: 1,
                padding: '6px',
                background: theme.buttonBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '4px',
                color: theme.textPrimary,
                cursor: zoom <= 3 ? 'not-allowed' : 'pointer',
                opacity: zoom <= 3 ? 0.5 : 1
              }}
            >
              −
            </button>
            <button
              onClick={() => setZoom(Math.min(10, zoom + 1))}
              disabled={zoom >= 10}
              style={{
                flex: 1,
                padding: '6px',
                background: theme.buttonBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '4px',
                color: theme.textPrimary,
                cursor: zoom >= 10 ? 'not-allowed' : 'pointer',
                opacity: zoom >= 10 ? 0.5 : 1
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Opacità */}
        <div style={{ 
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            🎨 Opacità: {Math.round(opacity * 100)}%
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Mappa */}
      <div style={{
        position: 'relative',
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: theme.buttonBg,
        border: `2px solid ${theme.cardBorder}`
      }}>
        {!mapLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.buttonBg,
            zIndex: 10
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <div style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px' }}>
              Caricamento mappa...
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '12px', marginBottom: '16px' }}>
              {mapTypes[activeMap].title} • Zoom: {zoom} • Opacità: {Math.round(opacity * 100)}%
            </div>
            
            {debugInfo && debugInfo.status === 'ERROR' && (
              <div style={{
                padding: '12px',
                background: 'rgba(255, 87, 87, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 87, 87, 0.2)',
                textAlign: 'center',
                maxWidth: '300px'
              }}>
                <div style={{ color: '#ff5757', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                  ⚠️ Problema di connessione
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '12px' }}>
                  Verifica la connessione internet e l'API key OpenWeatherMap
                </div>
              </div>
            )}
          </div>
        )}
        
        <iframe
          key={`${activeMap}-${zoom}-${opacity}`}
          src={generateMapIframe()}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px',
            opacity: mapLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            background: theme.cardBg || '#ffffff'
          }}
          onLoad={() => setMapLoaded(true)}
          onError={(e) => {
            console.error('Errore caricamento mappa:', e);
            setMapLoaded(true);
          }}
          title={`Mappa ${mapTypes[activeMap].title}`}
        />
      </div>

      {/* Info e descrizione */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(76, 175, 80, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(76, 175, 80, 0.2)'
      }}>
        <div style={{
          color: theme.textPrimary,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {mapTypes[activeMap].description}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '12px', lineHeight: '1.4' }}>
              {mapTypes[activeMap].colorInfo}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMaps;
