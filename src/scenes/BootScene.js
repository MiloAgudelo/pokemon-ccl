import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS, FONT_FAMILY } from '../config.js';
import { createTilesetTexture, createPlayerTexture } from '../systems/placeholders.js';
import { crearAnimacionesCaminata } from '../systems/GridMovement.js';
import { MAP_KEY } from './WorldScene.js';
import mapaPrueba from '../data/map_test.json';

// Avatares del jugador: se carga el PNG real [MILO] si ya existe en
// /assets/sprites/; si no, se genera un placeholder. La existencia se chequea
// con un HEAD silencioso para no llenar la consola de 404 esperados.
const AVATARES = [
  { key: 'rover_m', url: '/sprites/rover_m.png', colorPlaceholder: '#d05038' },
  { key: 'rover_f', url: '/sprites/rover_f.png', colorPlaceholder: '#7048c8' },
];

async function existeImagen(url) {
  try {
    const respuesta = await fetch(url, { method: 'HEAD' });
    return respuesta.ok && (respuesta.headers.get('content-type') || '').startsWith('image/');
  } catch {
    return false;
  }
}

// Escena inicial: carga assets (con placeholders para los faltantes),
// espera la fuente y arranca el juego.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create() {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CCL 2026', { ...TEXT_STYLE, fontSize: '16px' })
      .setOrigin(0.5);

    createTilesetTexture(this);
    this.cache.tilemap.add(MAP_KEY, { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapaPrueba });

    // El texto in-game depende de Press Start 2P; no se arranca sin ella
    // (o sin que el navegador reporte el fallo, para no colgar el juego).
    const fuenteLista = document.fonts.load(`8px ${FONT_FAMILY}`).catch(() => {});

    Promise.all([this.cargarAvatares(), fuenteLista]).then(() =>
      this.scene.start(SCENE_KEYS.WORLD)
    );
  }

  async cargarAvatares() {
    const disponibles = await Promise.all(AVATARES.map(({ url }) => existeImagen(url)));
    const reales = AVATARES.filter((_, i) => disponibles[i]);

    if (reales.length > 0) {
      await new Promise((resolver) => {
        reales.forEach(({ key, url }) => {
          this.load.spritesheet(key, url, { frameWidth: 16, frameHeight: 32 });
        });
        this.load.once('complete', resolver);
        this.load.start();
      });
    }

    AVATARES.forEach(({ key, colorPlaceholder }) => {
      if (!this.textures.exists(key)) createPlayerTexture(this, key, colorPlaceholder);
      crearAnimacionesCaminata(this, key);
    });
  }
}
