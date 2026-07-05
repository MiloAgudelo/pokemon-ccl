// Constantes globales del juego.
// GAME_WIDTH/HEIGHT son el tamaño BASE (arranque y texturas generadas): el
// tamaño interno real es "líquido" — se adapta a la proporción de la pantalla
// del marco para que nunca queden franjas (ver ajustarEscalaConsola). Las
// escenas se maquetan leyendo this.scale.width/height, no estas constantes.

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;
export const TILE_SIZE = 16;

export const FONT_FAMILY = '"Press Start 2P"';

// Paleta de UI compartida (deuda técnica #9 del Checkpoint 2).
export const PALETA = {
  texto: '#f8f8f8',
  pista: '#88a0b8', // hints ("ENTER para continuar")
  acento: '#f8d048', // resaltados (subtítulo, marco de selección)
  acentoHex: 0xf8d048, // el mismo acento para strokes/fills de Phaser
  error: '#f87858',
  cajaFondo: 0x203048,
  cajaBorde: 0xf8f8f8,
};

// Estilo base para todo texto in-game (8px = tamaño nativo de Press Start 2P).
export const TEXT_STYLE = {
  fontFamily: FONT_FAMILY,
  fontSize: '8px',
  color: '#f8f8f8',
};

// Claves del registry global (estado compartido entre escenas).
export const REGISTRY_KEYS = {
  AVATAR: 'avatar',
  NOMBRE: 'nombre',
  INSIGNIAS: 'insignias',
};

export const SCENE_KEYS = {
  BOOT: 'Boot',
  TITLE: 'Title',
  NAME_INPUT: 'NameInput',
  AVATAR_SELECT: 'AvatarSelect',
  INTRO: 'Intro',
  WORLD: 'World',
  DIALOGUE: 'Dialogue',
};
