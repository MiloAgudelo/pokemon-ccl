import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ZOOM } from './config.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import NameInputScene from './scenes/NameInputScene.js';
import AvatarSelectScene from './scenes/AvatarSelectScene.js';
import IntroScene from './scenes/IntroScene.js';
import WorldScene from './scenes/WorldScene.js';
import DialogueScene from './scenes/DialogueScene.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  zoom: ZOOM,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#000000',
  dom: { createContainer: true }, // para el input HTML del nombre
  scene: [
    BootScene,
    TitleScene,
    NameInputScene,
    AvatarSelectScene,
    IntroScene,
    WorldScene,
    DialogueScene,
  ],
});

// Handle de inspección para depurar desde la consola del navegador (solo dev).
if (import.meta.env.DEV) {
  window.__JUEGO = juego;
}
