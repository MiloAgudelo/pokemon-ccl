import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ZOOM } from './config.js';
import BootScene from './scenes/BootScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  zoom: ZOOM,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#000000',
  scene: [BootScene],
});
