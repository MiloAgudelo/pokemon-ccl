import Phaser from 'phaser';
import { GAME_WIDTH, TEXT_STYLE, SCENE_KEYS, REGISTRY_KEYS } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { guardarLocal, leerLocal } from '../systems/almacen.js';
import { alPresionarAccion } from '../systems/controles.js';

const OPCIONES = [
  { key: 'rover_m', etiqueta: 'ROVER' },
  { key: 'rover_f', etiqueta: 'ROVER' },
];
const NOMBRES = ['HOMBRE', 'MUJER'];
const POSICIONES_X = [80, 160];
const SPRITE_Y = 84;

// Selección de avatar: dos Rovers lado a lado, flechas para elegir, acción
// para confirmar.
export default class AvatarSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.AVATAR_SELECT);
  }

  create() {
    entrarConFundido(this);

    this.add.text(GAME_WIDTH / 2, 24, 'Elige tu Rover', TEXT_STYLE).setOrigin(0.5);

    OPCIONES.forEach((opcion, i) => {
      this.add.sprite(POSICIONES_X[i], SPRITE_Y, opcion.key, 0).setOrigin(0.5, 1).setScale(2);
      this.add
        .text(POSICIONES_X[i], SPRITE_Y + 10, NOMBRES[i], { ...TEXT_STYLE, color: '#88a0b8' })
        .setOrigin(0.5);
    });

    this.marco = this.add
      .rectangle(POSICIONES_X[0], SPRITE_Y - 33, 46, 78)
      .setStrokeStyle(1, 0xf8d048);

    const guardado = OPCIONES.findIndex((o) => o.key === leerLocal(REGISTRY_KEYS.AVATAR));
    this.seleccion = guardado >= 0 ? guardado : 0;
    this.actualizarMarco();

    this.add
      .text(GAME_WIDTH / 2, 140, 'Z/ENTER para confirmar', { ...TEXT_STYLE, color: '#88a0b8' })
      .setOrigin(0.5);

    ['keydown-LEFT', 'keydown-A'].forEach((ev) => this.input.keyboard.on(ev, () => this.mover(-1)));
    ['keydown-RIGHT', 'keydown-D'].forEach((ev) => this.input.keyboard.on(ev, () => this.mover(1)));
    alPresionarAccion(this, () => this.confirmar(), { conTap: false });
    // Tap: primero selecciona; tap sobre la opción ya seleccionada confirma.
    this.input.on('pointerdown', (puntero) => {
      const tocada = puntero.worldX < GAME_WIDTH / 2 ? 0 : 1;
      if (tocada === this.seleccion) {
        this.confirmar();
      } else {
        this.seleccion = tocada;
        this.actualizarMarco();
      }
    });
  }

  mover(delta) {
    this.seleccion = Phaser.Math.Clamp(this.seleccion + delta, 0, OPCIONES.length - 1);
    this.actualizarMarco();
  }

  actualizarMarco() {
    this.marco.setX(POSICIONES_X[this.seleccion]);
  }

  confirmar() {
    const avatar = OPCIONES[this.seleccion].key;
    this.registry.set(REGISTRY_KEYS.AVATAR, avatar);
    guardarLocal(REGISTRY_KEYS.AVATAR, avatar);
    irConFundido(this, SCENE_KEYS.INTRO);
  }
}
