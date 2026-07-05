import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import NameInputScene from './scenes/NameInputScene.js';
import AvatarSelectScene from './scenes/AvatarSelectScene.js';
import IntroScene from './scenes/IntroScene.js';
import WorldScene from './scenes/WorldScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import { conectarMarcoGba } from './marcoGba.js';

// Espacio que ocupa el marco de consola GBA alrededor del canvas.
const MARGEN_MARCO_X = 300;
const MARGEN_MARCO_Y = 120;

// Zoom entero más grande que quepa en la ventana (mínimo 1): píxel nítido
// a cualquier tamaño de pantalla.
function calcularZoom() {
  return Math.max(
    1,
    Math.min(
      Math.floor((window.innerWidth - MARGEN_MARCO_X) / GAME_WIDTH),
      Math.floor((window.innerHeight - MARGEN_MARCO_Y) / GAME_HEIGHT)
    )
  );
}

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'consola',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  zoom: calcularZoom(),
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

window.addEventListener('resize', () => {
  juego.scale.setZoom(calcularZoom());
});

conectarMarcoGba();

// Handle de inspección para depurar desde la consola del navegador (solo dev).
if (import.meta.env.DEV) {
  window.__JUEGO = juego;
}
