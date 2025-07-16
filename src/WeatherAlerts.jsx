import React, { useState } from 'react';

const WeatherAlerts = ({ warnings, theme, onDismiss }) => {
  const [expandedAlert, setExpandedAlert] = useState(null);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getAlertStyle = (level) => {
    const baseStyle = {
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      border: '2px solid',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };

    if (level === 'danger') {
      return {
        ...baseStyle,
        background: 'rgba(255, 59, 48, 0.15)',
        borderColor: '#ff3b30',
        boxShadow: '0 4px 20px rgba(255, 59, 48, 0.3)'
      };
    } else {
      return {
        ...baseStyle,
        background: 'rgba(255, 149, 0, 0.15)',
        borderColor: '#ff9500',
        boxShadow: '0 4px 20px rgba(255, 149, 0, 0.2)'
      };
    }
  };

  const getWarningIcon = (type) => {
    const icons = {
      thunderstorm: '⛈️',
      rain: '🌧️',
      snow: '❄️',
      wind: '💨',
      heat: '🔥',
      cold: '🧊',
      fog: '🌫️'
    };
    return icons[type] || '⚠️';
  };

  const getSafetyTips = (type) => {
    const tips = {
      thunderstorm: [
        'Evita spazi aperti e alberi alti',
        'Non usare apparecchi elettrici',
        'Resta al chiuso se possibile'
      ],
      rain: [
        'Guida con prudenza',
        'Evita zone soggette ad allagamenti',
        'Porta sempre un ombrello'
      ],
      snow: [
        'Guida con gomme invernali',
        'Vestiti a strati',
        'Fai attenzione al ghiaccio'
      ],
      wind: [
        'Evita alberi e strutture instabili',
        'Fissa oggetti che potrebbero volare',
        'Guida con estrema cautela'
      ],
      heat: [
        'Bevi molta acqua',
        'Evita attività intense',
        'Resta in luoghi freschi'
      ],
      cold: [
        'Vestiti a strati',
        'Proteggi estremità del corpo',
        'Evita esposizione prolungata'
      ],
      fog: [
        'Guida con fari accesi',
        'Mantieni distanza di sicurezza',
        'Riduci la velocità'
      ]
    };

    return tips[type] || ['Segui le indicazioni delle autorità locali'];
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px' 
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: theme.textPrimary,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Allerte Meteo ({warnings.length})
        </h3>
        
        <button
          onClick={() => onDismiss && onDismiss()}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textTertiary,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = theme.textPrimary}
          onMouseLeave={(e) => e.target.style.color = theme.textTertiary}
        >
          ✕
        </button>
      </div>

      <div>
        {warnings.map((warning, index) => (
          <div
            key={index}
            style={getAlertStyle(warning.level)}
            onClick={() => setExpandedAlert(expandedAlert === index ? null : index)}
          >
            {/* Header dell'allerta */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: expandedAlert === index ? '12px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>
                  {getWarningIcon(warning.type)}
                </span>
                <div>
                  <div style={{ 
                    color: theme.textPrimary, 
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {warning.title}
                  </div>
                  <div style={{ 
                    color: theme.textSecondary,
                    fontSize: '14px'
                  }}>
                    {warning.location} • {warning.time}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: warning.level === 'danger' ? '#ff3b30' : '#ff9500',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {warning.level === 'danger' ? 'PERICOLO' : 'ATTENZIONE'}
                </span>
                
                <span style={{ 
                  color: theme.textTertiary,
                  fontSize: '14px'
                }}>
                  {expandedAlert === index ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Messaggio principale */}
            <div style={{ 
              color: theme.textPrimary,
              fontSize: '15px',
              marginLeft: '36px',
              marginBottom: expandedAlert === index ? '16px' : '0'
            }}>
              {warning.message}
            </div>

            {/* Dettagli espansi */}
            {expandedAlert === index && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '12px'
              }}>
                <h4 style={{
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🛡️ Consigli di Sicurezza
                </h4>
                
                <div style={{ display: 'grid', gap: '6px' }}>
                  {getSafetyTips(warning.type).map((tip, tipIndex) => (
                    <div
                      key={tipIndex}
                      style={{
                        color: theme.textSecondary,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '4px 0'
                      }}
                    >
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                {warning.level === 'danger' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: 'rgba(255, 59, 48, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 59, 48, 0.3)'
                  }}>
                    <div style={{
                      color: '#ff3b30',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      🚨 SITUAZIONE PERICOLOSA
                    </div>
                    <div style={{
                      color: theme.textSecondary,
                      fontSize: '12px',
                      marginTop: '4px'
                    }}>
                      Segui attentamente i consigli di sicurezza e le indicazioni delle autorità locali.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer informativo */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: theme.buttonBg,
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{
          color: theme.textTertiary,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <span>🔔</span>
          <span>Allerte basate su dati meteo in tempo reale</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherAlerts;