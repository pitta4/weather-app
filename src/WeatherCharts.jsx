import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Sun,
  Cloud,
  CloudRain
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const WeatherCharts = ({ forecast, currentWeather, theme }) => {
  const [activeChart, setActiveChart] = useState('temperature');

  // CSS per animazioni
  const chartStyles = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .chart-container {
      animation: fadeIn 0.5s ease-out;
    }
  `;

  // Prepara i dati per i grafici
  const chartData = forecast.map((day, index) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('it-IT', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    return {
      day: dayName,
      date: day.date,
      tempMax: day.temp_max,
      tempMin: day.temp_min,
      tempAvg: Math.round((day.temp_max + day.temp_min) / 2),
      humidity: day.humidity,
      description: day.description,
      icon: day.icon
    };
  });

  // Tooltip personalizzato con icone moderne
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: theme.cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '12px',
          padding: '16px',
          color: theme.textPrimary,
          fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: '200px'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: `1px solid ${theme.cardBorder}`,
            paddingBottom: '8px'
          }}>
            <Activity size={16} color={theme.textAccent} />
            {label}
          </div>
          {activeChart === 'temperature' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#ff6b6b' 
              }}>
                <TrendingUp size={16} />
                <span>Max: {data.tempMax}°C</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#4ecdc4' 
              }}>
                <TrendingDown size={16} />
                <span>Min: {data.tempMin}°C</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: theme.textSecondary 
              }}>
                <Thermometer size={16} />
                <span>Media: {data.tempAvg}°C</span>
              </div>
            </div>
          )}
          {activeChart === 'humidity' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#74b9ff' 
            }}>
              <Droplets size={16} />
              <span>Umidità: {data.humidity}%</span>
            </div>
          )}
          <div style={{ 
            color: theme.textTertiary, 
            fontSize: '12px',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            {data.description}
          </div>
        </div>
      );
    }
    return null;
  };

  // Configurazione dei grafici con icone moderne
  const chartConfigs = {
    temperature: {
      title: 'Temperature',
      description: 'Temperatura massima, minima e media',
      icon: <Thermometer size={20} />,
      color: '#ff6b6b'
    },
    humidity: {
      title: 'Umidità',
      description: 'Livelli di umidità giornalieri',
      icon: <Droplets size={20} />,
      color: '#74b9ff'
    },
    wind: {
      title: 'Vento',
      description: 'Velocità del vento',
      icon: <Wind size={20} />,
      color: '#81ecec'
    },
    visibility: {
      title: 'Visibilità',
      description: 'Condizioni di visibilità',
      icon: <Eye size={20} />,
      color: '#fdcb6e'
    }
  };

  const renderTemperatureChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="tempMaxGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.9}/>
            <stop offset="50%" stopColor="#ff8e8e" stopOpacity={0.5}/>
            <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="tempMinGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.9}/>
            <stop offset="50%" stopColor="#74d8d1" stopOpacity={0.5}/>
            <stop offset="100%" stopColor="#4ecdc4" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="tempAvgGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdcb6e" stopOpacity={0.8}/>
            <stop offset="50%" stopColor="#f39c12" stopOpacity={0.4}/>
            <stop offset="100%" stopColor="#fdcb6e" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme.cardBorder} 
          strokeOpacity={0.3}
        />
        <XAxis 
          dataKey="day" 
          tick={{ fill: theme.textSecondary, fontSize: 12 }}
          axisLine={{ stroke: theme.cardBorder }}
          tickLine={{ stroke: theme.cardBorder }}
        />
        <YAxis 
          tick={{ fill: theme.textSecondary, fontSize: 12 }}
          axisLine={{ stroke: theme.cardBorder }}
          tickLine={{ stroke: theme.cardBorder }}
          domain={['dataMin - 2', 'dataMax + 2']}
          label={{ 
            value: 'Temperatura (°C)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: theme.textSecondary }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ 
            color: theme.textSecondary,
            fontSize: '14px',
            paddingTop: '10px'
          }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="tempMax"
          stroke="#ff6b6b"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#tempMaxGradient)"
          name="Temp. Massima"
          dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#ff6b6b', stroke: '#fff', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="tempMin"
          stroke="#4ecdc4"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#tempMinGradient)"
          name="Temp. Minima"
          dot={{ fill: '#4ecdc4', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#4ecdc4', stroke: '#fff', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="tempAvg"
          stroke="#fdcb6e"
          strokeWidth={3}
          strokeDasharray="8 4"
          dot={{ fill: '#fdcb6e', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, fill: '#fdcb6e', stroke: '#fff', strokeWidth: 2 }}
          name="Temp. Media"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderHumidityChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74b9ff" stopOpacity={0.95}/>
            <stop offset="50%" stopColor="#a29bfe" stopOpacity={0.7}/>
            <stop offset="100%" stopColor="#74b9ff" stopOpacity={0.3}/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme.cardBorder} 
          strokeOpacity={0.3}
        />
        <XAxis 
          dataKey="day" 
          tick={{ fill: theme.textSecondary, fontSize: 12 }}
          axisLine={{ stroke: theme.cardBorder }}
          tickLine={{ stroke: theme.cardBorder }}
        />
        <YAxis 
          tick={{ fill: theme.textSecondary, fontSize: 12 }}
          axisLine={{ stroke: theme.cardBorder }}
          tickLine={{ stroke: theme.cardBorder }}
          domain={[0, 100]}
          label={{ 
            value: 'Umidità (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: theme.textSecondary }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="humidity" 
          fill="url(#humidityGradient)"
          radius={[6, 6, 0, 0]}
          stroke="#74b9ff"
          strokeWidth={2}
          filter="url(#glow)"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .chart-container {
            animation: fadeIn 0.5s ease-out;
          }
        `}
      </style>
      
      <div className="chart-container" style={{
        background: theme.cardBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        border: `1px solid ${theme.cardBorder}`
      }}>
        {/* Header grafici */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '20px', 
          fontWeight: 'bold', 
          color: theme.textPrimary, 
          marginBottom: '8px'
        }}>
          📊 Analisi Meteo Avanzata
        </h3>
        <p style={{ 
          color: theme.textSecondary,
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          Grafici interattivi per i prossimi 5 giorni
        </p>

        {/* Selettore tipo grafico con icone moderne */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(chartConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              style={{
                padding: '12px 20px',
                background: activeChart === key ? theme.buttonHover : theme.buttonBg,
                border: activeChart === key ? `2px solid ${config.color}` : `1px solid ${theme.cardBorder}`,
                borderRadius: '12px',
                color: theme.textPrimary,
                fontSize: '14px',
                fontWeight: activeChart === key ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                transform: activeChart === key ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: activeChart === key ? `0 4px 12px ${config.color}33` : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeChart !== key) {
                  e.target.style.background = theme.buttonHover;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = `0 2px 8px ${config.color}22`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeChart !== key) {
                  e.target.style.background = theme.buttonBg;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ color: config.color }}>
                {config.icon}
              </div>
              <span>{config.title}</span>
              {activeChart === key && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  background: config.color,
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Descrizione grafico attivo con design moderno */}
      <div style={{
        background: `linear-gradient(135deg, ${chartConfigs[activeChart].color}15, ${theme.buttonBg})`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        border: `1px solid ${chartConfigs[activeChart].color}33`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Pattern decorativo */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${chartConfigs[activeChart].color}11 0%, transparent 70%)`,
          transform: 'translate(30px, -30px)'
        }} />
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ color: chartConfigs[activeChart].color }}>
            {chartConfigs[activeChart].icon}
          </div>
          <div>
            <h4 style={{ 
              color: theme.textPrimary,
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 4px 0'
            }}>
              Analisi {chartConfigs[activeChart].title}
            </h4>
            <p style={{ 
              color: theme.textSecondary,
              fontSize: '14px',
              margin: 0
            }}>
              {chartConfigs[activeChart].description}
            </p>
          </div>
        </div>
      </div>

      {/* Container grafico con effetti moderni */}
      <div style={{ 
        background: `linear-gradient(135deg, ${theme.cardBg}, ${theme.buttonBg}22)`,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effetto glow sottile */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${chartConfigs[activeChart].color}66, transparent)`
        }} />
        
        {activeChart === 'temperature' && renderTemperatureChart()}
        {activeChart === 'humidity' && renderHumidityChart()}
      </div>

      {/* Statistiche rapide */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginTop: '20px'
      }}>
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔥</div>
          <div style={{ color: theme.textTertiary, fontSize: '12px' }}>Temp Max</div>
          <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            {Math.max(...chartData.map(d => d.tempMax))}°
          </div>
        </div>
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>❄️</div>
          <div style={{ color: theme.textTertiary, fontSize: '12px' }}>Temp Min</div>
          <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            {Math.min(...chartData.map(d => d.tempMin))}°
          </div>
        </div>
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>💧</div>
          <div style={{ color: theme.textTertiary, fontSize: '12px' }}>Umidità Media</div>
          <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            {Math.round(chartData.reduce((sum, d) => sum + d.humidity, 0) / chartData.length)}%
          </div>
        </div>
        <div style={{
          background: theme.buttonBg,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: `1px solid ${theme.cardBorder}`
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
          <div style={{ color: theme.textTertiary, fontSize: '12px' }}>Escursione</div>
          <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            {Math.max(...chartData.map(d => d.tempMax)) - Math.min(...chartData.map(d => d.tempMin))}°
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default WeatherCharts;