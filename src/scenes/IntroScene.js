import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { OAK_KEY, FONDO_MENU_KEY } from '../systems/placeholders.js';

// Intro del Profesor Oak: su sprite en pantalla y la carta (pantalla 2 de la
// Ayuda) como diálogo con el nombre del jugador interpolado. Al terminar el
// diálogo (o saltarlo con B/ESC/Select), fundido y arranca la exploración.
export default class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.INTRO);
  }

  create() {
    entrarConFundido(this);
    this.add.image(0, 0, FONDO_MENU_KEY).setOrigin(0);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT * 0.3, OAK_KEY).setScale(3);
    this.add
      .text(GAME_WIDTH - 8, 8, 'B/ESC: saltar', { ...TEXT_STYLE, color: '#88a0b8' })
      .setOrigin(1, 0);

    this.events.once(Phaser.Scenes.Events.RESUME, () => {
      irConFundido(this, SCENE_KEYS.WORLD);
    });

    // El diálogo se lanza cuando el fade-in TERMINA: pausar la escena con el
    // fundido a medias congelaría la cámara en negro (bug corregido).
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      this.scene.launch(SCENE_KEYS.DIALOGUE, {
        contentId: 'intro_oak',
        escenaPadre: SCENE_KEYS.INTRO,
      });
      this.scene.pause();
    });
  }
}
