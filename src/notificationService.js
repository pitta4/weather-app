class NotificationService {
  constructor() {
    this.permissionGranted = false;
    this.init();
  }

  // Inizializza il servizio
  async init() {
    if ('Notification' in window) {
      const permission = await this.requestPermission();
      this.permissionGranted = permission === 'granted';
    }
  }

  // Richiedi permesso per le notifiche
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser non supporta le notifiche');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Codici meteo OpenWeatherMap per condizioni pericolose
  getWeatherSeverity(weatherCode) {
    // Codici meteo pericolosi
    const severityMap = {
      // Temporali
      200: { level: 'warning', type: 'thunderstorm', message: 'Temporale con pioggia leggera' },
      201: { level: 'warning', type: 'thunderstorm', message: 'Temporale con pioggia' },
      202: { level: 'danger', type: 'thunderstorm', message: 'Temporale con pioggia intensa' },
      210: { level: 'warning', type: 'thunderstorm', message: 'Temporale leggero' },
      211: { level: 'warning', type: 'thunderstorm', message: 'Temporale' },
      212: { level: 'danger', type: 'thunderstorm', message: 'Temporale intenso' },
      221: { level: 'warning', type: 'thunderstorm', message: 'Temporale irregolare' },
      230: { level: 'warning', type: 'thunderstorm', message: 'Temporale con pioviggine leggera' },
      231: { level: 'warning', type: 'thunderstorm', message: 'Temporale con pioviggine' },
      232: { level: 'danger', type: 'thunderstorm', message: 'Temporale con pioviggine intensa' },

      // Pioggia intensa
      502: { level: 'warning', type: 'rain', message: 'Pioggia intensa' },
      503: { level: 'danger', type: 'rain', message: 'Pioggia molto intensa' },
      504: { level: 'danger', type: 'rain', message: 'Pioggia estrema' },
      511: { level: 'danger', type: 'rain', message: 'Pioggia gelata' },
      520: { level: 'warning', type: 'rain', message: 'Acquazzone leggero' },
      521: { level: 'warning', type: 'rain', message: 'Acquazzone' },
      522: { level: 'danger', type: 'rain', message: 'Acquazzone intenso' },
      531: { level: 'danger', type: 'rain', message: 'Acquazzone irregolare' },

      // Neve
      601: { level: 'warning', type: 'snow', message: 'Neve' },
      602: { level: 'danger', type: 'snow', message: 'Neve intensa' },
      611: { level: 'warning', type: 'snow', message: 'Nevischio' },
      612: { level: 'warning', type: 'snow', message: 'Nevischio leggero' },
      613: { level: 'warning', type: 'snow', message: 'Nevischio intenso' },
      615: { level: 'warning', type: 'snow', message: 'Pioggia e neve leggera' },
      616: { level: 'warning', type: 'snow', message: 'Pioggia e neve' },
      620: { level: 'warning', type: 'snow', message: 'Neve leggera' },
      621: { level: 'warning', type: 'snow', message: 'Neve' },
      622: { level: 'danger', type: 'snow', message: 'Neve intensa' },

      // Nebbia
      741: { level: 'warning', type: 'fog', message: 'Nebbia' },

      // Vento
      771: { level: 'warning', type: 'wind', message: 'Raffiche di vento' },
      781: { level: 'danger', type: 'wind', message: 'Tornado' }
    };

    return severityMap[weatherCode] || null;
  }

  // Verifica condizioni estreme di temperatura
  checkTemperatureWarning(temperature, feelsLike) {
    if (temperature >= 35 || feelsLike >= 40) {
      return {
        level: 'danger',
        type: 'heat',
        message: `Caldo estremo: ${temperature}°C (percepita ${feelsLike}°C)`
      };
    }
    if (temperature >= 30 || feelsLike >= 35) {
      return {
        level: 'warning',
        type: 'heat',
        message: `Caldo intenso: ${temperature}°C (percepita ${feelsLike}°C)`
      };
    }
    if (temperature <= -10 || feelsLike <= -15) {
      return {
        level: 'danger',
        type: 'cold',
        message: `Freddo estremo: ${temperature}°C (percepita ${feelsLike}°C)`
      };
    }
    if (temperature <= 0 || feelsLike <= -5) {
      return {
        level: 'warning',
        type: 'cold',
        message: `Freddo intenso: ${temperature}°C (percepita ${feelsLike}°C)`
      };
    }
    return null;
  }

  // Verifica vento forte
  checkWindWarning(windSpeed) {
    if (windSpeed >= 88) { // > 88 km/h = Uragano
      return {
        level: 'danger',
        type: 'wind',
        message: `Vento da uragano: ${windSpeed} km/h`
      };
    }
    if (windSpeed >= 62) { // > 62 km/h = Tempesta
      return {
        level: 'danger',
        type: 'wind',
        message: `Vento tempestoso: ${windSpeed} km/h`
      };
    }
    if (windSpeed >= 39) { // > 39 km/h = Vento forte
      return {
        level: 'warning',
        type: 'wind',
        message: `Vento forte: ${windSpeed} km/h`
      };
    }
    return null;
  }

  // Analizza tutti i dati meteo e genera avvisi
  analyzeWeatherConditions(currentWeather, forecast = []) {
    const warnings = [];

    // Controlla condizioni attuali
    if (currentWeather) {
      // Controllo codice meteo
      const weatherWarning = this.getWeatherSeverity(currentWeather.weatherCode);
      if (weatherWarning) {
        warnings.push({
          ...weatherWarning,
          title: 'Condizioni Meteo Attuali',
          location: currentWeather.location,
          time: 'Ora'
        });
      }

      // Controllo temperatura
      const tempWarning = this.checkTemperatureWarning(
        currentWeather.temperature, 
        currentWeather.feels_like
      );
      if (tempWarning) {
        warnings.push({
          ...tempWarning,
          title: 'Allerta Temperatura',
          location: currentWeather.location,
          time: 'Ora'
        });
      }

      // Controllo vento
      const windWarning = this.checkWindWarning(currentWeather.wind_speed);
      if (windWarning) {
        warnings.push({
          ...windWarning,
          title: 'Allerta Vento',
          location: currentWeather.location,
          time: 'Ora'
        });
      }
    }

    // Controlla previsioni per prossime 24h
    if (forecast && forecast.length > 0) {
      forecast.slice(0, 2).forEach((day, index) => {
        const weatherWarning = this.getWeatherSeverity(day.weatherCode);
        if (weatherWarning && weatherWarning.level === 'danger') {
          const timeLabel = index === 0 ? 'Domani' : 'Dopodomani';
          warnings.push({
            ...weatherWarning,
            title: 'Previsione Pericolosa',
            location: currentWeather?.location || 'Località',
            time: timeLabel
          });
        }
      });
    }

    return warnings;
  }

  // Mostra notifica browser
  showBrowserNotification(warning) {
    if (!this.permissionGranted) return false;

    const icons = {
      thunderstorm: '⛈️',
      rain: '🌧️',
      snow: '❄️',
      wind: '💨',
      heat: '🔥',
      cold: '🧊',
      fog: '🌫️'
    };

    const icon = icons[warning.type] || '⚠️';
    
    try {
      const notification = new Notification(`${icon} ${warning.title}`, {
        body: `${warning.message}\n📍 ${warning.location}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `weather-${warning.type}-${Date.now()}`,
        requireInteraction: warning.level === 'danger',
        silent: warning.level !== 'danger'
      });

      // Auto-chiudi dopo 10 secondi se non è pericoloso
      if (warning.level !== 'danger') {
        setTimeout(() => notification.close(), 10000);
      }

      return true;
    } catch (error) {
      console.error('Errore notifica:', error);
      return false;
    }
  }

  // Ottieni icona per il tipo di avviso
  getWarningIcon(type) {
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
  }

  // Ottieni colore per il livello di allerta
  getWarningColor(level) {
    return {
      warning: '#ff9500',
      danger: '#ff3b30'
    }[level] || '#ff9500';
  }

  // Genera consigli di sicurezza
  getSafetyTips(warning) {
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

    return tips[warning.type] || ['Segui le indicazioni delle autorità locali'];
  }
}

export default new NotificationService();