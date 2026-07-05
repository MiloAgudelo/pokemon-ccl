import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS, FONT_FAMILY } from '../config.js';
import { createTilesetTexture } from '../systems/placeholders.js';
import { MAP_KEY } from './WorldScene.js';
import mapaPrueba from '../data/map_test.json';

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

    // El texto in-game depende de Press Start 2P; no se arranca hasta tenerla
    // (o hasta que el navegador reporte el fallo, para no colgar el juego).
    document.fonts
      .load(`8px ${FONT_FAMILY}`)
      .catch(() => {})
      .then(() => this.scene.start(SCENE_KEYS.WORLD));
  }
}
