import Phaser from 'phaser';
import { SCENE_KEYS, REGISTRY_KEYS, TILE_SIZE, TEXT_STYLE, PALETA } from '../config.js';
import { TILESET_KEY, NPC_KEY, CARTEL_KEY } from '../systems/placeholders.js';
import GridMovement, { DIRS } from '../systems/GridMovement.js';
import { MAPAS } from '../data/maps.js';
import { getContenido } from '../data/content.js';
import { entrarConFundido } from '../systems/transiciones.js';
import { alPresionarAccion } from '../systems/controles.js';
import { reproducirMusica } from '../systems/musica.js';
import { obtenerInsignias, resolverContentId, TOTAL_INSIGNIAS } from '../systems/insignias.js';

const AVATAR_DEFAULT = 'rover_m';
// Sprite del punto de interacción según el tipo de su entrada de contenido.
const TEXTURA_POR_TIPO = {
  cartel: CARTEL_KEY,
  npc: NPC_KEY,
  zona: NPC_KEY,
};

// Escena principal de exploración: tilemap + jugador + NPCs interactivos + cámara.
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.WORLD);
  }

  create() {
    entrarConFundido(this);
    reproducirMusica(this, 'mapa');
    this.mapa = this.make.tilemap({ key: MAPAS.LICEO.key });
    const tileset = this.mapa.addTilesetImage('placeholder', TILESET_KEY);

    this.mapa.createLayer('suelo', tileset, 0, 0);
    this.colision = this.mapa.createLayer('colision', tileset, 0, 0).setVisible(false);

    this.crearEdificios();
    this.crearObjetosInteractivos();

    // El avatar lo fija la selección de personaje (Fase 3); mientras tanto, default.
    // El spawn viene como propiedad del mapa (lo valida el generador).
    const props = Object.fromEntries(
      (this.mapa.properties || []).map((p) => [p.name, p.value])
    );
    const avatar = this.registry.get(REGISTRY_KEYS.AVATAR) || AVATAR_DEFAULT;
    this.jugador = this.add.sprite(0, 0, avatar, 0);
    this.movimiento = new GridMovement(this, this.jugador, {
      tileX: props.spawn_tx ?? 1,
      tileY: props.spawn_ty ?? 1,
      estaBloqueado: (tileX, tileY) => this.estaBloqueado(tileX, tileY),
    });

    this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true);

    this.cursores = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    // Mismo botón de acción que el resto del juego (incluye tap en móvil).
    alPresionarAccion(this, () => {
      if (this.scene.isActive() && !this.movimiento.enMovimiento) this.interactuar();
    });

    this.crearHudInsignias();
  }

  // Contador de insignias fijo en la esquina superior izquierda.
  crearHudInsignias() {
    const fondo = this.add
      .rectangle(4, 4, 136, 16, PALETA.cajaFondo, 0.85)
      .setOrigin(0, 0)
      .setStrokeStyle(1, PALETA.cajaBorde)
      .setScrollFactor(0)
      .setDepth(10000);
    this.hudInsignias = this.add
      .text(10, 8, '', TEXT_STYLE)
      .setScrollFactor(0)
      .setDepth(10001);
    this.actualizarHud();

    const alCambiar = () => this.actualizarHud();
    this.registry.events.on(`changedata-${REGISTRY_KEYS.INSIGNIAS}`, alCambiar);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off(`changedata-${REGISTRY_KEYS.INSIGNIAS}`, alCambiar);
    });
    // ancho del fondo ajustado al texto
    fondo.width = this.hudInsignias.width + 12;
  }

  actualizarHud() {
    const n = obtenerInsignias(this.registry).length;
    this.hudInsignias.setText(`INSIGNIAS ${n}/${TOTAL_INSIGNIAS}`);
  }

  // Edificios y decoraciones grandes: imágenes sobre el tilemap (la colisión
  // de su huella ya viene horneada en la capa `colision` por el generador).
  crearEdificios() {
    const capa = this.mapa.getObjectLayer('edificios');
    if (!capa) return;

    capa.objects.forEach((obj) => {
      const prop = (obj.properties || []).find((p) => p.name === 'imagen');
      if (!prop || !this.textures.exists(prop.value)) return;
      this.add
        .image(obj.x, obj.y, prop.value)
        .setOrigin(0, 0)
        .setDepth(obj.y + obj.height);
    });
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
      const textura = TEXTURA_POR_TIPO[entrada.tipo] || NPC_KEY;
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

    const dir = this.direccionPresionada();
    if (dir) {
      this.movimiento.intentarMover(dir);
    } else {
      this.movimiento.detener();
    }
  }

  interactuar() {
    const { dx, dy } = DIRS[this.movimiento.dir];
    const objetivo = `${this.movimiento.tileX + dx},${this.movimiento.tileY + dy}`;
    const puntoId = this.interacciones.get(objetivo);
    if (!puntoId) return;

    // Las variantes por progreso (ej. Hall of Fame completo) las decide
    // el sistema de insignias, no esta escena.
    const contentId = resolverContentId(this.registry, puntoId);

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
