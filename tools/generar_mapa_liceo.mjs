// Genera src/data/map_liceo.json: borrador programático del Liceo Quial
// (Fase 4). Layout estilizado/libre, sin interiores — decisiones por defecto
// anotadas en el roadmap, pendientes de refinar por Milo en Tiled.
//
// Uso: node tools/generar_mapa_liceo.mjs
//
// Tileset frlg_basico (4 col × 3 filas), gids:
// 1 pasto · 2 camino · 3 agua · 4 arbusto · 5/6 pasto con matas ·
// 7 agua variante · 8 camino dup · 9 flores · 10 piedra · 11 arena · 12 reserva
import fs from 'fs';
import { EDIFICIOS } from '../src/data/edificios.js';

const W = 60;
const H = 40;
const PASTO = 1, CAMINO = 2, AGUA = 3, ARBUSTO = 4, MATAS_A = 5, MATAS_B = 6,
  AGUA_VAR = 7, FLORES = 9, PIEDRA = 10, ARENA = 11;

const suelo = new Array(W * H).fill(PASTO);
const col = new Array(W * H).fill(0);
const idx = (x, y) => y * W + x;
const rect = (arr, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) arr[idx(x, y)] = v;
};
// pseudo-aleatorio determinista: mismo mapa en cada corrida
const hash = (x, y) => (x * 31 + y * 17 + ((x * y) % 7)) % 100;

// --- 1. pasto con variantes y flores ---
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const h = hash(x, y);
    if (h < 6) suelo[idx(x, y)] = MATAS_A;
    else if (h < 12) suelo[idx(x, y)] = MATAS_B;
    else if (h < 15) suelo[idx(x, y)] = FLORES;
  }
}

// --- 2. zonas de suelo cálido (arena) ---
rect(suelo, 5, 3, 19, 13, ARENA); // Acción Humanitaria (paleta cálida)
rect(suelo, 8, 26, 14, 30, ARENA); // campamento

// --- 3. zona Cali (este del río): más flores ---
for (let y = 2; y < 38; y++) {
  for (let x = 51; x < 58; x++) {
    if (hash(x, y) < 25) suelo[idx(x, y)] = FLORES;
  }
}

// --- 4. río que separa el Liceo de la zona Cali ---
for (let y = 2; y <= 36; y++) {
  suelo[idx(50, y)] = hash(50, y) < 35 ? AGUA_VAR : AGUA;
  col[idx(50, y)] = AGUA;
}

// --- 5. caminos ---
rect(suelo, 6, 20, 53, 20, CAMINO); // espina horizontal
rect(suelo, 29, 10, 30, 37, CAMINO); // entrada sur → plaza → edificio principal
rect(suelo, 24, 18, 35, 22, CAMINO); // plaza central
rect(suelo, 45, 21, 45, 28, CAMINO); // ramal a la tienda
rect(suelo, 16, 28, 28, 28, CAMINO); // ramal al campamento
rect(suelo, 12, 12, 12, 19, CAMINO); // ramal a Acción Humanitaria
// puente sobre el río
rect(suelo, 49, 20, 51, 20, PIEDRA);
col[idx(50, 20)] = 0;

// --- 6. bordes de arbustos, con entrada sur abierta ---
rect(suelo, 0, 0, W - 1, 1, ARBUSTO);
rect(suelo, 0, H - 2, W - 1, H - 1, ARBUSTO);
rect(suelo, 0, 0, 1, H - 1, ARBUSTO);
rect(suelo, W - 2, 0, W - 1, H - 1, ARBUSTO);
rect(col, 0, 0, W - 1, 1, ARBUSTO);
rect(col, 0, H - 2, W - 1, H - 1, ARBUSTO);
rect(col, 0, 0, 1, H - 1, ARBUSTO);
rect(col, W - 2, 0, W - 1, H - 1, ARBUSTO);
rect(suelo, 28, 38, 31, 39, CAMINO);
rect(col, 28, 38, 31, 39, 0);

// --- 7. edificios (imagen decorativa + colisión de huella completa) ---
const edificios = [
  { clave: 'edificio_principal', tx: 22, ty: 9 },
  { clave: 'accion_humanitaria', tx: 6, ty: 4 },
  { clave: 'porteria', tx: 23, ty: 32 },
  { clave: 'comedor', tx: 42, ty: 16 },
  { clave: 'tienda', tx: 46, ty: 24 },
  { clave: 'casa_roja', tx: 20, ty: 24 },
  { clave: 'casa_azul', tx: 36, ty: 24 },
  { clave: 'caseta_amarilla', tx: 8, ty: 14 },
  { clave: 'casa_roja', tx: 42, ty: 4 },
  { clave: 'casa_azul', tx: 22, ty: 4 },
  { clave: 'caseta_amarilla', tx: 44, ty: 31 },
];
// árboles decorativos sobre el borde superior
const arboles = [];
for (let x = 2; x <= 55; x += 3) {
  arboles.push({ clave: 'arbol', tx: x, ty: 2 });
}

