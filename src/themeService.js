class ThemeService {
  constructor() {
    this.storageKey = 'weather-app-theme';
    this.themes = {
      light: {
        name: 'light',
        display: 'Chiaro Moderno',
        icon: '☀️',
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        warm: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        cold: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        // Glassmorphism avanzato
        cardBg: 'rgba(255, 255, 255, 0.15)',
        cardBorder: 'rgba(255, 255, 255, 0.25)',
        cardShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
        backdropBlur: 'blur(8px)',
        // Typography migliorata
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.85)',
        textTertiary: 'rgba(255, 255, 255, 0.65)',
        textAccent: '#667eea',
        // Interactive elements
        inputBg: 'rgba(255, 255, 255, 0.2)',
        inputBorder: 'rgba(255, 255, 255, 0.3)',
        inputFocus: 'rgba(255, 255, 255, 0.4)',
        buttonBg: 'rgba(255, 255, 255, 0.2)',
        buttonHover: 'rgba(255, 255, 255, 0.3)',
        buttonActive: 'rgba(255, 255, 255, 0.4)',
        // Status colors
        errorBg: 'rgba(220, 53, 69, 0.2)',
        errorBorder: 'rgba(220, 53, 69, 0.4)',
        successBg: 'rgba(40, 167, 69, 0.2)',
        successBorder: 'rgba(40, 167, 69, 0.4)',
        warningBg: 'rgba(255, 193, 7, 0.2)',
        warningBorder: 'rgba(255, 193, 7, 0.4)',
        infoBg: 'rgba(23, 162, 184, 0.2)',
        infoBorder: 'rgba(23, 162, 184, 0.4)',
        // Design tokens
        borderRadius: {
          sm: '6px',
          md: '12px',
          lg: '20px',
          xl: '24px'
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px'
        }
      },
      dark: {
        name: 'dark',
        display: 'Scuro Elegante',
        icon: '🌙',
        primary: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        secondary: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        warm: 'linear-gradient(135deg, #ff7f7f 0%, #ff6b6b 100%)',
        cold: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        // Glassmorphism per tema scuro
        cardBg: 'rgba(30, 39, 46, 0.8)',
        cardBorder: 'rgba(255, 255, 255, 0.1)',
        cardShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropBlur: 'blur(12px)',
        // Typography ottimizzata per scuro
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.9)',
        textTertiary: 'rgba(255, 255, 255, 0.7)',
        textAccent: '#74b9ff',
        // Interactive elements
        inputBg: 'rgba(255, 255, 255, 0.1)',
        inputBorder: 'rgba(255, 255, 255, 0.2)',
        inputFocus: 'rgba(255, 255, 255, 0.3)',
        buttonBg: 'rgba(255, 255, 255, 0.15)',
        buttonHover: 'rgba(255, 255, 255, 0.25)',
        buttonActive: 'rgba(255, 255, 255, 0.35)',
        // Status colors per tema scuro
        errorBg: 'rgba(231, 76, 60, 0.25)',
        errorBorder: 'rgba(231, 76, 60, 0.5)',
        successBg: 'rgba(46, 204, 113, 0.25)',
        successBorder: 'rgba(46, 204, 113, 0.5)',
        warningBg: 'rgba(230, 126, 34, 0.25)',
        warningBorder: 'rgba(230, 126, 34, 0.5)',
        infoBg: 'rgba(52, 152, 219, 0.25)',
        infoBorder: 'rgba(52, 152, 219, 0.5)',
        // Design tokens
        borderRadius: {
          sm: '6px',
          md: '12px',
          lg: '20px',
          xl: '24px'
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px'
        }
      },
      sunset: {
        name: 'sunset',
        display: 'Tramonto Premium',
        icon: '🌅',
        primary: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        warm: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        cold: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        // Glassmorphism sunset
        cardBg: 'rgba(255, 154, 158, 0.2)',
        cardBorder: 'rgba(255, 207, 239, 0.4)',
        cardShadow: '0 8px 32px rgba(255, 154, 158, 0.3)',
        backdropBlur: 'blur(10px)',
        // Typography sunset
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.95)',
        textTertiary: 'rgba(255, 255, 255, 0.8)',
        textAccent: '#f093fb',
        // Interactive elements
        inputBg: 'rgba(255, 255, 255, 0.25)',
        inputBorder: 'rgba(255, 255, 255, 0.4)',
        inputFocus: 'rgba(255, 255, 255, 0.5)',
        buttonBg: 'rgba(255, 255, 255, 0.25)',
        buttonHover: 'rgba(255, 255, 255, 0.35)',
        buttonActive: 'rgba(255, 255, 255, 0.45)',
        // Status colors sunset
        errorBg: 'rgba(220, 53, 69, 0.25)',
        errorBorder: 'rgba(220, 53, 69, 0.5)',
        successBg: 'rgba(40, 167, 69, 0.25)',
        successBorder: 'rgba(40, 167, 69, 0.5)',
        warningBg: 'rgba(255, 193, 7, 0.25)',
        warningBorder: 'rgba(255, 193, 7, 0.5)',
        infoBg: 'rgba(245, 87, 108, 0.25)',
        infoBorder: 'rgba(245, 87, 108, 0.5)',
        // Design tokens
        borderRadius: {
          sm: '6px',
          md: '12px',
          lg: '20px',
          xl: '24px'
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px'
        }
      },
      ocean: {
        name: 'ocean',
        display: 'Oceano Profondo',
        icon: '🌊',
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        warm: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        cold: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        // Glassmorphism ocean
        cardBg: 'rgba(102, 126, 234, 0.15)',
        cardBorder: 'rgba(137, 247, 254, 0.3)',
        cardShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        backdropBlur: 'blur(12px)',
        // Typography ocean
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.95)',
        textTertiary: 'rgba(255, 255, 255, 0.8)',
        textAccent: '#89f7fe',
        // Interactive elements
        inputBg: 'rgba(255, 255, 255, 0.2)',
        inputBorder: 'rgba(255, 255, 255, 0.35)',
        inputFocus: 'rgba(255, 255, 255, 0.45)',
        buttonBg: 'rgba(255, 255, 255, 0.2)',
        buttonHover: 'rgba(255, 255, 255, 0.3)',
        buttonActive: 'rgba(255, 255, 255, 0.4)',
        // Status colors ocean
        errorBg: 'rgba(220, 53, 69, 0.25)',
        errorBorder: 'rgba(220, 53, 69, 0.5)',
        successBg: 'rgba(40, 167, 69, 0.25)',
        successBorder: 'rgba(40, 167, 69, 0.5)',
        warningBg: 'rgba(255, 193, 7, 0.25)',
        warningBorder: 'rgba(255, 193, 7, 0.5)',
        infoBg: 'rgba(137, 247, 254, 0.25)',
        infoBorder: 'rgba(137, 247, 254, 0.5)',
        // Design tokens
        borderRadius: {
          sm: '6px',
          md: '12px',
          lg: '20px',
          xl: '24px'
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px'
        }
      }
    };
  }

  // Ottieni tema salvato o default
  getCurrentTheme() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && this.themes[saved]) {
        return saved;
      }
      return 'light'; // default
    } catch (error) {
      console.error('Errore nel caricamento tema:', error);
      return 'light';
    }
  }

  // Salva tema
  setTheme(themeName) {
    try {
      if (this.themes[themeName]) {
        localStorage.setItem(this.storageKey, themeName);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Errore nel salvare tema:', error);
      return false;
    }
  }

  // Ottieni configurazione tema
  getThemeConfig(themeName) {
    return this.themes[themeName] || this.themes.light;
  }

  // Ottieni tutti i temi disponibili
  getAllThemes() {
    return Object.values(this.themes);
  }

  // Ottieni background dinamico basato sulla temperatura
  getDynamicBackground(themeName, temperature) {
    const theme = this.getThemeConfig(themeName);
    
    if (temperature >= 30) {
      return theme.warm;
    } else if (temperature <= 10) {
      return theme.cold;
    } else if (temperature >= 20) {
      return theme.secondary;
    } else {
      return theme.primary;
    }
  }

  // Rileva tema automatico dal sistema (opzionale)
  getSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  // Utility per generare stili CSS completi
  getCardStyles(themeName, options = {}) {
    const theme = this.getThemeConfig(themeName);
    const {
      padding = theme.spacing.md,
      borderRadius = theme.borderRadius.lg,
      withShadow = true,
      opacity = 1
    } = options;

    return {
      background: theme.cardBg,
      backdropFilter: theme.backdropBlur,
      borderRadius: borderRadius,
      padding: padding,
      border: `1px solid ${theme.cardBorder}`,
      boxShadow: withShadow ? theme.cardShadow : 'none',
      opacity: opacity,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  }

  // Utility per stili button
  getButtonStyles(themeName, variant = 'primary', state = 'default') {
    const theme = this.getThemeConfig(themeName);
    
    const baseStyles = {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.cardBorder}`,
      color: theme.textPrimary,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden'
    };

    const variants = {
      primary: {
        default: { background: theme.buttonBg },
        hover: { background: theme.buttonHover },
        active: { background: theme.buttonActive }
      },
      success: {
        default: { background: theme.successBg, borderColor: theme.successBorder },
        hover: { background: theme.successBorder, transform: 'translateY(-1px)' },
        active: { transform: 'translateY(0)' }
      },
      danger: {
        default: { background: theme.errorBg, borderColor: theme.errorBorder },
        hover: { background: theme.errorBorder, transform: 'translateY(-1px)' },
        active: { transform: 'translateY(0)' }
      },
      warning: {
        default: { background: theme.warningBg, borderColor: theme.warningBorder },
        hover: { background: theme.warningBorder, transform: 'translateY(-1px)' },
        active: { transform: 'translateY(0)' }
      }
    };

    return {
      ...baseStyles,
      ...variants[variant][state]
    };
  }

  // Utility per input styles
  getInputStyles(themeName, state = 'default') {
    const theme = this.getThemeConfig(themeName);
    
    const baseStyles = {
      background: theme.inputBg,
      border: `1px solid ${theme.inputBorder}`,
      borderRadius: theme.borderRadius.md,
      color: theme.textPrimary,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '::placeholder': {
        color: theme.textTertiary
      }
    };

    const states = {
      default: baseStyles,
      focus: {
        ...baseStyles,
        background: theme.inputFocus,
        borderColor: theme.textAccent,
        boxShadow: `0 0 0 3px ${theme.textAccent}33`
      },
      error: {
        ...baseStyles,
        borderColor: theme.errorBorder,
        boxShadow: `0 0 0 3px ${theme.errorBorder}33`
      }
    };

    return states[state];
  }

  // Genera gradiente animato per background
  getAnimatedBackground(themeName, temperature) {
    const theme = this.getThemeConfig(themeName);
    
    if (temperature >= 30) {
      return `linear-gradient(-45deg, ${theme.warm}, ${theme.primary}, ${theme.warm}, ${theme.secondary})`;
    } else if (temperature <= 10) {
      return `linear-gradient(-45deg, ${theme.cold}, ${theme.primary}, ${theme.cold}, ${theme.secondary})`;
    } else if (temperature >= 20) {
      return `linear-gradient(-45deg, ${theme.secondary}, ${theme.primary}, ${theme.secondary}, ${theme.warm})`;
    } else {
      return `linear-gradient(-45deg, ${theme.primary}, ${theme.secondary}, ${theme.primary}, ${theme.cold})`;
    }
  }
}

export default new ThemeService();