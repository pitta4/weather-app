import API_CONFIG from './config.js';

const API_KEY = API_CONFIG.API_KEY;
const BASE_URL = API_CONFIG.BASE_URL;

class WeatherService {
  async getCurrentWeather(city) {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=it`
      );
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatCurrentWeather(data);
    } catch (error) {
      console.error('Errore nel recupero meteo:', error);
      throw error;
    }
  }

  // NUOVO: Ottieni previsioni 8 giorni con One Call API
  async getForecast8Days(lat, lon) {
    try {
      // Usa One Call API per 8 giorni precisi
      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it&exclude=minutely,alerts`
      );
      
      if (oneCallResponse.ok) {
        const oneCallData = await oneCallResponse.json();
        return this.formatOneCallForecast8Days(oneCallData);
      } else {
        // Fallback all'API standard (solo 5 giorni)
        const standardResponse = await fetch(
          `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`
        );
        
        if (standardResponse.ok) {
          const standardData = await standardResponse.json();
          return this.formatForecast(standardData);
        }
      }
    } catch (error) {
      console.error('Errore nel recupero previsioni 8 giorni:', error);
      // Fallback al metodo standard
      return this.getForecastByCoords(lat, lon);
    }
  }

  // NUOVO: Ottieni previsioni orarie ogni ora con One Call API
  async getHourlyForecast48Hours(lat, lon) {
    try {
      // Usa One Call API per previsioni orarie precise (48 ore)
      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it&exclude=minutely,daily,alerts`
      );
      
      if (oneCallResponse.ok) {
        const oneCallData = await oneCallResponse.json();
        return this.formatOneCallHourlyForecast(oneCallData);
      } else {
        // Fallback all'API standard (ogni 3 ore)
        const standardResponse = await fetch(
          `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`
        );
        
        if (standardResponse.ok) {
          const standardData = await standardResponse.json();
          return this.formatHourlyForecast(standardData);
        }
      }
    } catch (error) {
      console.error('Errore nel recupero previsioni orarie:', error);
      throw error;
    }
  }

  // NUOVO: Formatta dati One Call API per 8 giorni
  formatOneCallForecast8Days(data) {
    return data.daily.slice(0, 8).map((day, index) => {
      const date = new Date(day.dt * 1000);
      
      return {
        date: date.toISOString().split('T')[0],
        temp_max: Math.round(day.temp.max),
        temp_min: Math.round(day.temp.min),
        description: day.weather[0].description,
        icon: this.getWeatherIcon(day.weather[0].icon),
        humidity: day.humidity,
        weatherCode: day.weather[0].id,
        wind_speed: Math.round(day.wind_speed * 3.6),
        pressure: day.pressure,
        pop: Math.round((day.pop || 0) * 100),
        uvi: Math.round(day.uvi || 0),
        dayOfWeek: date.toLocaleDateString('it-IT', { weekday: 'long' }),
        isToday: index === 0,
        clouds: day.clouds,
        dewPoint: Math.round(day.dew_point),
        sunrise: new Date(day.sunrise * 1000).toLocaleTimeString('it-IT', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sunset: new Date(day.sunset * 1000).toLocaleTimeString('it-IT', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        // Indica che sono dati precisi da One Call API
        isPrecise: true,
        confidence: 95 - (index * 3) // Confidenza alta per One Call API
      };
    });
  }

  // NUOVO: Formatta previsioni orarie One Call API (ogni ora per 48 ore)
  formatOneCallHourlyForecast(data) {
    const now = new Date();
    
    return data.hourly.slice(0, 48).map((hour, index) => {
      const date = new Date(hour.dt * 1000);
      
      return {
        datetime: hour.dt * 1000,
        time: date.toLocaleTimeString('it-IT', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        hour: date.getHours(),
        date: date.toLocaleDateString('it-IT', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        temperature: Math.round(hour.temp),
        feels_like: Math.round(hour.feels_like),
        description: hour.weather[0].description,
        icon: this.getWeatherIcon(hour.weather[0].icon),
        humidity: hour.humidity,
        wind_speed: Math.round(hour.wind_speed * 3.6),
        wind_direction: hour.wind_deg || 0,
        pressure: hour.pressure,
        visibility: hour.visibility ? Math.round(hour.visibility / 1000) : 10,
        precipitation: 0, // One Call API ha rain/snow separati
        weatherCode: hour.weather[0].id,
        clouds: hour.clouds,
        isNight: hour.weather[0].icon.includes('n'),
        pop: Math.round((hour.pop || 0) * 100),
        uvi: Math.round(hour.uvi || 0),
        dewPoint: Math.round(hour.dew_point),
        // Aggiungi precipitazioni se presenti
        rain: hour.rain ? Math.round(hour.rain['1h'] || 0) : 0,
        snow: hour.snow ? Math.round(hour.snow['1h'] || 0) : 0,
        // Indica che sono dati precisi da One Call API
        isPreciseHourly: true,
        isCurrentHour: index === 0
      };
    });
  }

  async getForecast(city) {
    try {
      // Prima ottieni le coordinate
      const coordsResponse = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      
      if (!coordsResponse.ok) {
        throw new Error(`Errore ricerca coordinate: ${coordsResponse.status}`);
      }
      
      const coordsData = await coordsResponse.json();
      if (coordsData.length === 0) {
        throw new Error('Città non trovata');
      }
      
      const { lat, lon } = coordsData[0];
      
      // Usa le previsioni 8 giorni One Call API
      return await this.getForecast8Days(lat, lon);
    } catch (error) {
      console.error('Errore nel recupero previsioni:', error);
      throw error;
    }
  }

  async getHourlyForecast(city) {
    try {
      // Prima ottieni le coordinate
      const coordsResponse = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      
      if (!coordsResponse.ok) {
        throw new Error(`Errore ricerca coordinate: ${coordsResponse.status}`);
      }
      
      const coordsData = await coordsResponse.json();
      if (coordsData.length === 0) {
        throw new Error('Città non trovata');
      }
      
      const { lat, lon } = coordsData[0];
      
      // Usa le previsioni orarie One Call API (ogni ora)
      return await this.getHourlyForecast48Hours(lat, lon);
    } catch (error) {
      console.error('Errore nel recupero previsioni orarie:', error);
      // Fallback all'API standard
      const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=it`
      );
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatHourlyForecast(data);
    }
  }

  async getCurrentWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`
      );
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatCurrentWeather(data);
    } catch (error) {
      console.error('Errore nel recupero meteo per coordinate:', error);
      throw error;
    }
  }

  async getForecastByCoords(lat, lon) {
    try {
      return await this.getForecast8Days(lat, lon);
    } catch (error) {
      console.error('Errore nel recupero previsioni per coordinate:', error);
      throw error;
    }
  }

  async getHourlyForecastByCoords(lat, lon) {
    try {
      return await this.getHourlyForecast48Hours(lat, lon);
    } catch (error) {
      console.error('Errore nel recupero previsioni orarie per coordinate:', error);
      // Fallback all'API standard
      const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`
      );
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatHourlyForecast(data);
    }
  }

  async searchCities(query) {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
        displayName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`
      }));
    } catch (error) {
      console.error('Errore nella ricerca città:', error);
      return [];
    }
  }

  async getMultipleCitiesWeather(cities) {
    try {
      const promises = cities.map(city => 
        this.getCurrentWeatherByCoords(city.lat, city.lon)
          .catch(error => ({
            error: true,
            message: error.message,
            cityName: city.name
          }))
      );
      
      const results = await Promise.all(promises);
      return results.filter(result => !result.error);
    } catch (error) {
      console.error('Errore nel recupero meteo multiple città:', error);
      return [];
    }
  }

  formatCurrentWeather(data) {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };

    return {
      location: `${data.name}, ${data.sys.country}`,
      name: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6),
      visibility: Math.round(data.visibility / 1000),
      icon: iconMap[data.weather[0].icon] || '☀️',
      weatherCode: data.weather[0].id,
      pressure: data.main.pressure,
      windDirection: data.wind.deg || 0
    };
  }

  formatForecast(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000).toISOString().split('T')[0],
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          description: item.weather[0].description,
          icon: this.getWeatherIcon(item.weather[0].icon),
          humidity: item.main.humidity,
          weatherCode: item.weather[0].id,
          wind_speed: Math.round(item.wind.speed * 3.6),
          pressure: item.main.pressure,
          pop: Math.round((item.pop || 0) * 100),
          isPrecise: false,
          confidence: 80
        };
      } else {
        dailyForecasts[date].temp_max = Math.max(
          dailyForecasts[date].temp_max, 
          item.main.temp_max
        );
        dailyForecasts[date].temp_min = Math.min(
          dailyForecasts[date].temp_min, 
          item.main.temp_min
        );
      }
    });

    return Object.values(dailyForecasts)
      .slice(0, 5)
      .map(day => ({
        ...day,
        temp_max: Math.round(day.temp_max),
        temp_min: Math.round(day.temp_min)
      }));
  }

  formatHourlyForecast(data) {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + (48 * 60 * 60 * 1000));

    return data.list
      .filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= now && itemDate <= next48Hours;
      })
      .map(item => {
        const date = new Date(item.dt * 1000);
        
        return {
          datetime: item.dt * 1000,
          time: date.toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          hour: date.getHours(),
          date: date.toLocaleDateString('it-IT', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }),
          temperature: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          description: item.weather[0].description,
          icon: this.getWeatherIcon(item.weather[0].icon),
          humidity: item.main.humidity,
          wind_speed: Math.round(item.wind.speed * 3.6),
          wind_direction: item.wind.deg || 0,
          pressure: item.main.pressure,
          visibility: item.visibility ? Math.round(item.visibility / 1000) : 10,
          precipitation: item.rain ? Math.round(item.rain['3h'] || 0) : 0,
          weatherCode: item.weather[0].id,
          clouds: item.clouds.all,
          isNight: item.weather[0].icon.includes('n'),
          pop: Math.round((item.pop || 0) * 100),
          isPreciseHourly: false, // API standard = ogni 3 ore
          rain: item.rain ? Math.round(item.rain['3h'] || 0) : 0,
          snow: item.snow ? Math.round(item.snow['3h'] || 0) : 0
        };
      })
      .slice(0, 24);
  }

  getWeatherIcon(iconCode) {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '☀️';
  }

  getWindDirection(degrees) {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

export default new WeatherService();