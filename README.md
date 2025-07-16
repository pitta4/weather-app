# Weather App

A modern weather application built with React and Vite, featuring real-time weather data, forecasts, charts, and interactive maps.

## Features

- 🌤️ Current weather conditions
- 📊 Hourly forecasts with charts
- 🗺️ Interactive weather maps
- ⚠️ Weather alerts and notifications
- ⭐ Favorites management
- 🎨 Theme switching
- 📱 Responsive design

## Tech Stack

- **React 19** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pitta4/weather-app.git
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` and add your OpenWeather API key (get one free at https://openweathermap.org/api)

4. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

This app can be easily deployed to:
- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [GitHub Pages](https://pages.github.com/)

## License

MIT License
