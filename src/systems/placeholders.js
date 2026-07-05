// Generación de texturas placeholder por código (regla de oro: nada se
// bloquea por assets faltantes). Cuando exista el asset real en /assets/...,
// estas funciones dejan de usarse sin tocar el resto del código.

import { TILE_SIZE } from '../config.js';

export const TILESET_KEY = 'tileset_placeholder';
export const NPC_KEY = 'npc_placeholder';
export const CARTEL_KEY = 'cartel_placeholder';
// Claves de assets [MILO] con placeholder: la textura llega con esta clave
// tanto si se cargó el PNG real como si se generó por código.
export const OAK_KEY = 'oak';
export const LOGO_KEY = 'logo_ccl';
export const FONDO_MENU_KEY = 'fondo_menu';

// Índices de tile dentro del tileset (gid = índice + 1 en Tiled). Mismo
// layout que el tileset real /assets/tilesets/frlg_basico.png: 4 columnas ×
// 2 filas (base: pasto, camino, agua, arbusto; variantes decorativas abajo).
const TILE_COLORS = [
  { base: '#58a858', detalle: '#68b868' }, // 0: pasto
  { base: '#b8b0a0', detalle: '#c8c0b0' }, // 1: camino
  { base: '#4890d8', detalle: '#60a8e8' }, // 2: agua
  { base: '#906040', detalle: '#785038' }, // 3: muro/arbusto
  { base: '#58a858', detalle: '#487848' }, // 4: pasto con matas A
  { base: '#58a858', detalle: '#487848' }, // 5: pasto con matas B
  { base: '#4890d8', detalle: '#3878b8' }, // 6: agua variante
  { base: '#b8b0a0', detalle: '#c8c0b0' }, // 7: camino (dup)
  { base: '#58a858', detalle: '#d86060' }, // 8: flores
  { base: '#989088', detalle: '#a8a098' }, // 9: piedra
  { base: '#e0d090', detalle: '#d0c080' }, // 10: arena
  { base: '#58a858', detalle: '#68b868' }, // 11: reserva (pasto)
];
const TILESET_COLUMNAS = 4;

// Tileset placeholder de tiles sólidos 16×16 (64×32 px).
export function createTilesetTexture(scene) {
  if (scene.textures.exists(TILESET_KEY)) return;

  const filas = Math.ceil(TILE_COLORS.length / TILESET_COLUMNAS);
  const canvas = scene.textures.createCanvas(
    TILESET_KEY,
    TILESET_COLUMNAS * TILE_SIZE,
    filas * TILE_SIZE
  );
  const ctx = canvas.getContext();

  TILE_COLORS.forEach((color, i) => {
    const x = (i % TILESET_COLUMNAS) * TILE_SIZE;
    const y = Math.floor(i / TILESET_COLUMNAS) * TILE_SIZE;
    ctx.fillStyle = color.base;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Punteado sutil para que se lea la grilla al caminar.
    ctx.fillStyle = color.detalle;
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + 10, y + 9, 2, 2);
  });

  canvas.refresh();
}

// Rectángulo de color con borde: placeholder genérico para edificios
// decorativos cuyo PNG real aún no está en /assets/tilesets/edificios/.
export function createRectanguloTexture(scene, key, ancho, alto, color) {
  if (scene.textures.exists(key)) return;

  const canvas = scene.textures.createCanvas(key, ancho, alto);
  const ctx = canvas.getContext();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ancho, alto);
  ctx.strokeStyle = '#f8f8f8';
  ctx.strokeRect(0.5, 0.5, ancho - 1, alto - 1);
  canvas.refresh();
}

// Fondo de las pantallas de menú (title, nombre, avatar, intro): degradado
// azul en bandas con puntoado sutil, al estilo de los menús GBA. 240×160.
export function createMenuBackgroundTexture(scene, ancho, alto) {
  if (scene.textures.exists(FONDO_MENU_KEY)) return;

  const canvas = scene.textures.createCanvas(FONDO_MENU_KEY, ancho, alto);
  const ctx = canvas.getContext();

  const bandas = ['#2c4c80', '#284478', '#243c6c', '#203460', '#1c2c54'];
  const altoBanda = Math.ceil(alto / bandas.length);
  bandas.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * altoBanda, ancho, altoBanda);
  });

  // Puntos 2×2 en grilla alternada, apenas visibles.
  ctx.fillStyle = 'rgba(248, 248, 248, 0.06)';
  for (let y = 4; y < alto; y += 12) {
    const desfase = (y / 12) % 2 === 0 ? 0 : 8;
    for (let x = desfase; x < ancho; x += 16) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  canvas.refresh();
}

// Profesor Oak placeholder: bata blanca, pelo gris, 24×32.
export function createOakTexture(scene) {
  if (scene.textures.exists(OAK_KEY)) return;

  const canvas = scene.textures.createCanvas(OAK_KEY, 24, 32);
  const ctx = canvas.getContext();
  ctx.fillStyle = '#f0f0f0'; // bata
  ctx.fillRect(4, 13, 16, 19);
  ctx.fillStyle = '#e8c090'; // cara
  ctx.fillRect(7, 5, 10, 9);
  ctx.fillStyle = '#b8b8b8'; // pelo
  ctx.fillRect(6, 1, 12, 5);
  ctx.fillStyle = '#a03028'; // corbata
  ctx.fillRect(11, 14, 2, 8);
  canvas.refresh();
}

// NPC placeholder: rectángulo 16×32 verde azulado con "cara" clara.
export function createNpcTexture(scene) {
  if (scene.textures.exists(NPC_KEY)) return;

  const canvas = scene.textures.createCanvas(NPC_KEY, 16, 32);
  const ctx = canvas.getContext();
  ctx.fillStyle = '#2f8f8f';
  ctx.fillRect(3, 4, 10, 26);
  ctx.fillStyle = '#c8e8e8';
  ctx.fillRect(5, 8, 6, 5);
  canvas.refresh();
}

// Cartel placeholder: tabla amarilla 16×16 con borde.
export function createCartelTexture(scene) {
  if (scene.textures.exists(CARTEL_KEY)) return;

  const canvas = scene.textures.createCanvas(CARTEL_KEY, 16, 16);
  const ctx = canvas.getContext();
  ctx.fillStyle = '#907040';
  ctx.fillRect(6, 8, 4, 8);
  ctx.fillStyle = '#d8b048';
  ctx.fillRect(1, 1, 14, 10);
  ctx.fillStyle = '#705828';
  ctx.fillRect(3, 4, 10, 1);
  ctx.fillRect(3, 7, 10, 1);
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
