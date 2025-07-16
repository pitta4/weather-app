import React, { useState, useEffect } from 'react';
import API_CONFIG from './config.js';

const WeatherMapsDebug = ({ currentWeather, theme }) => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);

  // Test delle API OpenWeatherMap
  const runApiTests = async () => {
    const API_KEY = API_CONFIG.API_KEY;
    const tests = [];

    // Test 1: API base per dati meteo
    try {
      const weatherUrl = `${API_CONFIG.BASE_URL}/weather?q=Milano&appid=${API_KEY}`;
      const response = await fetch(weatherUrl);
      tests.push({
        name: 'API Dati Meteo',
        url: weatherUrl,
        status: response.status,
        ok: response.ok,
        result: response.ok ? '✅ OK' : '❌ FAIL'
      });
    } catch (error) {
      tests.push({
        name: 'API Dati Meteo',
        status: 'ERROR',
        error: error.message,
        result: '❌ ERROR'
      });
    }

    // Test 2: API tiles per mappe
    try {
      const tileUrl = `https://tile.openweathermap.org/map/precipitation_new/1/0/0.png?appid=${API_KEY}`;
      const response = await fetch(tileUrl, { method: 'HEAD' });
      tests.push({
        name: 'API Tiles Mappe',
        url: tileUrl,
        status: response.status,
        ok: response.ok,
        result: response.ok ? '✅ OK' : '❌ FAIL'
      });
    } catch (error) {
      tests.push({
        name: 'API Tiles Mappe',
        status: 'ERROR',
        error: error.message,
        result: '❌ ERROR'
      });
    }

    // Test 3: API One Call (se disponibile)
    try {
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=45.4642&lon=9.1900&appid=${API_KEY}`;
      const response = await fetch(oneCallUrl);
      tests.push({
        name: 'API One Call 3.0',
        url: oneCallUrl,
        status: response.status,
        ok: response.ok,
        result: response.ok ? '✅ OK' : '❌ FAIL'
      });
    } catch (error) {
      tests.push({
        name: 'API One Call 3.0',
        status: 'ERROR',
        error: error.message,
        result: '❌ ERROR'
      });
    }

    setTestResults(tests);
    
    // Test connettività generale
    try {
      const connectivityTest = await fetch('https://httpbin.org/ip');
      setDebugInfo({
        connectivity: connectivityTest.ok ? 'OK' : 'FAIL',
        apiKey: API_KEY ? `${API_KEY.substring(0, 8)}...` : 'MISSING',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setDebugInfo({
        connectivity: 'ERROR',
        error: error.message,
        apiKey: API_KEY ? `${API_KEY.substring(0, 8)}...` : 'MISSING',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    runApiTests();
  }, []);

  return (
    <div style={{
      background: theme.cardBg,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${theme.cardBorder}`,
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        color: theme.textPrimary, 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🔍 Debug Mappe Meteo
        <button
          onClick={runApiTests}
          style={{
            background: theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔄 Ritest
        </button>
      </h3>

      {/* Info generale */}
      {debugInfo && (
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <h4 style={{ color: theme.textPrimary, margin: '0 0 8px 0', fontSize: '14px' }}>
            📊 Stato Generale
          </h4>
          <div style={{ fontSize: '12px', color: theme.textSecondary, lineHeight: '1.5' }}>
            <div><strong>Connettività:</strong> {debugInfo.connectivity}</div>
            <div><strong>API Key:</strong> {debugInfo.apiKey}</div>
            <div><strong>Ultimo test:</strong> {debugInfo.timestamp}</div>
            {debugInfo.error && <div style={{ color: '#ff5757' }}><strong>Errore:</strong> {debugInfo.error}</div>}
          </div>
        </div>
      )}

      {/* Risultati test API */}
      <div>
        <h4 style={{ color: theme.textPrimary, margin: '0 0 12px 0', fontSize: '14px' }}>
          🧪 Test API OpenWeatherMap
        </h4>
        
        {testResults.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: theme.textSecondary 
          }}>
            ⏳ Esecuzione test in corso...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {testResults.map((test, index) => (
              <div
                key={index}
                style={{
                  background: theme.buttonBg,
                  borderRadius: '6px',
                  padding: '12px',
                  border: `1px solid ${test.ok ? '#4caf50' : '#ff5757'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ 
                    color: theme.textPrimary, 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    marginBottom: '2px'
                  }}>
                    {test.name}
                  </div>
                  <div style={{ 
                    color: theme.textSecondary, 
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                    Status: {test.status} {test.error && `| ${test.error}`}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {test.result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mappa test semplificata */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ color: theme.textPrimary, margin: '0 0 12px 0', fontSize: '14px' }}>
          🗺️ Test Mappa Semplificata
        </h4>
        
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${theme.cardBorder}`,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <iframe
              src={`data:text/html,
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                  <style>
                    body { margin: 0; padding: 0; background: ${theme.cardBg}; }
                    #map { height: 200px; width: 100%; }
                  </style>
                </head>
                <body>
                  <div id="map"></div>
                  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                  <script>
                    try {
                      const map = L.map('map').setView([45.4642, 9.1900], 8);
                      
                      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                      }).addTo(map);
                      
                      // Test layer precipitazioni
                      const weatherLayer = L.tileLayer(
                        'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_CONFIG.API_KEY}',
                        {
                          attribution: '© OpenWeatherMap',
                          opacity: 0.7
                        }
                      );
                      
                      weatherLayer.addTo(map);
                      
                      // Marker Milano
                      L.marker([45.4642, 9.1900])
                        .addTo(map)
                        .bindPopup('Test Milano - API Key attiva')
                        .openPopup();
                        
                    } catch (error) {
                      document.body.innerHTML = '<div style="padding: 20px; color: red; text-align: center;">Errore: ' + error.message + '</div>';
                    }
                  </script>
                </body>
                </html>
              `}
              style={{
                width: '100%',
                height: '200px',
                border: 'none',
                borderRadius: '6px'
              }}
              title="Test Mappa Semplificata"
            />
          </div>
          
          <div style={{ 
            color: theme.textSecondary, 
            fontSize: '12px' 
          }}>
            ☝️ Se vedi una mappa con overlay meteo, l'API funziona correttamente
          </div>
        </div>
      </div>

      {/* Soluzioni comuni */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ color: theme.textPrimary, margin: '0 0 12px 0', fontSize: '14px' }}>
          🔧 Soluzioni Comuni
        </h4>
        
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{ color: theme.textPrimary, fontSize: '12px', lineHeight: '1.5' }}>
            <div><strong>🔑 API Key non valida:</strong> Verifica su openweathermap.org</div>
            <div><strong>🌐 Blocco CORS:</strong> Usa HTTPS o estensione CORS disabler</div>
            <div><strong>🔒 Adblocker:</strong> Disabilita per questo sito</div>
            <div><strong>🚧 Firewall:</strong> Controlla blocchi di rete aziendali</div>
            <div><strong>⏰ Rate limit:</strong> API gratuita ha limiti di chiamate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMapsDebug;