const objetosEdificios = [];
let objetoId = 100;
for (const e of edificios) {
  const info = EDIFICIOS[e.clave];
  const anchoTiles = Math.ceil(info.ancho / 16);
  const altoTiles = Math.ceil(info.alto / 16);
  rect(col, e.tx, e.ty, e.tx + anchoTiles - 1, e.ty + altoTiles - 1, ARBUSTO);
  objetosEdificios.push({
    id: objetoId++,
    name: e.clave,
    x: e.tx * 16,
    y: e.ty * 16,
    width: info.ancho,
    height: info.alto,
    rotation: 0,
    visible: true,
    properties: [{ name: 'imagen', type: 'string', value: e.clave }],
  });
}
for (const a of arboles) {
  const info = EDIFICIOS.arbol;
  rect(col, a.tx, a.ty, a.tx + 1, a.ty, ARBUSTO); // base del árbol
  objetosEdificios.push({
    id: objetoId++,
    name: 'arbol',
    // copa del árbol hacia arriba: la base queda en la fila ty
    x: a.tx * 16,
    y: (a.ty + 1) * 16 - info.alto,
    width: info.ancho,
    height: info.alto,
    rotation: 0,
    visible: true,
    properties: [{ name: 'imagen', type: 'string', value: 'arbol' }],
  });
}

// --- 8. puntos de interacción (content_id de content.json) ---
const puntos = [
  { nombre: 'cartel_region', tx: 26, ty: 19, cid: 'region' },
  { nombre: 'cartel_capitulos', tx: 31, ty: 33, cid: 'capitulos' },
  { nombre: 'npc_convocados', tx: 25, ty: 36, cid: 'convocados' },
  { nombre: 'cartel_ruta_acceso', tx: 27, ty: 36, cid: 'ruta_acceso' },
  { nombre: 'npc_gimnasios', tx: 32, ty: 17, cid: 'gimnasios' },
  { nombre: 'npc_accion_humanitaria', tx: 11, ty: 12, cid: 'accion_humanitaria' },
  { nombre: 'npc_campamento', tx: 11, ty: 28, cid: 'campamento' },
  { nombre: 'npc_vestuario', tx: 15, ty: 30, cid: 'vestuario' },
  { nombre: 'npc_alimentacion', tx: 44, ty: 21, cid: 'alimentacion' },
  { nombre: 'npc_equipamiento', tx: 46, ty: 28, cid: 'equipamiento' },
  { nombre: 'cartel_equipos', tx: 34, ty: 19, cid: 'equipos' },
  { nombre: 'cartel_noche_cultural', tx: 53, ty: 26, cid: 'noche_cultural' },
  { nombre: 'npc_hall_of_fame', tx: 54, ty: 8, cid: 'hall_of_fame' },
  // Los 6 gimnasios de liderazgo (cada uno desbloquea su insignia)
  { nombre: 'gimnasio_1', tx: 25, ty: 26, cid: 'gimnasio_comunicacion' },
  { nombre: 'gimnasio_2', tx: 38, ty: 28, cid: 'gimnasio_equipo' },
  { nombre: 'gimnasio_3', tx: 10, ty: 21, cid: 'gimnasio_participacion' },
  { nombre: 'gimnasio_4', tx: 44, ty: 8, cid: 'gimnasio_ods' },
  { nombre: 'gimnasio_5', tx: 24, ty: 8, cid: 'gimnasio_proyectos' },
  { nombre: 'gimnasio_6', tx: 46, ty: 37, cid: 'gimnasio_inclusion' },
];

// --- validaciones ---
const SPAWN = { tx: 29, ty: 36 };
if (suelo[idx(SPAWN.tx, SPAWN.ty)] !== CAMINO) throw new Error('spawn fuera del camino');
for (const p of puntos) {
  if (col[idx(p.tx, p.ty)] !== 0) throw new Error(`punto ${p.nombre} sobre celda bloqueada`);
  // accesible: al menos una casilla vecina libre
  const vecinos = [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([dx, dy]) => {
    const x = p.tx + dx, y = p.ty + dy;
    return x >= 0 && y >= 0 && x < W && y < H && col[idx(x, y)] === 0;
  });
  if (vecinos.length === 0) throw new Error(`punto ${p.nombre} inaccesible`);
}

const mapa = {
  type: 'map', version: '1.10', orientation: 'orthogonal', renderorder: 'right-down',
  infinite: false, width: W, height: H, tilewidth: 16, tileheight: 16,
  nextlayerid: 5, nextobjectid: objetoId,
  // El spawn viaja con el mapa: la validación de arriba protege al runtime.
  properties: [
    { name: 'spawn_tx', type: 'int', value: SPAWN.tx },
    { name: 'spawn_ty', type: 'int', value: SPAWN.ty },
  ],
  tilesets: [{
    firstgid: 1, name: 'placeholder', image: 'tileset_placeholder',
    imagewidth: 64, imageheight: 48, tilewidth: 16, tileheight: 16,
    tilecount: 12, columns: 4, margin: 0, spacing: 0,
  }],
  layers: [
    { id: 1, name: 'suelo', type: 'tilelayer', width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: suelo },
    { id: 2, name: 'colision', type: 'tilelayer', width: W, height: H, x: 0, y: 0, opacity: 1, visible: false, data: col },
    {
      id: 3, name: 'objetos', type: 'objectgroup', draworder: 'topdown', opacity: 1, visible: true, x: 0, y: 0,
      objects: puntos.map((p, i) => ({
        id: i + 1, name: p.nombre, x: p.tx * 16, y: p.ty * 16, width: 16, height: 16,
        rotation: 0, visible: true,
        properties: [{ name: 'content_id', type: 'string', value: p.cid }],
      })),
    },
    {
      id: 4, name: 'edificios', type: 'objectgroup', draworder: 'topdown', opacity: 1, visible: true, x: 0, y: 0,
      objects: objetosEdificios,
    },
  ],
};

fs.writeFileSync(
  new URL('../src/data/map_liceo.json', import.meta.url),
  JSON.stringify(mapa, null, 1).replace(/\n +(\d+,?)/g, '$1') + '\n'
);
console.log(`ok: ${W}x${H}, ${puntos.length} puntos, ${objetosEdificios.length} edificios/arboles`);
