class FavoritesService {
  constructor() {
    this.storageKey = 'weather-app-favorites';
  }

  // Ottieni tutte le città preferite
  getFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Errore nel caricamento preferiti:', error);
      return [];
    }
  }

  // Aggiungi città ai preferiti
  addFavorite(cityData) {
    try {
      const favorites = this.getFavorites();
      
      // Verifica se la città è già nei preferiti
      const exists = favorites.some(fav => 
        fav.name.toLowerCase() === cityData.name.toLowerCase()
      );
      
      if (!exists) {
        const newFavorite = {
          id: Date.now().toString(),
          name: cityData.name,
          country: cityData.country,
          lat: cityData.lat,
          lon: cityData.lon,
          addedAt: new Date().toISOString()
        };
        
        favorites.push(newFavorite);
        localStorage.setItem(this.storageKey, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Errore nel salvare preferito:', error);
      return false;
    }
  }

  // Rimuovi città dai preferiti
  removeFavorite(cityName) {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(fav => 
        fav.name.toLowerCase() !== cityName.toLowerCase()
      );
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Errore nel rimuovere preferito:', error);
      return false;
    }
  }

  // Verifica se una città è nei preferiti
  isFavorite(cityName) {
    const favorites = this.getFavorites();
    return favorites.some(fav => 
      fav.name.toLowerCase() === cityName.toLowerCase()
    );
  }

  // Pulisci tutti i preferiti
  clearFavorites() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Errore nel pulire preferiti:', error);
      return false;
    }
  }
}

export default new FavoritesService();