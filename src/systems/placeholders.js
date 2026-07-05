// Generación de texturas placeholder por código (regla de oro: nada se
// bloquea por assets faltantes). Cuando exista el asset real en /assets/...,
// estas funciones dejan de usarse sin tocar el resto del código.

import { TILE_SIZE } from '../config.js';

export const TILESET_KEY = 'tileset_placeholder';

// Índices de tile dentro del tileset placeholder (gid = índice + 1 en Tiled).
const TILE_COLORS = [
  { base: '#58a858', detalle: '#68b868' }, // 0: pasto
  { base: '#b8b0a0', detalle: '#c8c0b0' }, // 1: camino
  { base: '#4890d8', detalle: '#60a8e8' }, // 2: agua
  { base: '#906040', detalle: '#785038' }, // 3: muro
];

// Tileset de 4 tiles sólidos 16×16 en una fila (64×16 px).
export function createTilesetTexture(scene) {
  if (scene.textures.exists(TILESET_KEY)) return;

  const canvas = scene.textures.createCanvas(TILESET_KEY, TILE_COLORS.length * TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext();

  TILE_COLORS.forEach((color, i) => {
    const x = i * TILE_SIZE;
    ctx.fillStyle = color.base;
    ctx.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
    // Punteado sutil para que se lea la grilla al caminar.
    ctx.fillStyle = color.detalle;
    ctx.fillRect(x + 3, 3, 2, 2);
    ctx.fillRect(x + 10, 9, 2, 2);
  });

  canvas.refresh();
}

// Sprite placeholder del jugador: sheet 3 columnas × 4 filas de frames 16×32,
// mismo layout que el PNG real que entregará Milo (abajo, izquierda, derecha,
// arriba × idle, paso 1, paso 2). Rectángulo de color con triángulo blanco
// indicando la dirección.
const FRAME_W = 16;
const FRAME_H = 32;
const COLS = 3;
const ROWS = 4;

// Vértices del triángulo direccional por fila del sheet.
const TRIANGLES = [
  [4, 22, 12, 22, 8, 28], // fila 0: abajo
  [10, 12, 10, 20, 4, 16], // fila 1: izquierda
  [6, 12, 6, 20, 12, 16], // fila 2: derecha
  [4, 12, 12, 12, 8, 6], // fila 3: arriba
];

export function createPlayerTexture(scene, key, bodyColor) {
  if (scene.textures.exists(key)) return;

  const canvas = scene.textures.createCanvas(key, COLS * FRAME_W, ROWS * FRAME_H);
  const ctx = canvas.getContext();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * FRAME_W;
      const y = row * FRAME_H;
      // En los frames de paso el cuerpo se desplaza 1px para simular caminata.
      const paso = col === 1 ? -1 : col === 2 ? 1 : 0;

      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 3 + paso, y + 4, 10, 26);

      ctx.fillStyle = '#f8f8f8';
      const [ax, ay, bx, by, cx, cy] = TRIANGLES[row];
      ctx.beginPath();
      ctx.moveTo(x + ax + paso, y + ay);
      ctx.lineTo(x + bx + paso, y + by);
      ctx.lineTo(x + cx + paso, y + cy);
      ctx.closePath();
      ctx.fill();
    }
  }

  canvas.refresh();

  // Frames numerados 0..11 con el mismo esquema que un spritesheet cargado
  // de archivo, para que las animaciones funcionen igual con el asset real.
  const tex = scene.textures.get(key);
  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    tex.add(i, 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
  }
}
