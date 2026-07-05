import Phaser from 'phaser';
import { SCENE_KEYS } from '../config.js';
import { TILESET_KEY } from '../systems/placeholders.js';
import GridMovement from '../systems/GridMovement.js';

export const MAP_KEY = 'map_test';

const SPAWN = { tileX: 10, tileY: 8 };
const AVATAR_DEFAULT = 'rover_m';

// Escena principal de exploración: tilemap + jugador + cámara.
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.WORLD);
  }

  create() {
    this.mapa = this.make.tilemap({ key: MAP_KEY });
    const tileset = this.mapa.addTilesetImage('placeholder', TILESET_KEY);

    this.mapa.createLayer('suelo', tileset, 0, 0);
    this.colision = this.mapa.createLayer('colision', tileset, 0, 0).setVisible(false);

    // El avatar lo fija la selección de personaje (Fase 3); mientras tanto, default.
    const avatar = this.registry.get('avatar') || AVATAR_DEFAULT;
    this.jugador = this.add.sprite(0, 0, avatar, 0);
    this.movimiento = new GridMovement(this, this.jugador, {
      ...SPAWN,
      estaBloqueado: (tileX, tileY) => this.estaBloqueado(tileX, tileY),
    });

    this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true);

    this.cursores = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const dir = this.direccionPresionada();
    if (dir) {
      this.movimiento.intentarMover(dir);
    } else {
      this.movimiento.detener();
    }
  }

  direccionPresionada() {
    if (this.cursores.left.isDown || this.wasd.A.isDown) return 'izquierda';
    if (this.cursores.right.isDown || this.wasd.D.isDown) return 'derecha';
    if (this.cursores.up.isDown || this.wasd.W.isDown) return 'arriba';
    if (this.cursores.down.isDown || this.wasd.S.isDown) return 'abajo';
    return null;
  }

  estaBloqueado(tileX, tileY) {
    if (tileX < 0 || tileY < 0 || tileX >= this.mapa.width || tileY >= this.mapa.height) {
      return true;
    }
    // La capa de colisión solo tiene tiles en las celdas bloqueadas.
    return this.colision.getTileAt(tileX, tileY) !== null;
  }
}
