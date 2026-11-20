
import * as THREE from "three";

// ========================================
// GCS — PLAYER & MOBILE CONTROL SYSTEM
// PK GAMES
// ========================================

export function createPlayer(scene, camera) {
  const player = new THREE.Group();

  // PLAYER BODY
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x263b50,
    roughness: 0.8
  });

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xc58d68,
    roughness: 0.85
  });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.42, 0.65, 4, 8),
    bodyMaterial
  );

  body.position.y = 1.05;
  body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.27, 16, 12),
    skinMaterial
  );

  head.position.y = 1.85;
  head.castShadow = true;
  player.add(head);

  const legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.65, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x17212c })
  );

  legs.position.y = 0.38;
  legs.castShadow = true;
  player.add(legs);

  player.position.set(0, 0, 0);
  scene.add(player);

  // MOVEMENT STATE
  const keys = {};
  const joystick = { x: 0, y: 0 };

  let sprinting = false;
  let cameraYaw = 0;
  let cameraPitch = 0.22;
  let disposed = false;

  const normalSpeed = 12;
  const sprintSpeed = 19;
  const cameraDistance = 8;

  // ------------------------------------
  // KEYBOARD CONTROLS
  // ------------------------------------

  function onKeyDown(event) {
    keys[event.code] = true;

    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
        .includes(event.code)
    ) {
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    keys[event.code] = false;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // ------------------------------------
  // MOBILE CONTROL INTERFACE
  // ------------------------------------

  const gameScreen = document.getElementById("game-screen");

  const controls = document.createElement("div");
  controls.id = "gcs-mobile-controls";

  Object.assign(controls.style, {
    position: "absolute",
    inset: "0",
    zIndex: "20",
    pointerEvents: "none",
    overflow: "hidden",
    touchAction: "none"
  });

  const lookArea = document.createElement("div");

  Object.assign(lookArea.style, {
    position: "absolute",
    right: "0",
    bottom: "0",
    width: "55%",
    height: "78%",
    pointerEvents: "auto",
    touchAction: "none"
  });

  const joystickBase = document.createElement("div");

  Object.assign(joystickBase.style, {
    position: "absolute",
    left: "25px",
    bottom: "25px",
    width: "112px",
    height: "112px",
    borderRadius: "50%",
    background: "rgba(12, 20, 30, 0.48)",
    border: "2px solid rgba(255,255,255,0.5)",
    pointerEvents: "auto",
    touchAction: "none"
  });

  const joystickKnob = document.createElement("div");

  Object.assign(joystickKnob.style, {
    position: "absolute",
    width: "48px",
    height: "48px",
    left: "30px",
    top: "30px",
    borderRadius: "50%",
    background: "rgba(225, 190, 125, 0.9)",
    border: "2px solid rgba(255,255,255,0.8)",
    boxShadow: "0 3px 12px rgba(0,0,0,0.4)",
    pointerEvents: "none"
  });

  joystickBase.appendChild(joystickKnob);

  const sprintButton = document.createElement("button");
  sprintButton.textContent = "SPRINT";

  Object.assign(sprintButton.style, {
    position: "absolute",
    right: "28px",
    bottom: "32px",
    width: "82px",
    height: "54px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.7)",
    background: "rgba(15, 25, 38, 0.78)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "12px",
    letterSpacing: "1px",
    pointerEvents: "auto",
    touchAction: "none"
  });

  controls.appendChild(lookArea);
  controls.appendChild(joystickBase);
  controls.appendChild(sprintButton);

  if (gameScreen) {
    gameScreen.appendChild(controls);
  }

  // ------------------------------------
  // JOYSTICK INPUT
  // ------------------------------------

  let joystickPointer = null;

  function updateJoystick(event) {
    const rect = joystickBase.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const maxDistance = 38;
    const distance = Math.hypot(dx, dy);

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    joystick.x = dx / maxDistance;
    joystick.y = dy / maxDistance;

    joystickKnob.style.transform =
      `translate(${dx}px, ${dy}px)`;
  }

  function resetJoystick() {
    joystickPointer = null;
    joystick.x = 0;
    joystick.y = 0;
    joystickKnob.style.transform = "translate(0px, 0px)";
  }

  joystickBase.addEventListener("pointerdown", (event) => {
    event.preventDefault();

    joystickPointer = event.pointerId;
    joystickBase.setPointerCapture(event.pointerId);

    updateJoystick(event);
  });

  joystickBase.addEventListener("pointermove", (event) => {
    if (event.pointerId !== joystickPointer) return;
    updateJoystick(event);
  });

  joystickBase.addEventListener("pointerup", (event) => {
    if (event.pointerId === joystickPointer) resetJoystick();
  });

  joystickBase.addEventListener("pointercancel", resetJoystick);

  // ------------------------------------
  // CAMERA LOOK CONTROL
  // ------------------------------------

  let lookPointer = null;
  let lastLookX = 0;
  let lastLookY = 0;

  lookArea.addEventListener("pointerdown", (event) => {
    event.preventDefault();

    lookPointer = event.pointerId;
    lastLookX = event.clientX;
    lastLookY = event.clientY;

    lookArea.setPointerCapture(event.pointerId);
  });

  lookArea.addEventListener("pointermove", (event) => {
    if (event.pointerId !== lookPointer) return;

    const deltaX = event.clientX - lastLookX;
    const deltaY = event.clientY - lastLookY;

    cameraYaw -= deltaX * 0.006;
    cameraPitch += deltaY * 0.003;

    cameraPitch = THREE.MathUtils.clamp(
      cameraPitch,
      -0.05,
      0.65
    );

    lastLookX = event.clientX;
    lastLookY = event.clientY;
  });

  function resetLook() {
    lookPointer = null;
  }

  lookArea.addEventListener("pointerup", resetLook);
  lookArea.addEventListener("pointercancel", resetLook);

  // ------------------------------------
  // SPRINT BUTTON
  // ------------------------------------

  sprintButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    sprinting = true;
    sprintButton.style.background = "rgba(170, 125, 65, 0.95)";
  });

  function stopSprint() {
    sprinting = false;
    sprintButton.style.background = "rgba(15, 25, 38, 0.78)";
  }

  sprintButton.addEventListener("pointerup", stopSprint);
  sprintButton.addEventListener("pointercancel", stopSprint);
  sprintButton.addEventListener("lostpointercapture", stopSprint);

  // ------------------------------------
  // GAME UPDATE
  // ------------------------------------

  const cameraTarget = new THREE.Vector3();

  function update(delta) {
    if (disposed) return;

    const forward =
      keys.KeyW || keys.ArrowUp ? 1 :
      keys.KeyS || keys.ArrowDown ? -1 : 0;

    const sideways =
      keys.KeyD || keys.ArrowRight ? 1 :
      keys.KeyA || keys.ArrowLeft ? -1 : 0;

    let inputX = sideways + joystick.x;
    let inputY = -forward + joystick.y;

    const inputLength = Math.hypot(inputX, inputY);

    if (inputLength > 1) {
      inputX /= inputLength;
      inputY /= inputLength;
    }

    const forwardX = Math.sin(cameraYaw);
    const forwardZ = -Math.cos(cameraYaw);

    const rightX = Math.cos(cameraYaw);
    const rightZ = Math.sin(cameraYaw);

    const moveX =
      rightX * inputX + forwardX * -inputY;

    const moveZ =
      rightZ * inputX + forwardZ * -inputY;

    const moving = Math.hypot(moveX, moveZ) > 0.01;

    if (moving) {
      const speed =
        sprinting || keys.ShiftLeft
          ? sprintSpeed
          : normalSpeed;

      player.position.x += moveX * speed * delta;
      player.position.z += moveZ * speed * delta;

      player.rotation.y = Math.atan2(moveX, moveZ);
    }

    // THIRD-PERSON CAMERA
    const horizontalDistance =
      cameraDistance * Math.cos(cameraPitch);

    cameraTarget.set(
      player.position.x + Math.sin(cameraYaw) * horizontalDistance,
      player.position.y + 3.2 + cameraDistance * Math.sin(cameraPitch),
      player.position.z + Math.cos(cameraYaw) * horizontalDistance
    );

    camera.position.lerp(
      cameraTarget,
      Math.min(1, delta * 5)
    );

    camera.lookAt(
      player.position.x,
      player.position.y + 1.3,
      player.position.z
    );
  }

  // ------------------------------------
  // CLEANUP
  // ------------------------------------

  function dispose() {
    disposed = true;

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);

    controls.remove();

    body.geometry.dispose();
    body.material.dispose();

    head.geometry.dispose();
    head.material.dispose();

    legs.geometry.dispose();
    legs.material.dispose();

    skinMaterial.dispose();

    scene.remove(player);
  }

  return {
    player,
    update,
    dispose
  };
}
   
