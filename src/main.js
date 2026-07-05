import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ZOOM } from './config.js';
import BootScene from './scenes/BootScene.js';
import WorldScene from './scenes/WorldScene.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  zoom: ZOOM,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#000000',
  scene: [BootScene, WorldScene],
});

// Handle de inspección para depurar desde la consola del navegador (solo dev).
if (import.meta.env.DEV) {
  window.__JUEGO = juego;
}
