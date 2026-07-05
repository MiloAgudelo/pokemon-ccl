import Phaser from 'phaser';
import { GAME_WIDTH, TEXT_STYLE, SCENE_KEYS, REGISTRY_KEYS } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { guardarLocal, leerLocal } from '../systems/almacen.js';

const LARGO_MAX = 10;

// Input de nombre: campo HTML superpuesto (teclado nativo en móvil) con
// estilo GBA. El nombre se guarda en el registry y en localStorage.
export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.NAME_INPUT);
  }

  create() {
    entrarConFundido(this);

    this.add
      .text(GAME_WIDTH / 2, 44, '¿Cuál es tu nombre,', TEXT_STYLE)
      .setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 56, 'entrenador?', TEXT_STYLE).setOrigin(0.5);

    const guardado = leerLocal('nombre') || '';
    const html = `<input type="text" name="nombre" maxlength="${LARGO_MAX}" autocomplete="off"
      value="${guardado.replace(/"/g, '')}"
      style="width: 150px; padding: 5px 2px; font-family: 'Press Start 2P', monospace; font-size: 8px;
      background: #182838; color: #f8f8f8; border: 2px solid #f8f8f8; outline: none;
      text-transform: uppercase; text-align: center;">`;
    this.campo = this.add.dom(GAME_WIDTH / 2, 84).createFromHTML(html);
    const input = this.campo.getChildByName('nombre');
    input.focus();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.confirmar();
    });

    this.aviso = this.add
      .text(GAME_WIDTH / 2, 118, 'ENTER para continuar', { ...TEXT_STYLE, color: '#88a0b8' })
      .setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => this.confirmar());
  }

  confirmar() {
    const input = this.campo.getChildByName('nombre');
    const nombre = input.value.trim().toUpperCase().slice(0, LARGO_MAX);

    if (nombre.length === 0) {
      this.aviso.setText('¡Escribe un nombre!').setColor('#f87858');
      return;
    }

    this.registry.set(REGISTRY_KEYS.NOMBRE, nombre);
    guardarLocal('nombre', nombre);
    irConFundido(this, SCENE_KEYS.AVATAR_SELECT);
  }
}
