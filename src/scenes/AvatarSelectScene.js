import Phaser from 'phaser';
import { TEXT_STYLE, SCENE_KEYS, REGISTRY_KEYS, PALETA } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { guardarLocal, leerLocal } from '../systems/almacen.js';
import { alPresionarAccion } from '../systems/controles.js';
import { ponerFondoMenu } from '../systems/placeholders.js';

const OPCIONES = [
  { key: 'rover_m', etiqueta: 'ROVER' },
  { key: 'rover_f', etiqueta: 'ROVER' },
];
const NOMBRES = ['HOMBRE', 'MUJER'];
const ESCALA_SPRITE = 3;

// Selección de avatar: dos Rovers lado a lado, flechas para elegir, acción
// para confirmar.
export default class AvatarSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.AVATAR_SELECT);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.posicionesX = [W / 3, (W / 3) * 2];
    const spriteY = H * 0.55;
    this.spriteY = spriteY;

    entrarConFundido(this);
    ponerFondoMenu(this);

    this.add.text(W / 2, H * 0.15, 'Elige tu Rover', TEXT_STYLE).setOrigin(0.5);

    OPCIONES.forEach((opcion, i) => {
      this.add
        .sprite(this.posicionesX[i], spriteY, opcion.key, 0)
        .setOrigin(0.5, 1)
        .setScale(ESCALA_SPRITE);
      this.add
        .text(this.posicionesX[i], spriteY + 14, NOMBRES[i], { ...TEXT_STYLE, color: PALETA.pista })
        .setOrigin(0.5);
    });

    this.marco = this.add
      .rectangle(
        this.posicionesX[0],
        spriteY - (32 * ESCALA_SPRITE) / 2,
        16 * ESCALA_SPRITE + 12,
        32 * ESCALA_SPRITE + 14
      )
      .setStrokeStyle(1, PALETA.acentoHex);

    const guardado = OPCIONES.findIndex((o) => o.key === leerLocal(REGISTRY_KEYS.AVATAR));
    this.seleccion = guardado >= 0 ? guardado : 0;
    this.actualizarMarco();

    this.add
      .text(W / 2, H * 0.88, 'A/Z/ENTER para confirmar', {
        ...TEXT_STYLE,
        color: PALETA.pista,
      })
      .setOrigin(0.5);

    ['keydown-LEFT', 'keydown-A'].forEach((ev) => this.input.keyboard.on(ev, () => this.mover(-1)));
    ['keydown-RIGHT', 'keydown-D'].forEach((ev) => this.input.keyboard.on(ev, () => this.mover(1)));
    alPresionarAccion(this, () => this.confirmar(), { conTap: false });
    // Tap: primero selecciona; tap sobre la opción ya seleccionada confirma.
    this.input.on('pointerdown', (puntero) => {
      const tocada = puntero.worldX < W / 2 ? 0 : 1;
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
    this.marco.setX(this.posicionesX[this.seleccion]);
  }

  confirmar() {
    const avatar = OPCIONES[this.seleccion].key;
    this.registry.set(REGISTRY_KEYS.AVATAR, avatar);
    guardarLocal(REGISTRY_KEYS.AVATAR, avatar);
    irConFundido(this, SCENE_KEYS.INTRO);
  }
}
