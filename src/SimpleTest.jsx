import React from 'react'

function SimpleTest() {
  return (
    <div style={{
      padding: '20px',
      color: 'white',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <h1>🌤️ Weather App Test</h1>
      <p>Se vedi questo messaggio, React funziona!</p>
      <button 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onClick={() => alert('Funziona!')}
      >
        Test Button
      </button>
    </div>
  )
}

export default SimpleTest
