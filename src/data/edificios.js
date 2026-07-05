// Catálogo de edificios y decoraciones grandes: piezas únicas que se dibujan
// como imagen sobre el tilemap (patrón del brief para elementos no
// sembrables). La clave es también el nombre del PNG en
// /assets/tilesets/edificios/<clave>.png — se reemplaza el archivo y listo.
// `ancho`/`alto` en píxeles (tamaño real del PNG); la huella de colisión que
// hornea el generador de mapas es ceil(ancho/16) × ceil(alto/16) tiles.
export const EDIFICIOS = {
  edificio_principal: { ancho: 260, alto: 118, colorPlaceholder: '#c890c8' },
  accion_humanitaria: { ancho: 180, alto: 122, colorPlaceholder: '#d87858' },
  comedor: { ancho: 112, alto: 56, colorPlaceholder: '#58a8a8' },
  tienda: { ancho: 64, alto: 62, colorPlaceholder: '#5878c8' },
  porteria: { ancho: 88, alto: 55, colorPlaceholder: '#888890' },
  casa_roja: { ancho: 80, alto: 64, colorPlaceholder: '#c86858' },
  casa_azul: { ancho: 84, alto: 58, colorPlaceholder: '#6888c8' },
  caseta_amarilla: { ancho: 80, alto: 84, colorPlaceholder: '#c8b858' },
  arbol: { ancho: 32, alto: 45, colorPlaceholder: '#488848' },
};

export function urlEdificio(clave) {
  return `/tilesets/edificios/${clave}.png`;
}
