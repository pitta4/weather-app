import React, { useState, useEffect } from 'react';

const HourlyForecast = ({ hourlyData, theme, currentWeather }) => {
  const [selectedDay, setSelectedDay] = useState('today');
  const [showDetails, setShowDetails] = useState({});

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div style={{
        background: theme.cardBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        border: `1px solid ${theme.cardBorder}`,
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏰</div>
        <h3 style={{ color: theme.textPrimary, marginBottom: '8px' }}>
          Previsioni Orarie Non Disponibili
        </h3>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>
          Cerca una città per vedere le previsioni ora per ora
        </p>
      </div>
    );
  }

  // Raggruppa le ore per giorno
  const groupByDay = () => {
    const grouped = {};
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

    hourlyData.forEach(hour => {
      const hourDate = new Date(hour.datetime);
      const dayKey = hourDate.toDateString();
      
      let dayLabel;
      if (dayKey === today) {
        dayLabel = 'Oggi';
      } else if (dayKey === tomorrow) {
        dayLabel = 'Domani';
      } else {
        dayLabel = hourDate.toLocaleDateString('it-IT', { 
          weekday: 'long',
          day: 'numeric',
          month: 'short'
        });
      }

      if (!grouped[dayLabel]) {
        grouped[dayLabel] = [];
      }
      grouped[dayLabel].push(hour);
    });

    return grouped;
  };

  const groupedData = groupByDay();
  const dayKeys = Object.keys(groupedData);
  const currentDayData = groupedData[selectedDay] || groupedData[dayKeys[0]] || [];

  // Toggle dettagli ora
  const toggleDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Ottieni colore temperatura
  const getTemperatureColor = (temp) => {
    if (temp >= 30) return '#ff4444';
    if (temp >= 25) return '#ff8800';
    if (temp >= 20) return '#ffbb00';
    if (temp >= 15) return '#88dd00';
    if (temp >= 10) return '#00bbff';
    if (temp >= 5) return '#0088ff';
    return '#0044ff';
  };

  // Ottieni intensità precipitazioni
  const getPrecipitationIntensity = (pop) => {
    if (pop >= 80) return { text: 'Molto probabile', color: '#ff4444' };
    if (pop >= 60) return { text: 'Probabile', color: '#ff8800' };
    if (pop >= 40) return { text: 'Possibile', color: '#ffbb00' };
    if (pop >= 20) return { text: 'Poco probabile', color: '#88dd00' };
    return { text: 'Improbabile', color: '#00bbff' };
  };

  return (
    <div style={{
      background: theme.cardBg,
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px',
      border: `1px solid ${theme.cardBorder}`
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: theme.textPrimary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⏰ Previsioni Orarie
          </h3>
          <p style={{ 
            color: theme.textSecondary,
            fontSize: '14px',
            margin: '4px 0 0 0'
          }}>
            {currentWeather ? `${currentWeather.location} • ` : ''}
            Prossime 24 ore con dettagli completi
          </p>
        </div>
        
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '8px',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 'bold' }}>
            {currentDayData.length} ore disponibili
          </div>
        </div>
      </div>

      {/* Selettore giorno */}
      {dayKeys.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {dayKeys.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '8px 16px',
                background: selectedDay === day ? theme.buttonHover : theme.buttonBg,
                border: `1px solid ${selectedDay === day ? '#4CAF50' : theme.cardBorder}`,
                borderRadius: '8px',
                color: theme.textPrimary,
                fontSize: '14px',
                fontWeight: selectedDay === day ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {day}
              <span style={{ 
                marginLeft: '6px', 
                color: theme.textTertiary,
                fontSize: '12px'
              }}>
                ({groupedData[day].length}h)
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Scroll orizzontale delle ore */}
      <div style={{
        overflowX: 'auto',
        marginBottom: '20px',
        paddingBottom: '10px'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          minWidth: 'fit-content',
          paddingBottom: '8px'
        }}>
          {currentDayData.map((hour, index) => (
            <div
              key={index}
              style={{
                minWidth: '100px',
                background: theme.buttonBg,
                borderRadius: '12px',
                padding: '12px 8px',
                textAlign: 'center',
                border: `1px solid ${theme.cardBorder}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onClick={() => toggleDetails(index)}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {/* Ora */}
              <div style={{
                color: theme.textPrimary,
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {hour.time}
              </div>

              {/* Icona meteo */}
              <div style={{
                fontSize: '24px',
                marginBottom: '8px'
              }}>
                {hour.icon}
              </div>

              {/* Temperatura */}
              <div style={{
                color: getTemperatureColor(hour.temperature),
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                {hour.temperature}°
              </div>

              {/* Precipitazioni */}
              {hour.pop > 20 && (
                <div style={{
                  color: getPrecipitationIntensity(hour.pop).color,
                  fontSize: '10px',
                  marginBottom: '4px'
                }}>
                  💧 {hour.pop}%
                </div>
              )}

              {/* Vento */}
              <div style={{
                color: theme.textTertiary,
                fontSize: '10px'
              }}>
                💨 {hour.wind_speed}
              </div>

              {/* Indicatore espansione */}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                color: theme.textTertiary,
                fontSize: '8px'
              }}>
                {showDetails[index] ? '▲' : '▼'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dettagli orari espansi */}
      {Object.keys(showDetails).some(key => showDetails[key]) && (
        <div style={{
          background: theme.buttonBg,
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <h4 style={{
            color: theme.textPrimary,
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Dettagli Orari Selezionati
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentDayData.map((hour, index) => 
              showDetails[index] && (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: `1px solid ${theme.cardBorder}`
                  }}
                >
                  {/* Header dettaglio */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '20px' }}>{hour.icon}</span>
                      <div>
                        <div style={{
                          color: theme.textPrimary,
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {hour.time}
                        </div>
                        <div style={{
                          color: theme.textSecondary,
                          fontSize: '12px'
                        }}>
                          {hour.description}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleDetails(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textTertiary,
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Griglia dettagli */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        🌡️ Temperatura
                      </div>
                      <div style={{
                        color: getTemperatureColor(hour.temperature),
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {hour.temperature}°
                      </div>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '10px'
                      }}>
                        Percepita {hour.feels_like}°
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        💧 Precipitazioni
                      </div>
                      <div style={{
                        color: getPrecipitationIntensity(hour.pop).color,
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {hour.pop}%
                      </div>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '10px'
                      }}>
                        {getPrecipitationIntensity(hour.pop).text}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        💨 Vento
                      </div>
                      <div style={{
                        color: theme.textPrimary,
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {hour.wind_speed}
                      </div>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '10px'
                      }}>
                        km/h
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        💧 Umidità
                      </div>
                      <div style={{
                        color: theme.textPrimary,
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {hour.humidity}%
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        ☁️ Nuvolosità
                      </div>
                      <div style={{
                        color: theme.textPrimary,
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {hour.clouds}%
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        📊 Pressione
                      </div>
                      <div style={{
                        color: theme.textPrimary,
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {hour.pressure}
                      </div>
                      <div style={{
                        color: theme.textTertiary,
                        fontSize: '10px'
                      }}>
                        hPa
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Riepilogo giornata */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(74, 144, 226, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(74, 144, 226, 0.2)'
      }}>
        <div style={{
          color: theme.textPrimary,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span>📈</span>
          <span style={{ fontWeight: 'bold' }}>Riepilogo {selectedDay}</span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '8px',
          fontSize: '12px',
          color: theme.textSecondary
        }}>
          <div>
            🌡️ Max: {Math.max(...currentDayData.map(h => h.temperature))}°
          </div>
          <div>
            🌡️ Min: {Math.min(...currentDayData.map(h => h.temperature))}°
          </div>
          <div>
            💧 Max pioggia: {Math.max(...currentDayData.map(h => h.pop))}%
          </div>
          <div>
            💨 Vento max: {Math.max(...currentDayData.map(h => h.wind_speed))} km/h
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;