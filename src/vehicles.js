
/* =========================================
   GCS — GRAND CITY STORIES
   PK GAMES
   VEHICLE SYSTEM
========================================= */

import * as THREE from "three";

const VEHICLE_SETTINGS = {
  car: {
    acceleration: 18,
    maxSpeed: 55,
    reverseSpeed: 18,
    turnSpeed: 1.5,
    wheelRadius: 0.38
  },

  bike: {
    acceleration: 24,
    maxSpeed: 75,
    reverseSpeed: 12,
    turnSpeed: 2.1,
    wheelRadius: 0.48
  }
};

export function createVehicle(scene, type = "car", position = [0, 0, 0]) {
  if (!["car", "bike"].includes(type)) {
    throw new Error(`Unsupported vehicle type: ${type}`);
  }

  const settings = VEHICLE_SETTINGS[type];

  const vehicle = new THREE.Group();
  vehicle.name = type === "car" ? "GCS_CAR" : "GCS_BIKE";

  const parts = new THREE.Group();
  vehicle.add(parts);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: type === "car" ? 0x173c68 : 0xc52d27,
    metalness: 0.55,
    roughness: 0.35
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x171c24,
    metalness: 0.2,
    roughness: 0.8
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x263e50,
    metalness: 0.35,
    roughness: 0.2
  });

  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff0c7,
    emissive: 0xffd88a,
    emissiveIntensity: 1.5
  });

  const rearLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xc51c25,
    emissive: 0x9d0710,
    emissiveIntensity: 1
  });

  const wheels = [];

  function addBox(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parts.add(mesh);

    return mesh;
  }

  function addWheel(x, z, radius) {
    const wheel = new THREE.Group();
    wheel.position.set(x, radius, z);

    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        type === "car" ? 0.24 : 0.16,
        20
      ),
      darkMaterial
    );

    // Wheel axle points along the vehicle's X axis
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius * 0.48,
        radius * 0.48,
        type === "car" ? 0.25 : 0.17,
        12
      ),
      bodyMaterial
    );

    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    parts.add(wheel);
    wheels.push(wheel);

    return wheel;
  }

  if (type === "car") {
    // Main body
    addBox(1.9, 0.65, 4.1, bodyMaterial, 0, 0.75, 0);

    // Upper cabin
    addBox(1.55, 0.85, 2.05, glassMaterial, 0, 1.43, -0.25);

    // Roof
    addBox(1.58, 0.12, 1.8, bodyMaterial, 0, 1.88, -0.25);

    // Front and rear bumpers
    addBox(1.95, 0.22, 0.2, darkMaterial, 0, 0.48, 2.05);
    addBox(1.95, 0.22, 0.2, darkMaterial, 0, 0.48, -2.05);

    // Headlights
    addBox(0.35, 0.18, 0.08, lightMaterial, -0.62, 0.85, 2.1);
    addBox(0.35, 0.18, 0.08, lightMaterial, 0.62, 0.85, 2.1);

    // Rear lights
    addBox(0.35, 0.18, 0.08, rearLightMaterial, -0.62, 0.85, -2.1);
    addBox(0.35, 0.18, 0.08, rearLightMaterial, 0.62, 0.85, -2.1);

    // Four wheels
    addWheel(-0.98, 1.3, settings.wheelRadius);
    addWheel(0.98, 1.3, settings.wheelRadius);
    addWheel(-0.98, -1.3, settings.wheelRadius);
    addWheel(0.98, -1.3, settings.wheelRadius);

  } else {
    // Motorcycle chassis
    addBox(0.28, 0.42, 1.15, bodyMaterial, 0, 0.9, 0);

    // Fuel tank
    const tank = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 12),
      bodyMaterial
    );

    tank.scale.set(0.8, 0.75, 1.1);
    tank.position.set(0, 1.25, 0.1);
    parts.add(tank);

    // Seat
    addBox(0.48, 0.16, 0.72, darkMaterial, 0, 1.35, -0.55);

    // Front fork
    addBox(0.12, 0.95, 0.12, darkMaterial, 0, 0.8, 0.8);

    // Handlebar
    addBox(1.05, 0.09, 0.12, darkMaterial, 0, 1.55, 0.78);

    // Front lamp
    addBox(0.3, 0.3, 0.18, lightMaterial, 0, 1.25, 0.9);

    // Rear light
    addBox(0.22, 0.14, 0.12, rearLightMaterial, 0, 1.15, -0.9);

    // Motorcycle wheels
    addWheel(0, 0.95, settings.wheelRadius);
    addWheel(0, -0.95, settings.wheelRadius);
  }

  vehicle.position.set(position[0], position[1], position[2]);
  scene.add(vehicle);

  // Driving input
  const input = {
    accelerate: false,
    brake: false,
    left: false,
    right: false
  };

  let speed = 0;
  let steering = 0;

  function setInput(nextInput = {}) {
    for (const key of Object.keys(input)) {
      if (typeof nextInput[key] === "boolean") {
        input[key] = nextInput[key];
      }
    }
  }

  function resetInput() {
    for (const key of Object.keys(input)) {
      input[key] = false;
    }
  }

  function update(delta) {
    const dt = Math.min(delta, 0.05);

    // Acceleration and braking
    if (input.accelerate) {
      speed += settings.acceleration * dt;
    } else if (input.brake) {
      if (speed > 0.5) {
        speed -= settings.acceleration * 2 * dt;
      } else {
        speed -= settings.acceleration * 0.6 * dt;
      }
    } else {
      // Natural slowdown
      speed *= Math.max(0, 1 - 1.4 * dt);
    }

    speed = THREE.MathUtils.clamp(
      speed,
      -settings.reverseSpeed,
      settings.maxSpeed
    );

    // Steering
    const steeringInput =
      Number(input.right) - Number(input.left);

    steering = THREE.MathUtils.damp(
      steering,
      steeringInput,
      5,
      dt
    );

    const speedFactor = Math.min(
      1,
      Math.abs(speed) / 8
    );

    vehicle.rotation.y +=
      steering *
      settings.turnSpeed *
      speedFactor *
      dt *
      Math.sign(speed || 1);

    // Move vehicle forward or backward
    vehicle.position.x +=
      Math.sin(vehicle.rotation.y) * speed * dt;

    vehicle.position.z +=
      Math.cos(vehicle.rotation.y) * speed * dt;

    // Rotate wheels while moving
    for (const wheel of wheels) {
      wheel.rotation.x +=
        speed * dt / settings.wheelRadius;
    }
  }

  function dispose() {
    resetInput();
    scene.remove(vehicle);

    vehicle.traverse((object) => {
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
  }

  return {
    vehicle,
    get speed() {
      return speed;
    },
    setInput,
    resetInput,
    update,
    dispose
  };
      }
