
/* =========================================
   GCS — GRAND CITY STORIES
   PK GAMES
   CORE GAME CONFIGURATION
========================================= */

export const GAME_CONFIG = {
  title: "GCS — GRAND CITY STORIES",
  studio: "PK GAMES",
  creator: "PINTU KUMAR",
  city: "ANGEL VALLEY",
  tagline: "THE CITY NEVER SLEEPS",

  version: "1.0.0",

  // Landscape game display
  display: {
    preferredOrientation: "landscape",
    referenceWidth: 1920,
    referenceHeight: 1080,
    fullScreen: true
  },

  // 3D graphics settings
  graphics: {
    shadows: true,
    antialias: true,
    pixelRatioLimit: 1.5,
    viewDistance: 2500,
    fog: true
  },

  // World settings
  world: {
    name: "ANGEL VALLEY",
    openWorld: true,
    automaticDayNight: true,
    movingClouds: true,
    dynamicWeather: true,
    trafficSystem: true,
    pedestrianSystem: true
  },

  // Initial game modes
  modes: [
    "FREE WORLD",
    "CHOR POLICE",
    "ADVENTURE",
    "MULTIPLAYER"
  ],

  // Initial vehicle targets
  vehicles: {
    cars: 30,
    bikes: 20,
    commercial: 8,
    aircraft: 4,
    special: 8,
    total: 70
  }
};

export const WORLD_CONFIG = {
  citySize: 12000,
  groundSize: 12000,
  roadWidth: 18,
  districtCount: 10
};

export const PERFORMANCE_CONFIG = {
  targetFPS: 60,
  lowMemoryMode: false,
  adaptivePixelRatio: true
};
