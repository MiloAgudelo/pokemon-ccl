import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS } from '../config.js';
import { getContenido } from '../data/content.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { LOGO_KEY, FONDO_MENU_KEY } from '../systems/placeholders.js';
import { alPresionarAccion } from '../systems/controles.js';

// Title screen: logo (o texto placeholder) + "INICIAR AVENTURA" parpadeante.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TITLE);
  }

  create() {
    entrarConFundido(this);
    this.add.image(0, 0, FONDO_MENU_KEY).setOrigin(0);
    const portada = getContenido('portada');

    if (this.textures.exists(LOGO_KEY)) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT * 0.36, LOGO_KEY);
    } else {
      // Placeholder [MILO]: el logo pixel art llegará a /assets/ui/logo_ccl.png.
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, portada.titulo, { ...TEXT_STYLE, fontSize: '24px' })
        .setOrigin(0.5);
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.42, portada.subtitulo, {
          ...TEXT_STYLE,
          fontSize: '16px',
          color: '#f8d048',
        })
        .setOrigin(0.5);
    }

    const promptY = GAME_HEIGHT * 0.72;
    const prompt = this.add
      .text(GAME_WIDTH / 2 + 6, promptY, portada.prompt, TEXT_STYLE)
      .setOrigin(0.5);
    const flecha = this.add.triangle(
      prompt.x - prompt.width / 2 - 10,
      promptY,
      0, 0, 0, 6, 5, 3,
      0xf8f8f8
    );
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        prompt.setVisible(!prompt.visible);
        flecha.setVisible(prompt.visible);
      },
    });

    alPresionarAccion(this, () => irConFundido(this, SCENE_KEYS.NAME_INPUT));
  }
}
