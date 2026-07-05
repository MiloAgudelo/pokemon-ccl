import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS, FONT_FAMILY } from '../config.js';
import {
  createTilesetTexture,
  createPlayerTexture,
  createNpcTexture,
  createCartelTexture,
  createOakTexture,
  createMenuBackgroundTexture,
  createRectanguloTexture,
  OAK_KEY,
  LOGO_KEY,
  TILESET_KEY,
  NPC_KEY,
  FONDO_MENU_KEY,
} from '../systems/placeholders.js';
import { EDIFICIOS, urlEdificio } from '../data/edificios.js';
import { cargarAssetsConPlaceholder, prometerCarga } from '../systems/loader.js';
import { crearAnimacionesCaminata } from '../systems/GridMovement.js';
import { cargarMusica, alTerminarCargaMusica } from '../systems/musica.js';
import { iniciarInsignias } from '../systems/insignias.js';
import { MAPAS } from '../data/maps.js';

// Assets [MILO] con su ruta fija y su placeholder generado por código.
const ASSETS_MILO = [
  {
    key: 'rover_m',
    url: '/sprites/rover_m.png',
    tipo: 'spritesheet',
    frameConfig: { frameWidth: 16, frameHeight: 32 },
    crearPlaceholder: (scene) => createPlayerTexture(scene, 'rover_m', '#d05038'),
  },
  {
    key: 'rover_f',
    url: '/sprites/rover_f.png',
    tipo: 'spritesheet',
    frameConfig: { frameWidth: 16, frameHeight: 32 },
    crearPlaceholder: (scene) => createPlayerTexture(scene, 'rover_f', '#7048c8'),
  },
  {
    key: OAK_KEY,
    url: '/sprites/oak.png',
    tipo: 'image',
    crearPlaceholder: (scene) => createOakTexture(scene),
  },
  {
    key: LOGO_KEY,
    url: '/ui/logo_ccl.png',
    tipo: 'image',
    // Sin placeholder de textura: el title screen usa texto si no hay logo.
    crearPlaceholder: () => {},
  },
  {
    key: TILESET_KEY,
    url: '/tilesets/frlg_basico.png',
    tipo: 'image',
    crearPlaceholder: (scene) => createTilesetTexture(scene),
  },
  {
    key: NPC_KEY,
    url: '/sprites/npc_generico.png',
    tipo: 'image',
    crearPlaceholder: (scene) => createNpcTexture(scene),
  },
  {
    // Fondo de menús: pixel art de Cali [MILO]; placeholder = degradado azul.
    key: FONDO_MENU_KEY,
    url: '/ui/fondo_menu.png',
    tipo: 'image',
    crearPlaceholder: (scene) => createMenuBackgroundTexture(scene, GAME_WIDTH, GAME_HEIGHT),
  },
  // Edificios y decoraciones grandes del catálogo (placeholder: rectángulo).
  ...Object.entries(EDIFICIOS).map(([clave, info]) => ({
    key: clave,
    url: urlEdificio(clave),
    tipo: 'image',
    crearPlaceholder: (scene) =>
      createRectanguloTexture(scene, clave, info.ancho, info.alto, info.colorPlaceholder),
  })),
];

const AVATARES = ['rover_m', 'rover_f'];

// Escena inicial: carga assets (con placeholders para los faltantes),
// espera la fuente y arranca el juego.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create() {
    // Ancla el overlay DOM de Phaser (input de nombre) a la esquina del
    // canvas: comparten el wrapper #consola como referencia de posición.
    if (this.game.domContainer) {
      this.game.domContainer.style.left = '0px';
      this.game.domContainer.style.top = '0px';
    }

    iniciarInsignias(this.registry);
    // Loading screen instantáneo: color sólido (el fondo real se carga con el
    // resto de assets y lo usan las escenas de menú, no esta pantalla fugaz).
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1c2c54).setOrigin(0);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'CCL 2026', {
        ...TEXT_STYLE,
        fontSize: '16px',
      })
      .setOrigin(0.5);

    createCartelTexture(this);
    Object.values(MAPAS).forEach(({ key, data }) => {
      this.cache.tilemap.add(key, { format: Phaser.Tilemaps.Formats.TILED_JSON, data });
    });

    // El texto in-game depende de Press Start 2P; no se arranca sin ella
    // (o sin que el navegador reporte el fallo, para no colgar el juego).
    const fuenteLista = document.fonts.load(`8px ${FONT_FAMILY}`).catch(() => {});
    // Cargas del loader en secuencia (nunca dos corridas entrelazadas).
    const assetsListos = (async () => {
      await cargarAssetsConPlaceholder(this, ASSETS_MILO);
      AVATARES.forEach((key) => crearAnimacionesCaminata(this, key));
    })();

    Promise.all([assetsListos, fuenteLista]).then(() => {
      // El audio (~12MB) no bloquea el arranque: se lanza el title y la
      // música suena en cuanto termine de descargar. Boot queda invisible
      // debajo hasta entonces (su loader muere si la escena se detiene).
      this.scene.launch(SCENE_KEYS.TITLE);
      this.scene.setVisible(false);
      prometerCarga(this, () => cargarMusica(this)).then(() => {
        alTerminarCargaMusica(this);
        this.scene.stop();
      });
    });
  }
}
