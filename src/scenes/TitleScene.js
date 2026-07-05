import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS } from '../config.js';
import { getContenido } from '../data/content.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { LOGO_KEY } from '../systems/placeholders.js';

// Title screen: logo (o texto placeholder) + "INICIAR AVENTURA" parpadeante.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TITLE);
  }

  create() {
    entrarConFundido(this);
    const portada = getContenido('portada');

    if (this.textures.exists(LOGO_KEY)) {
      this.add.image(GAME_WIDTH / 2, 58, LOGO_KEY);
    } else {
      // Placeholder [MILO]: el logo pixel art llegará a /assets/ui/logo_ccl.png.
      this.add
        .text(GAME_WIDTH / 2, 44, portada.titulo, { ...TEXT_STYLE, fontSize: '16px' })
        .setOrigin(0.5);
      this.add
        .text(GAME_WIDTH / 2, 68, portada.subtitulo, { ...TEXT_STYLE, color: '#f8d048' })
        .setOrigin(0.5);
    }

    const prompt = this.add
      .text(GAME_WIDTH / 2 + 6, 118, portada.prompt, TEXT_STYLE)
      .setOrigin(0.5);
    const flecha = this.add.triangle(
      prompt.x - prompt.width / 2 - 10,
      118,
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

    ['keydown-Z', 'keydown-ENTER', 'keydown-SPACE'].forEach((evento) => {
      this.input.keyboard.on(evento, () => this.iniciar());
    });
    this.input.on('pointerdown', () => this.iniciar());
  }

  iniciar() {
    irConFundido(this, SCENE_KEYS.NAME_INPUT);
  }
}
