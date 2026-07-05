import Phaser from 'phaser';
import { SCENE_KEYS, REGISTRY_KEYS, TILE_SIZE } from '../config.js';
import { TILESET_KEY, NPC_KEY, CARTEL_KEY } from '../systems/placeholders.js';
import GridMovement, { DIRS } from '../systems/GridMovement.js';
import { MAPAS } from '../data/maps.js';
import { getContenido } from '../data/content.js';
import { entrarConFundido } from '../systems/transiciones.js';
import { TECLAS_ACCION } from '../systems/controles.js';

const SPAWN = { tileX: 20, tileY: 13 };
const AVATAR_DEFAULT = 'rover_m';

// Escena principal de exploración: tilemap + jugador + NPCs interactivos + cámara.
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.WORLD);
  }

  create() {
    entrarConFundido(this);
    this.mapa = this.make.tilemap({ key: MAPAS.PRUEBA.key });
    const tileset = this.mapa.addTilesetImage('placeholder', TILESET_KEY);

    this.mapa.createLayer('suelo', tileset, 0, 0);
    this.colision = this.mapa.createLayer('colision', tileset, 0, 0).setVisible(false);

    this.crearObjetosInteractivos();

    // El avatar lo fija la selección de personaje (Fase 3); mientras tanto, default.
    const avatar = this.registry.get(REGISTRY_KEYS.AVATAR) || AVATAR_DEFAULT;
    this.jugador = this.add.sprite(0, 0, avatar, 0);
    this.movimiento = new GridMovement(this, this.jugador, {
      ...SPAWN,
      estaBloqueado: (tileX, tileY) => this.estaBloqueado(tileX, tileY),
    });

    this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true);

    this.cursores = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.teclasAccion = TECLAS_ACCION.map((tecla) =>
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[tecla])
    );
  }

  // Lee la capa de objetos del mapa: cada objeto con content_id se vuelve un
  // punto de interacción con sprite placeholder según su tipo en content.json.
  crearObjetosInteractivos() {
    this.interacciones = new Map();
    const capa = this.mapa.getObjectLayer('objetos');
    if (!capa) return;

    capa.objects.forEach((obj) => {
      const prop = (obj.properties || []).find((p) => p.name === 'content_id');
      const entrada = prop && getContenido(prop.value);
      if (!entrada) return;

      const tileX = Math.floor(obj.x / TILE_SIZE);
      const tileY = Math.floor(obj.y / TILE_SIZE);
      const textura = entrada.tipo === 'cartel' ? CARTEL_KEY : NPC_KEY;
      const pieY = (tileY + 1) * TILE_SIZE;
      this.add
        .sprite(tileX * TILE_SIZE + TILE_SIZE / 2, pieY, textura)
        .setOrigin(0.5, 1)
        .setDepth(pieY);
      this.interacciones.set(`${tileX},${tileY}`, prop.value);
    });
  }

  update() {
    // Orden por Y, como el overworld GBA: lo que está más abajo tapa.
    this.jugador.setDepth(this.jugador.y);

    if (this.accionJustoPresionada() && !this.movimiento.enMovimiento) {
      this.interactuar();
      return;
    }

    const dir = this.direccionPresionada();
    if (dir) {
      this.movimiento.intentarMover(dir);
    } else {
      this.movimiento.detener();
    }
  }

  accionJustoPresionada() {
    return this.teclasAccion.some((tecla) => Phaser.Input.Keyboard.JustDown(tecla));
  }

  interactuar() {
    const { dx, dy } = DIRS[this.movimiento.dir];
    const objetivo = `${this.movimiento.tileX + dx},${this.movimiento.tileY + dy}`;
    const contentId = this.interacciones.get(objetivo);
    if (!contentId) return;

    // El diálogo corre como escena overlay; esta escena se pausa y el
    // diálogo la reanuda al cerrar.
    this.scene.launch(SCENE_KEYS.DIALOGUE, { contentId });
    this.scene.pause();
  }

  direccionPresionada() {
    if (this.cursores.left.isDown || this.wasd.A.isDown) return 'izquierda';
    if (this.cursores.right.isDown || this.wasd.D.isDown) return 'derecha';
    if (this.cursores.up.isDown || this.wasd.W.isDown) return 'arriba';
    if (this.cursores.down.isDown || this.wasd.S.isDown) return 'abajo';
    return null;
  }

  estaBloqueado(tileX, tileY) {
    if (tileX < 0 || tileY < 0 || tileX >= this.mapa.width || tileY >= this.mapa.height) {
      return true;
    }
    if (this.interacciones.has(`${tileX},${tileY}`)) return true;
    // La capa de colisión solo tiene tiles en las celdas bloqueadas.
    return this.colision.getTileAt(tileX, tileY) !== null;
  }
}
