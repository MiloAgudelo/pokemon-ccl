import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEXT_STYLE, SCENE_KEYS, FONT_FAMILY } from '../config.js';
import {
  createTilesetTexture,
  createPlayerTexture,
  createNpcTexture,
  createCartelTexture,
  createOakTexture,
  createMenuBackgroundTexture,
  OAK_KEY,
  LOGO_KEY,
  FONDO_MENU_KEY,
} from '../systems/placeholders.js';
import { cargarAssetsConPlaceholder } from '../systems/loader.js';
import { crearAnimacionesCaminata } from '../systems/GridMovement.js';
import { cargarMusica } from '../systems/musica.js';
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

    createMenuBackgroundTexture(this, GAME_WIDTH, GAME_HEIGHT);
    this.add.image(0, 0, FONDO_MENU_KEY).setOrigin(0);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CCL 2026', { ...TEXT_STYLE, fontSize: '16px' })
      .setOrigin(0.5);

    createTilesetTexture(this);
    createNpcTexture(this);
    createCartelTexture(this);
    Object.values(MAPAS).forEach(({ key, data }) => {
      this.cache.tilemap.add(key, { format: Phaser.Tilemaps.Formats.TILED_JSON, data });
    });

    // El texto in-game depende de Press Start 2P; no se arranca sin ella
    // (o sin que el navegador reporte el fallo, para no colgar el juego).
    const fuenteLista = document.fonts.load(`8px ${FONT_FAMILY}`).catch(() => {});
    const assetsListos = cargarAssetsConPlaceholder(this, ASSETS_MILO).then(() => {
      AVATARES.forEach((key) => crearAnimacionesCaminata(this, key));
    });
    const musicaLista = new Promise((resolver) => {
      cargarMusica(this);
      this.load.once('complete', resolver);
      this.load.start();
    });

    Promise.all([assetsListos, fuenteLista, musicaLista]).then(() =>
      this.scene.start(SCENE_KEYS.TITLE)
    );
  }
}
