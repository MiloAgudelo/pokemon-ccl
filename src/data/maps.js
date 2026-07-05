// Registro de mapas del juego: la clave de caché y sus datos viven juntos.
// BootScene los carga; las escenas que los consumen solo importan de aquí.
import mapaPrueba from './map_test.json';
import mapaLiceo from './map_liceo.json';

export const MAPAS = {
  PRUEBA: { key: 'map_test', data: mapaPrueba },
  LICEO: { key: 'map_liceo', data: mapaLiceo },
};
