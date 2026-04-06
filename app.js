"use strict";

// Shared game state object. Add your own values as needed.
const gameState = {
  isRunning: false,
  lastFrameTime: 0,
  score: 0,
  pointer: {
    x: 0,
    y: 0,
    isDown: false,
  },
};

const gameRoot = document.getElementById("game-root");
const startButton = document.getElementById("start-button");

function init() {
  bindInputEvents();
  startButton?.addEventListener("click", startGame);
  render();
}

function bindInputEvents() {
  // Handle mouse / touch / stylus input in one set of pointer events.
  window.addEventListener("pointerdown", (event) => {
    gameState.pointer.isDown = true;
    gameState.pointer.x = event.clientX;
    gameState.pointer.y = event.clientY;
  });

  window.addEventListener("pointermove", (event) => {
    gameState.pointer.x = event.clientX;
    gameState.pointer.y = event.clientY;
  });

  window.addEventListener("pointerup", () => {
    gameState.pointer.isDown = false;
  });
}

function startGame() {
  if (gameState.isRunning) return;

  gameState.isRunning = true;
  gameState.lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  if (!gameState.isRunning) return;

  const deltaTime = (currentTime - gameState.lastFrameTime) / 1000;
  gameState.lastFrameTime = currentTime;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

function update(_deltaTime) {
  // TODO: Add gameplay logic here.
}

function render() {
  // Keep the DOM update simple so this starter stays easy to edit.
  gameRoot?.setAttribute(
    "data-status",
    gameState.isRunning ? "running" : "ready"
  );
}

function resetGame() {
  gameState.isRunning = false;
  gameState.score = 0;
  gameState.pointer.x = 0;
  gameState.pointer.y = 0;
  gameState.pointer.isDown = false;
  gameState.lastFrameTime = 0;
  render();
}

init();

// Expose helpers in case you want to test quickly from DevTools.
window.game = {
  state: gameState,
  startGame,
  resetGame,
};
