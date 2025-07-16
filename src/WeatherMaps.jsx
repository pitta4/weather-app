import React, { useState } from 'react';
import API_CONFIG from './config.js';

const WeatherMaps = ({ currentWeather, theme }) => {
  const [activeMap, setActiveMap] = useState('precipitation');
  const [showMap, setShowMap] = useState(false);

  // Configurazione mappe
  const mapTypes = {
    precipitation: { icon: '🌧️', title: 'Precipitazioni', desc: 'Radar pioggia', layer: 'precipitation_new' },
    clouds: { icon: '☁️', title: 'Nuvolosità', desc: 'Copertura nuvolosa', layer: 'clouds_new' },
    temperature: { icon: '🌡️', title: 'Temperature', desc: 'Mappa termica', layer: 'temp_new' },
    wind: { icon: '💨', title: 'Vento', desc: 'Velocità e direzione', layer: 'wind_new' },
    pressure: { icon: '📊', title: 'Pressione', desc: 'Pressione atmosferica', layer: 'pressure_new' }
  };

  // Genera URL mappa
  const generateMapUrl = (mapType) => {
    const API_KEY = API_CONFIG.API_KEY; // Corretto: usa API_KEY invece di OPENWEATHER_API_KEY
    if (!API_KEY) return null;
    
    const lat = currentWeather?.coord?.lat || 45.4642;
    const lon = currentWeather?.coord?.lon || 9.1900;
    const zoom = 6;
    
    const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `https://tile.openweathermap.org/map/${mapTypes[mapType].layer}/${zoom}/${tileX}/${tileY}.png?appid=${API_KEY}`;
  };
  return (
    <div style={{
      background: theme?.cardBg || '#ffffff',
      borderRadius: '20px',
      padding: '30px',
      textAlign: 'center',
      border: `1px solid ${theme?.cardBorder || '#e0e0e0'}`,
      marginBottom: '20px',
      color: theme?.textPrimary || '#000000'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🗺️</div>
      
      <h2 style={{ 
        color: theme?.textPrimary || '#000000',
        marginBottom: '16px',
        fontSize: '24px'
      }}>
        Mappe Meteorologiche
      </h2>
      
      <p style={{ 
        color: theme?.textSecondary || '#666666',
        marginBottom: '24px',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        Visualizza le condizioni meteorologiche in tempo reale con mappe interattive
      </p>

      {/* Anteprima delle mappe disponibili */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {Object.entries(mapTypes).map(([key, map]) => (
          <button 
            key={key}
            onClick={() => {
              setActiveMap(key);
              setShowMap(true);
            }}
            style={{
              background: activeMap === key ? theme?.primary || '#2196F3' : theme?.buttonBg || '#f5f5f5',
              color: activeMap === key ? 'white' : theme?.textPrimary || '#000000',
              border: `2px solid ${activeMap === key ? theme?.primary || '#2196F3' : theme?.cardBorder || '#e0e0e0'}`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeMap === key ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeMap === key ? '0 4px 12px rgba(33, 150, 243, 0.3)' : 'none'
            }}
            onMouseOver={(e) => {
              if (activeMap !== key) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (activeMap !== key) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{map.icon}</div>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '4px'
            }}>
              {map.title}
            </div>
            <div style={{ 
              fontSize: '12px',
              opacity: 0.8
            }}>
              {map.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Mappa attiva */}
      {showMap && (
        <div style={{
          marginBottom: '24px',
          background: theme?.buttonBg || '#f5f5f5',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme?.cardBorder || '#e0e0e0'}`
        }}>
          <h3 style={{ 
            color: theme?.textPrimary || '#000000',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {mapTypes[activeMap].icon} {mapTypes[activeMap].title}
          </h3>
          
          {API_CONFIG.API_KEY ? ( // Corretto: usa API_KEY invece di OPENWEATHER_API_KEY
            <div style={{
              position: 'relative',
              height: '400px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={generateMapUrl(activeMap)}
                alt={`Mappa ${mapTypes[activeMap].title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme?.textSecondary || '#666666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <div>Impossibile caricare la mappa</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Verifica la connessione internet
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              height: '400px',
              borderRadius: '8px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '2px dashed rgba(255, 193, 7, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme?.textSecondary || '#666666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                API Key richiesta
              </div>
              <div style={{ fontSize: '14px', textAlign: 'center' }}>
                Configura la tua chiave API OpenWeatherMap<br/>
                nel file config.js per visualizzare le mappe
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowMap(false)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: theme?.buttonBg || '#f5f5f5',
              border: `1px solid ${theme?.cardBorder || '#e0e0e0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              color: theme?.textPrimary || '#000000'
            }}
          >
            ✕ Chiudi mappa
          </button>
        </div>
      )}

      {/* Stato attuale */}
      <div style={{
        background: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
        <div style={{ 
          fontWeight: 'bold',
          color: theme?.textPrimary || '#000000',
          marginBottom: '4px'
        }}>
          Componente Mappe Caricato
        </div>
        <div style={{ 
          fontSize: '14px',
          color: theme?.textSecondary || '#666666'
        }}>
          Sistema operativo • Tema: {theme ? 'Attivo' : 'Non disponibile'}
        </div>
      </div>

      {/* Info posizione */}
      {currentWeather && (
        <div style={{
          background: theme?.buttonBg || '#f5f5f5',
          border: `1px solid ${theme?.cardBorder || '#e0e0e0'}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          color: theme?.textSecondary || '#666666'
        }}>
          📍 Posizione: {currentWeather.name || 'Non disponibile'}
        </div>
      )}
    </div>
  );
};

export default WeatherMaps;
