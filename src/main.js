
import { startGameWorld } from "./game.js";

// ========================================
// GCS — GRAND CITY STORIES
// MAIN APPLICATION CONTROLLER
// PK GAMES
// ========================================

const $ = (id) => document.getElementById(id);

const screens = {
  intro: $("studio-intro"),
  loading: $("loading-screen"),
  menu: $("main-menu"),
  modes: $("mode-select"),
  game: $("game-screen"),
  error: $("error-screen")
};

let gameSession = null;
let launchInProgress = false;
let loadingTimer = null;
let loadingProgress = 0;

// ----------------------------------------
// SCREEN CONTROL
// ----------------------------------------

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => {
    if (screen) screen.hidden = true;
  });

  if (screens[screenName]) {
    screens[screenName].hidden = false;
  }
}

function showNotice(message) {
  let notice = $("gcs-notice");

  if (!notice) {
    notice = document.createElement("div");
    notice.id = "gcs-notice";

    Object.assign(notice.style, {
      position: "fixed",
      left: "50%",
      bottom: "28px",
      transform: "translateX(-50%)",
      zIndex: "9999",
      padding: "13px 20px",
      maxWidth: "85%",
      background: "rgba(8, 11, 18, 0.96)",
      color: "#f3d69a",
      border: "1px solid rgba(211, 170, 99, 0.6)",
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
      letterSpacing: "1px",
      textAlign: "center",
      boxShadow: "0 8px 30px rgba(0,0,0,0.4)"
    });

    document.body.appendChild(notice);
  }

  notice.textContent = message;
  notice.hidden = false;

  clearTimeout(notice.hideTimer);

  notice.hideTimer = setTimeout(() => {
    notice.hidden = true;
  }, 3000);
}

// ----------------------------------------
// LOADING SCREEN
// ----------------------------------------

function updateLoadingProgress(value, status) {
  loadingProgress = Math.max(0, Math.min(100, value));

  const progress = $("loading-progress");
  const statusText = $("loading-status");

  if (progress) {
    progress.style.width = `${loadingProgress}%`;
  }

  if (statusText && status) {
    statusText.textContent = status;
  }
}

function stopLoadingTimer() {
  if (loadingTimer !== null) {
    clearInterval(loadingTimer);
    loadingTimer = null;
  }
}

// ----------------------------------------
// STOP CURRENT GAME
// ----------------------------------------

function stopCurrentGame() {
  if (gameSession) {
    gameSession.stop();
    gameSession = null;
  }

  const container = $("game-container");

  if (container) {
    container.replaceChildren();
  }
}

// ----------------------------------------
// START GAME WORLD
// ----------------------------------------

function launchGame() {
  if (launchInProgress || gameSession) return;

  launchInProgress = true;

  stopLoadingTimer();
  updateLoadingProgress(0, "PREPARING ANGEL VALLEY...");
  showScreen("loading");

  const container = $("game-container");

  if (!container) {
    launchInProgress = false;
    showError("Game container was not found.");
    return;
  }

  let progress = 0;

  loadingTimer = setInterval(() => {
    progress = Math.min(progress + 8, 88);

    updateLoadingProgress(
      progress,
      progress < 40
        ? "LOADING CITY..."
        : progress < 75
          ? "PREPARING GAME WORLD..."
          : "INITIALIZING GRAPHICS..."
    );
  }, 100);

  setTimeout(() => {
    stopLoadingTimer();

    try {
      updateLoadingProgress(94, "STARTING ANGEL VALLEY...");
      showScreen("game");

      gameSession = startGameWorld(
        container,
        () => {
          updateLoadingProgress(100, "WORLD READY");
        }
      );

      launchInProgress = false;
    } catch (error) {
      launchInProgress = false;

      const message =
        error && error.message
          ? error.message
          : "Unable to initialize the 3D game.";

      showError(message);
    }
  }, 1200);
}

// ----------------------------------------
// ERROR SCREEN
// ----------------------------------------

function showError(message) {
  stopLoadingTimer();
  stopCurrentGame();

  launchInProgress = false;

  const errorText = $("error-message");

  if (errorText) {
    errorText.textContent = message;
  }

  showScreen("error");
}

// ----------------------------------------
// MAIN MENU BUTTONS
// ----------------------------------------

$("continue-button")?.addEventListener("click", () => {
  // Save/load system will be added later.
  launchGame();
});

$("new-game-button")?.addEventListener("click", () => {
  stopCurrentGame();
  launchGame();
});

$("game-modes-button")?.addEventListener("click", () => {
  showScreen("modes");
});

$("settings-button")?.addEventListener("click", () => {
  showNotice("SETTINGS SYSTEM — COMING IN A FUTURE UPDATE");
});

$("social-button")?.addEventListener("click", () => {
  showNotice("PK GAMES SOCIAL CLUB — COMING SOON");
});

$("quit-button")?.addEventListener("click", () => {
  showNotice("YOU CAN CLOSE THE GAME TAB TO EXIT");
});

// ----------------------------------------
// GAME MODE BUTTONS
// ----------------------------------------

$("free-world")?.addEventListener("click", () => {
  launchGame();
});

$("chor-police")?.addEventListener("click", () => {
  showNotice("CHOR POLICE MODE — UNDER DEVELOPMENT");
});

$("adventure")?.addEventListener("click", () => {
  showNotice("ADVENTURE MODE — UNDER DEVELOPMENT");
});

$("multiplayer")?.addEventListener("click", () => {
  showNotice("MULTIPLAYER MODE — UNDER DEVELOPMENT");
});

$("back-to-menu")?.addEventListener("click", () => {
  showScreen("menu");
});

// ----------------------------------------
// IN-GAME BUTTONS
// ----------------------------------------

$("exit-world-button")?.addEventListener("click", () => {
  stopCurrentGame();
  showScreen("menu");
});

$("error-back-button")?.addEventListener("click", () => {
  stopCurrentGame();
  showScreen("menu");
});

// ----------------------------------------
// STUDIO INTRO
// ----------------------------------------

function startApplication() {
  showScreen("intro");

  setTimeout(() => {
    if (!gameSession && !launchInProgress) {
      showScreen("menu");
    }
  }, 3200);
}

// ----------------------------------------
// CLEANUP
// ----------------------------------------

window.addEventListener("pagehide", () => {
  stopLoadingTimer();
  stopCurrentGame();
});

// ----------------------------------------
// INITIALIZE GCS
// ----------------------------------------

startApplication();
      
