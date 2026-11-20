
/* =========================================
   GCS — GRAND CITY STORIES
   PK GAMES
   ANGEL VALLEY — 3D WORLD
========================================= */

import * as THREE from "three";
import { WORLD_CONFIG } from "./config.js";

export function createWorld(scene) {
  const world = new THREE.Group();
  world.name = "ANGEL_VALLEY_WORLD";
  scene.add(world);

  const materials = {
    ground: new THREE.MeshStandardMaterial({
      color: 0x66745b,
      roughness: 1
    }),

    road: new THREE.MeshStandardMaterial({
      color: 0x252a30,
      roughness: 0.95
    }),

    sidewalk: new THREE.MeshStandardMaterial({
      color: 0x92928b,
      roughness: 1
    }),

    roadLine: new THREE.MeshStandardMaterial({
      color: 0xe7d8a2,
      roughness: 1
    })
  };

  const buildingColors = [
    0x8b9298,
    0xaaa49a,
    0x737d87,
    0xb4aa9b,
    0x666f79,
    0x9b9c91,
    0x858078
  ];

  // SKY AND ATMOSPHERE
  scene.background = new THREE.Color(0x91b8d5);

  scene.fog = new THREE.Fog(
    0x91b8d5,
    1800,
    8500
  );

  const skyLight = new THREE.HemisphereLight(
    0xdcecff,
    0x59604b,
    1.8
  );

  world.add(skyLight);

  const sunLight = new THREE.DirectionalLight(
    0xffe2b5,
    2.2
  );

  sunLight.position.set(500, 1200, 400);
  world.add(sunLight);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
      WORLD_CONFIG.groundSize,
      WORLD_CONFIG.groundSize
    ),
    materials.ground
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  world.add(ground);

  // ROADS
  const roadSpacing = 520;
  const roadWidth = 80;
  const roadCount = 9;
  const cityHalf = (roadCount - 1) * roadSpacing / 2;

  function createRoad(x, z, width, depth) {
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.5, depth),
      materials.road
    );

    road.position.set(x, 0, z);
    world.add(road);
  }

  function createRoadMarking(x, z, width, depth) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.08, depth),
      materials.roadLine
    );

    line.position.set(x, 0.29, z);
    world.add(line);
  }

  for (let i = 0; i < roadCount; i++) {
    const position = -cityHalf + i * roadSpacing;

    // Vertical roads
    createRoad(position, 0, roadWidth, cityHalf * 2 + roadSpacing);

    // Horizontal roads
    createRoad(0, position, cityHalf * 2 + roadSpacing, roadWidth);

    // Dashed road markings
    for (let d = -cityHalf; d <= cityHalf; d += 90) {
      createRoadMarking(position, d, 1.5, 28);
      createRoadMarking(d, position, 28, 1.5);
    }
  }

  // SIDEWALKS
  const sidewalkMaterial = materials.sidewalk;

  for (let i = 0; i < roadCount; i++) {
    const position = -cityHalf + i * roadSpacing;

    for (const side of [-1, 1]) {
      const offset = roadWidth / 2 + 8;

      const verticalSidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(
          12,
          1,
          cityHalf * 2 + roadSpacing
        ),
        sidewalkMaterial
      );

      verticalSidewalk.position.set(
        position + side * offset,
        0,
        0
      );

      world.add(verticalSidewalk);

      const horizontalSidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(
          cityHalf * 2 + roadSpacing,
          1,
          12
        ),
        sidewalkMaterial
      );

      horizontalSidewalk.position.set(
        0,
        0,
        position + side * offset
      );

      world.add(horizontalSidewalk);
    }
  }

  // BUILDINGS
  let seed = 92841;

  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function createBuilding(x, z) {
    const width = 65 + random() * 65;
    const depth = 65 + random() * 65;
    const height = 65 + random() * 280;

    const color = buildingColors[
      Math.floor(random() * buildingColors.length)
    ];

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
      metalness: 0.12
    });

    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMaterial
    );

    building.position.set(
      x,
      height / 2,
      z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    world.add(building);

    // Rooftop structure
    if (random() > 0.55) {
      const roofHeight = 8 + random() * 15;

      const rooftop = new THREE.Mesh(
        new THREE.BoxGeometry(
          width * 0.35,
          roofHeight,
          depth * 0.35
        ),
        buildingMaterial
      );

      rooftop.position.set(
        x,
        height + roofHeight / 2,
        z
      );

      world.add(rooftop);
    }
  }

  // Create city blocks between roads
  for (let x = 0; x < roadCount - 1; x++) {
    for (let z = 0; z < roadCount - 1; z++) {
      const blockX = -cityHalf + (x + 0.5) * roadSpacing;
      const blockZ = -cityHalf + (z + 0.5) * roadSpacing;

      const positions = [
        [-125, -125],
        [125, -125],
        [-125, 125],
        [125, 125]
      ];

      for (const [offsetX, offsetZ] of positions) {
        createBuilding(
          blockX + offsetX,
          blockZ + offsetZ
        );
      }
    }
  }

  // CLOUDS
  const clouds = [];

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1
  });

  function createCloud(x, y, z) {
    const cloud = new THREE.Group();

    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(
          35 + random() * 25,
          8,
          6
        ),
        cloudMaterial
      );

      puff.position.set(
        (i - 2) * 38,
        random() * 15,
        random() * 20
      );

      cloud.add(puff);
    }

    cloud.position.set(x, y, z);
    world.add(cloud);
    clouds.push(cloud);
  }

  for (let i = 0; i < 16; i++) {
    createCloud(
      (random() - 0.5) * 6500,
      650 + random() * 500,
      (random() - 0.5) * 6500
    );
  }

  // AUTOMATIC DAY AND NIGHT
  const dayColor = new THREE.Color(0x91b8d5);
  const sunsetColor = new THREE.Color(0xe58a62);
  const nightColor = new THREE.Color(0x101b35);

  const currentSky = new THREE.Color();

  function update(delta, elapsed) {
    const cycle = (elapsed / 240) % 1;
    const angle = cycle * Math.PI * 2;

    const daylight = Math.max(0, Math.sin(angle));
    const sunsetAmount = Math.pow(
      Math.max(0, 1 - Math.abs(daylight - 0.15) * 5),
      2
    );

    currentSky.copy(dayColor).lerp(
      nightColor,
      1 - daylight
    );

    currentSky.lerp(
      sunsetColor,
      sunsetAmount * 0.65
    );

    scene.background.copy(currentSky);
    scene.fog.color.copy(currentSky);

    sunLight.position.set(
      Math.cos(angle) * 1200,
      Math.sin(angle) * 1400,
      500
    );

    sunLight.intensity = 0.15 + daylight * 2.1;
    skyLight.intensity = 0.35 + daylight * 1.45;

    // Clouds move slowly
    for (const cloud of clouds) {
      cloud.position.x += delta * 5;

      if (cloud.position.x > 4000) {
        cloud.position.x = -4000;
      }
    }
  }

  function dispose() {
    world.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    scene.remove(world);
  }

  return {
    world,
    update,
    dispose
  };
          }
