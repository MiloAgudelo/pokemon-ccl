// Constantes globales del juego. Resolución GBA real con zoom entero (regla del stack).

export const GAME_WIDTH = 240;
export const GAME_HEIGHT = 160;
export const ZOOM = 3;
export const TILE_SIZE = 16;

export const FONT_FAMILY = '"Press Start 2P"';

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
