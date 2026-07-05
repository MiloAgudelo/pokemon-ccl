import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS, REGISTRY_KEYS, PALETA } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { guardarLocal, leerLocal } from '../systems/almacen.js';
import { alPresionarAccion } from '../systems/controles.js';
import { FONDO_MENU_KEY } from '../systems/placeholders.js';

const OPCIONES = [
  { key: 'rover_m', etiqueta: 'ROVER' },
  { key: 'rover_f', etiqueta: 'ROVER' },
];
const NOMBRES = ['HOMBRE', 'MUJER'];
const POSICIONES_X = [GAME_WIDTH / 3, (GAME_WIDTH / 3) * 2];
const SPRITE_Y = GAME_HEIGHT * 0.55;
const ESCALA_SPRITE = 3;

// Selección de avatar: dos Rovers lado a lado, flechas para elegir, acción
// para confirmar.
export default class AvatarSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.AVATAR_SELECT);
  }

  create() {
    entrarConFundido(this);
    this.add.image(0, 0, FONDO_MENU_KEY).setOrigin(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.15, 'Elige tu Rover', TEXT_STYLE).setOrigin(0.5);

    OPCIONES.forEach((opcion, i) => {
      this.add
        .sprite(POSICIONES_X[i], SPRITE_Y, opcion.key, 0)
        .setOrigin(0.5, 1)
        .setScale(ESCALA_SPRITE);
      this.add
        .text(POSICIONES_X[i], SPRITE_Y + 14, NOMBRES[i], { ...TEXT_STYLE, color: PALETA.pista })
        .setOrigin(0.5);
    });

    this.marco = this.add
      .rectangle(POSICIONES_X[0], SPRITE_Y - (32 * ESCALA_SPRITE) / 2, 16 * ESCALA_SPRITE + 12, 32 * ESCALA_SPRITE + 14)
      .setStrokeStyle(1, PALETA.acentoHex);

    const guardado = OPCIONES.findIndex((o) => o.key === leerLocal(REGISTRY_KEYS.AVATAR));
    this.seleccion = guardado >= 0 ? guardado : 0;
    this.actualizarMarco();

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.88, 'A/Z/ENTER para confirmar', {
        ...TEXT_STYLE,
        color: PALETA.pista,
      })
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
