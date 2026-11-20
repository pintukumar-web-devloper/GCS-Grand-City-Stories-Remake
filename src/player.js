
/* =========================================
   GCS — GRAND CITY STORIES
   PK GAMES
   PLAYER & THIRD-PERSON CAMERA SYSTEM
========================================= */

import * as THREE from "three";

export function createPlayer(scene, camera) {
  const player = new THREE.Group();
  player.name = "GCS_PLAYER";

  // PLAYER MATERIALS
  const clothes = new THREE.MeshStandardMaterial({
    color: 0x26394b,
    roughness: 0.85
  });

  const skin = new THREE.MeshStandardMaterial({
    color: 0xb98260,
    roughness: 0.9
  });

  const trousers = new THREE.MeshStandardMaterial({
    color: 0x20242b,
    roughness: 0.9
  });

  const shoes = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.9
  });

  // BODY
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 1.15, 0.48),
    clothes
  );

  body.position.y = 1.65;
  player.add(body);

  // HEAD
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 12),
    skin
  );

  head.position.y = 2.43;
  player.add(head);

  // LEGS
  const legGeometry = new THREE.BoxGeometry(
    0.3,
    0.85,
    0.36
  );

  const leftLeg = new THREE.Mesh(legGeometry, trousers);
  leftLeg.position.set(-0.22, 0.65, 0);

  const rightLeg = new THREE.Mesh(legGeometry, trousers);
  rightLeg.position.set(0.22, 0.65, 0);

  player.add(leftLeg, rightLeg);

  // SHOES
  const shoeGeometry = new THREE.BoxGeometry(
    0.34,
    0.18,
    0.5
  );

  const leftShoe = new THREE.Mesh(shoeGeometry, shoes);
  leftShoe.position.set(-0.22, 0.16, -0.05);

  const rightShoe = new THREE.Mesh(shoeGeometry, shoes);
  rightShoe.position.set(0.22, 0.16, -0.05);

  player.add(leftShoe, rightShoe);

  // ARMS
  const armGeometry = new THREE.BoxGeometry(
    0.25,
    0.95,
    0.3
  );

  const leftArm = new THREE.Mesh(armGeometry, clothes);
  leftArm.position.set(-0.58, 1.65, 0);

  const rightArm = new THREE.Mesh(armGeometry, clothes);
  rightArm.position.set(0.58, 1.65, 0);

  player.add(leftArm, rightArm);

  // HANDS
  const handGeometry = new THREE.SphereGeometry(
    0.13,
    10,
    8
  );

  const leftHand = new THREE.Mesh(handGeometry, skin);
  leftHand.position.set(-0.58, 1.12, 0);

  const rightHand = new THREE.Mesh(handGeometry, skin);
  rightHand.position.set(0.58, 1.12, 0);

  player.add(leftHand, rightHand);

  player.position.set(0, 0, 0);
  scene.add(player);

  // MOVEMENT SETTINGS
  const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };

  const speed = 12;
  const turnSpeed = 9;

  const keys = {
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "backward",
    ArrowDown: "backward",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right"
  };

  function onKeyDown(event) {
    const action = keys[event.code];

    if (action) {
      movement[action] = true;
    }
  }

  function onKeyUp(event) {
    const action = keys[event.code];

    if (action) {
      movement[action] = false;
    }
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // CAMERA SETTINGS
  const cameraOffset = new THREE.Vector3(0, 5, 10);
  const cameraTarget = new THREE.Vector3();

  camera.position.set(0, 5, 10);
  camera.lookAt(0, 1.5, 0);

  const direction = new THREE.Vector3();
  const desiredCameraPosition = new THREE.Vector3();

  let walkTime = 0;

  function update(delta) {
    const forward = Number(movement.forward) -
      Number(movement.backward);

    const sideways = Number(movement.right) -
      Number(movement.left);

    const moving = forward !== 0 || sideways !== 0;

    if (moving) {
      direction.set(sideways, 0, forward).normalize();

      const targetRotation = Math.atan2(
        direction.x,
        direction.z
      );

      let angleDifference =
        targetRotation - player.rotation.y;

      angleDifference = Math.atan2(
        Math.sin(angleDifference),
        Math.cos(angleDifference)
      );

      player.rotation.y +=
        angleDifference *
        Math.min(1, turnSpeed * delta);

      const moveX = Math.sin(player.rotation.y);
      const moveZ = Math.cos(player.rotation.y);

      player.position.x += moveX * speed * delta;
      player.position.z += moveZ * speed * delta;

      walkTime += delta * 9;

      leftLeg.rotation.x = Math.sin(walkTime) * 0.45;
      rightLeg.rotation.x = -Math.sin(walkTime) * 0.45;

      leftArm.rotation.x = -Math.sin(walkTime) * 0.3;
      rightArm.rotation.x = Math.sin(walkTime) * 0.3;
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
    }

    // FOLLOW CAMERA
    desiredCameraPosition.set(
      player.position.x + cameraOffset.x,
      player.position.y + cameraOffset.y,
      player.position.z + cameraOffset.z
    );

    camera.position.lerp(
      desiredCameraPosition,
      Math.min(1, delta * 5)
    );

    cameraTarget.set(
      player.position.x,
      player.position.y + 1.5,
      player.position.z
    );

    camera.lookAt(cameraTarget);
  }

  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);

    scene.remove(player);

    player.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        object.material.dispose();
      }
    });

    clothes.dispose();
    skin.dispose();
    trousers.dispose();
    shoes.dispose();
  }

  return {
    player,
    update,
    dispose
  };
    }
