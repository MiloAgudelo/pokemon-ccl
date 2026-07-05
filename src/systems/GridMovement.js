import { TILE_SIZE } from '../config.js';

// Direcciones de movimiento. `fila` es la fila del spritesheet del personaje
// (layout estándar: abajo, izquierda, derecha, arriba × idle, paso 1, paso 2).
export const DIRS = {
  abajo: { dx: 0, dy: 1, fila: 0 },
  izquierda: { dx: -1, dy: 0, fila: 1 },
  derecha: { dx: 1, dy: 0, fila: 2 },
  arriba: { dx: 0, dy: -1, fila: 3 },
};

const FRAMES_POR_FILA = 3;
const DURACION_PASO_MS = 200; // ritmo de caminata GBA (~4 tiles/segundo)

// Movimiento grid-based tile por tile, como en Pokémon real: el personaje
// nunca queda entre tiles. La escena consulta la dirección presionada y llama
// intentarMover / detener cada frame; la colisión la decide el callback
// estaBloqueado(tileX, tileY) que provee la escena.
export default class GridMovement {
  constructor(scene, sprite, { tileX, tileY, estaBloqueado }) {
    this.scene = scene;
    this.sprite = sprite;
    this.tileX = tileX;
    this.tileY = tileY;
    this.estaBloqueado = estaBloqueado;
    this.dir = 'abajo';
    this.enMovimiento = false;

    // Origen en los pies: el sprite de 16×32 ocupa un tile de piso y sobresale
    // hacia arriba, como los personajes GBA.
    sprite.setOrigin(0.5, 1);
    sprite.setPosition(this.pixelX(tileX), this.pixelY(tileY));
  }

  pixelX(tileX) {
    return tileX * TILE_SIZE + TILE_SIZE / 2;
  }

  pixelY(tileY) {
    return (tileY + 1) * TILE_SIZE;
  }

  frameIdle(dir) {
    return DIRS[dir].fila * FRAMES_POR_FILA;
  }

  intentarMover(dir) {
    if (this.enMovimiento) return;

    this.dir = dir;
    const destinoX = this.tileX + DIRS[dir].dx;
    const destinoY = this.tileY + DIRS[dir].dy;

    if (this.estaBloqueado(destinoX, destinoY)) {
      // Bloqueado: solo gira hacia esa dirección.
      this.sprite.anims.stop();
      this.sprite.setFrame(this.frameIdle(dir));
      return;
    }

    this.enMovimiento = true;
    this.tileX = destinoX;
    this.tileY = destinoY;
    this.sprite.anims.play(`${this.sprite.texture.key}_caminar_${dir}`, true);

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.pixelX(destinoX),
      y: this.pixelY(destinoY),
      duration: DURACION_PASO_MS,
      onComplete: () => {
        this.enMovimiento = false;
      },
    });
  }

  detener() {
    if (this.enMovimiento) return;
    const idle = this.frameIdle(this.dir);
    if (Number(this.sprite.frame.name) === idle && !this.sprite.anims.isPlaying) return;
    this.sprite.anims.stop();
    this.sprite.setFrame(idle);
  }
}

// Crea las 4 animaciones de caminata para una textura de personaje con el
// layout estándar. Ciclo paso-idle-paso-idle, como el overworld GBA.
export function crearAnimacionesCaminata(scene, textureKey) {
  Object.entries(DIRS).forEach(([dir, { fila }]) => {
    const key = `${textureKey}_caminar_${dir}`;
    if (scene.anims.exists(key)) return;

    const base = fila * FRAMES_POR_FILA;
    scene.anims.create({
      key,
      frames: [base + 1, base, base + 2, base].map((frame) => ({ key: textureKey, frame })),
      frameRate: 8,
      repeat: -1,
    });
  });
}
