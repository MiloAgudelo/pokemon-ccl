import Phaser from 'phaser';
import { SCENE_KEYS } from '../config.js';
import { TILESET_KEY } from '../systems/placeholders.js';

export const MAP_KEY = 'map_test';

// Escena principal de exploración: tilemap + jugador + cámara.
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.WORLD);
  }

  create() {
    const map = this.make.tilemap({ key: MAP_KEY });
    const tileset = map.addTilesetImage('placeholder', TILESET_KEY);

    map.createLayer('suelo', tileset, 0, 0);
    this.colision = map.createLayer('colision', tileset, 0, 0).setVisible(false);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
