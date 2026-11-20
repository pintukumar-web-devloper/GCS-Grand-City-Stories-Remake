
/* =========================================
   GCS — GRAND CITY STORIES
   PK GAMES
   MAIN 3D GAME CONTROLLER
========================================= */

import * as THREE from "three";

import { GAME_CONFIG, PERFORMANCE_CONFIG } from "./config.js";
import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createVehicle } from "./vehicles.js";

export function startGameWorld(container, onReady = () => {}) {
  if (!container) {
    throw new Error("Game container not found.");
  }

  let renderer;
  let worldSystem;
  let playerSystem;
  let animationFrame = 0;
  let disposed = false;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    65,
    container.clientWidth / container.clientHeight,
    0.1,
    12000
  );

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: GAME_CONFIG.graphics.antialias,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        GAME_CONFIG.graphics.pixelRatioLimit
      )
    );

    renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight
    );

    renderer.shadowMap.enabled = GAME_CONFIG.graphics.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.replaceChildren(renderer.domElement);

    worldSystem = createWorld(scene);
    playerSystem = createPlayer(scene, camera);

    const clock = new THREE.Clock();
    let elapsed = 0;

    function resize() {
      if (disposed) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          GAME_CONFIG.graphics.pixelRatioLimit
        )
      );
    }

    window.addEventListener("resize", resize);

    function animate() {
      if (disposed) return;

      animationFrame = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      worldSystem.update(delta, elapsed);
      playerSystem.update(delta);

      renderer.render(scene, camera);
    }

    animate();

    onReady({
      city: GAME_CONFIG.city,
      status: "WORLD_READY"
    });

    return {
      scene,
      camera,
      renderer,
      player: playerSystem.player,

      // Vehicle creation interface for future gameplay systems
      createVehicle(type, position = [0, 0, 0]) {
        if (disposed) {
          throw new Error("Game world has been disposed.");
        }

        return createVehicle(scene, type, position);
      },

      stop() {
        if (disposed) return;

        disposed = true;

        cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resize);

        playerSystem.dispose();
        worldSystem.dispose();

        renderer.dispose();
        renderer.domElement.remove();

        container.replaceChildren();
      }
    };

  } catch (error) {
    disposed = true;

    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }

    container.replaceChildren();

    throw error;
  }
      }
