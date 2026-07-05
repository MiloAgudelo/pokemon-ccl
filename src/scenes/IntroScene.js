import Phaser from 'phaser';
import { TEXT_STYLE, SCENE_KEYS, PALETA } from '../config.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import { OAK_KEY, ponerFondoMenu } from '../systems/placeholders.js';
import { reproducirMusica } from '../systems/musica.js';

// Intro del Profesor Oak: su sprite en pantalla y la carta (pantalla 2 de la
// Ayuda) como diálogo con el nombre del jugador interpolado. Al terminar el
// diálogo (o saltarlo con B/ESC/Select), fundido y arranca la exploración.
export default class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.INTRO);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    entrarConFundido(this);
    reproducirMusica(this, 'intro_oak');
    ponerFondoMenu(this);
    this.add.image(W / 2, H * 0.3, OAK_KEY).setScale(3);
    this.add
      .text(W - 8, 8, 'B/ESC: saltar', { ...TEXT_STYLE, color: PALETA.pista })
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
