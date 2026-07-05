import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS, FONT_FAMILY } from '../config.js';

// Escena inicial: espera la fuente, carga assets y muestra una pantalla de carga simple.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create() {
    const texto = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CCL 2026', { ...TEXT_STYLE, fontSize: '16px' })
      .setOrigin(0.5);

    // La fuente se carga vía @font-face; si el texto se dibujó antes de que
    // estuviera lista, se fuerza un re-render al llegar.
    document.fonts.load(`16px ${FONT_FAMILY}`).then(() => {
      texto.setStyle({ fontFamily: FONT_FAMILY });
      texto.updateText();
    });
  }
}
