# Energy Grid Intelligence

A modern, real-time dashboard for visualizing European electricity grid data, power generation mixes, and weather overlays.

## Features

* **Interactive Map:** Select European countries using the interactive map to view localized grid data.
* **Live Grid Metrics:** Monitor real-time energy demand, solar, wind, hydro, and fossil fuel generation.
* **Visual Analytics:** Dynamic area charts showing the generation mix and grid load over the past 24 hours.
* **Weather Integration:** Correlate renewable energy generation with live weather data (cloud cover, wind speed, temperature).

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS
* **Charts & Maps:** Recharts, React Simple Maps
* **APIs:** Energy-Charts API, Open-Meteo API

## Hosting on GitHub Pages

This project is optimized for static hosting platforms like GitHub Pages and operates entirely client-side without a backend server. 

*Note: Some external data sources may enforce CORS restrictions when called from GitHub Pages. A robust mock-data generator fallback is included to ensure the dashboard remains interactive and functional for demonstration purposes if direct API access is blocked.*

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```
