// Registro de mapas del juego: la clave de caché y sus datos viven juntos.
// BootScene los carga; las escenas que los consumen solo importan de aquí.
import mapaLiceo from './map_liceo.json';

export const MAPAS = {
  LICEO: { key: 'map_liceo', data: mapaLiceo },
};
