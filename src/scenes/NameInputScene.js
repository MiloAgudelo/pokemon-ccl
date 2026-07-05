import Phaser from 'phaser';
import { TEXT_STYLE, SCENE_KEYS, REGISTRY_KEYS, PALETA } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { guardarLocal, leerLocal } from '../systems/almacen.js';
import { FONDO_MENU_KEY } from '../systems/placeholders.js';

const LARGO_MAX = 10;

// Input de nombre: campo HTML superpuesto (teclado nativo en móvil) con
// estilo GBA. El nombre se guarda en el registry y en localStorage.
export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.NAME_INPUT);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    entrarConFundido(this);
    this.add.image(0, 0, FONDO_MENU_KEY).setOrigin(0).setDisplaySize(W, H);

    this.add
      .text(W / 2, H * 0.3, '¿Cuál es tu nombre, entrenador?', TEXT_STYLE)
      .setOrigin(0.5);

    const html = `<input type="text" name="nombre" maxlength="${LARGO_MAX}" autocomplete="off"
      style="width: 180px; padding: 6px 2px; font-family: 'Press Start 2P', monospace; font-size: 8px;
      background: #182838; color: #f8f8f8; border: 2px solid #f8f8f8; outline: none;
      text-transform: uppercase; text-align: center;">`;
    this.campo = this.add.dom(W / 2, H * 0.5).createFromHTML(html);
    const input = this.campo.getChildByName('nombre');
    input.value = leerLocal(REGISTRY_KEYS.NOMBRE) || '';
    input.focus();

    this.aviso = this.add
      .text(W / 2, H * 0.72, 'ENTER/START para continuar', {
        ...TEXT_STYLE,
        color: PALETA.pista,
      })
      .setOrigin(0.5);

    // El teclado de Phaser escucha en window, así que recibe el Enter aunque
    // el foco esté en el input HTML. Solo Enter: Z/Espacio aquí son letras.
    this.input.keyboard.on('keydown-ENTER', (e) => {
      if (!e.repeat) this.confirmar();
    });
  }

  confirmar() {
    const input = this.campo.getChildByName('nombre');
    const nombre = input.value.trim().toUpperCase().slice(0, LARGO_MAX);

    if (nombre.length === 0) {
      this.aviso.setText('¡Escribe un nombre!').setColor(PALETA.error);
      return;
    }

    this.registry.set(REGISTRY_KEYS.NOMBRE, nombre);
    guardarLocal(REGISTRY_KEYS.NOMBRE, nombre);
    irConFundido(this, SCENE_KEYS.AVATAR_SELECT);
  }
}
