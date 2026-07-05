import Phaser from 'phaser';
import { GAME_WIDTH, SCENE_KEYS } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { OAK_KEY } from '../systems/placeholders.js';

// Intro del Profesor Oak: su sprite en pantalla y la carta (pantalla 2 de la
// Ayuda) como diálogo con el nombre del jugador interpolado. Al terminar el
// diálogo, fundido y arranca la exploración.
export default class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.INTRO);
  }

  create() {
    entrarConFundido(this);

    this.add.image(GAME_WIDTH / 2, 52, OAK_KEY).setOrigin(0.5, 0.5).setScale(2);

    // El diálogo (escena overlay) pausa esta escena y la reanuda al cerrar.
    this.events.once(Phaser.Scenes.Events.RESUME, () => {
      irConFundido(this, SCENE_KEYS.WORLD);
    });
    this.scene.launch(SCENE_KEYS.DIALOGUE, {
      contentId: 'intro_oak',
      escenaPadre: SCENE_KEYS.INTRO,
    });
    this.scene.pause();
  }
}
