import React from 'react';

function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          🌤️ Weather App
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          App di previsioni meteo moderna
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>✅ App caricata correttamente!</h2>
          <p>Il sistema funziona. Ora integreremo le funzionalità meteo.</p>
        </div>
        <button style={{
          background: '#00b894',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '25px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Continua
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;
