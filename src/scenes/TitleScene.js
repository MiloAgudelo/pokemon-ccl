import Phaser from 'phaser';
import { TEXT_STYLE, SCENE_KEYS, PALETA } from '../config.js';
import { getContenido, getContenidoRequerido } from '../data/content.js';
import { irConFundido, entrarConFundido } from '../systems/transiciones.js';
import {
  LOGO_KEY,
  FONDO_MENU_KEY,
  POKEBOLA_KEY,
  createPokebolaTexture,
} from '../systems/placeholders.js';
import { alPresionarAccion } from '../systems/controles.js';
import { reproducirMusica } from '../systems/musica.js';

// Title screen: logo (o texto placeholder) + "INICIAR AVENTURA" parpadeante.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TITLE);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    entrarConFundido(this);
    reproducirMusica(this, 'titulo');
    this.add.image(0, 0, FONDO_MENU_KEY).setOrigin(0).setDisplaySize(W, H);
    this.add
      .text(W - 8, 8, 'M: música', { ...TEXT_STYLE, color: PALETA.pista })
      .setOrigin(1, 0);
    const portada = getContenidoRequerido('portada');

    if (this.textures.exists(LOGO_KEY)) {
      this.add.image(W / 2, H * 0.36, LOGO_KEY);
    } else {
      // Placeholder [MILO]: el logo pixel art llegará a /assets/ui/logo_ccl.png.
      // Press Start 2P es monoespaciada (ancho de glifo = fontSize): se elige
      // el tamaño más grande que quepa en el ancho interno de la pantalla.
      const tamanoTitulo =
        [24, 16, 8].find((t) => portada.titulo.length * t <= W - 16) || 8;
      const tamanoSubtitulo = Math.max(8, tamanoTitulo - 8);
      this.add
        .text(W / 2, H * 0.28, portada.titulo, {
          ...TEXT_STYLE,
          fontSize: `${tamanoTitulo}px`,
        })
        .setOrigin(0.5);
      this.add
        .text(W / 2, H * 0.42, portada.subtitulo, {
          ...TEXT_STYLE,
          fontSize: `${tamanoSubtitulo}px`,
          color: PALETA.acento,
        })
        .setOrigin(0.5);
    }

    const promptY = H * 0.72;
    const prompt = this.add.text(W / 2 + 6, promptY, portada.prompt, TEXT_STYLE).setOrigin(0.5);
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
    this.crearEasterEgg(H);
  }

  // Pokébola-QR oculta (pantalla 2 de la Ayuda): discreta en la esquina.
  // Vive en el title y no en la intro porque la intro pasa pausada bajo el
  // diálogo de Oak y no recibiría el clic (desviación anotada en el roadmap).
  crearEasterEgg(H) {
    createPokebolaTexture(this);
    const pokebola = this.add
      .image(14, H - 14, POKEBOLA_KEY)
      .setAlpha(0.7)
      .setInteractive({ useHandCursor: true });

    pokebola.on('pointerdown', (puntero, x, y, evento) => {
      evento.stopPropagation(); // que el tap no dispare "iniciar aventura"
      const entrada = getContenido('easter_egg_staff');
      if (!entrada) return;
      if (entrada.url && !entrada.url.startsWith('[PENDIENTE')) {
        window.open(entrada.url, '_blank');
      } else {
        // Aún sin URL del video: mostrar el mensaje del hallazgo.
        this.scene.launch(SCENE_KEYS.DIALOGUE, {
          contentId: 'easter_egg_staff',
          escenaPadre: SCENE_KEYS.TITLE,
        });
        this.scene.pause();
      }
    });
  }
}
