import { REGISTRY_KEYS } from '../config.js';
import { guardarLocal, leerLocal } from './almacen.js';
import { pantallasConInsignia } from '../data/content.js';

// Progresión de insignias. La identidad persistente es el `id` de la entrada
// de content.json (el nombre visible en `insignia` es prosa editable); el set
// completo y el total se derivan del contenido — agregar un gimnasio al JSON
// no toca este código. Fuente de verdad: registry; localStorage rehidrata.

const CON_INSIGNIA = pantallasConInsignia();
export const TOTAL_INSIGNIAS = CON_INSIGNIA.length;
const IDS_VALIDOS = new Set(CON_INSIGNIA.map((e) => e.id));
const PRE_DESBLOQUEADAS = CON_INSIGNIA.filter((e) => e.insigniaInicial).map((e) => e.id);

export function iniciarInsignias(registry) {
  if (registry.has(REGISTRY_KEYS.INSIGNIAS)) return;

  let guardadas = [];
  try {
    guardadas = JSON.parse(leerLocal(REGISTRY_KEYS.INSIGNIAS)) || [];
  } catch {
    guardadas = [];
  }
  // Solo ids conocidos: descarta esquemas viejos o entradas renombradas.
  const validas = guardadas.filter((id) => IDS_VALIDOS.has(id));
  registry.set(REGISTRY_KEYS.INSIGNIAS, [...new Set([...PRE_DESBLOQUEADAS, ...validas])]);
}

export function obtenerInsignias(registry) {
  return registry.get(REGISTRY_KEYS.INSIGNIAS) || [];
}

export function insigniasCompletas(registry) {
  return obtenerInsignias(registry).length >= TOTAL_INSIGNIAS;
}

// Devuelve true si la insignia es nueva.
export function desbloquearInsignia(registry, id) {
  if (!IDS_VALIDOS.has(id)) return false;
  const actuales = obtenerInsignias(registry);
  if (actuales.includes(id)) return false;

  const nuevas = [...actuales, id];
  registry.set(REGISTRY_KEYS.INSIGNIAS, nuevas);
  guardarLocal(REGISTRY_KEYS.INSIGNIAS, JSON.stringify(nuevas));
  return true;
}

// --- Reglas de contenido condicionado por progreso (única casa) ---

// Variantes de una entrada según el progreso del jugador.
const VARIANTES = [
  {
    id: 'hall_of_fame',
    variante: 'hall_of_fame_completo',
    aplica: (registry) => insigniasCompletas(registry),
  },
];

export function resolverContentId(registry, contentId) {
  const regla = VARIANTES.find((v) => v.id === contentId && v.aplica(registry));
  return regla ? regla.variante : contentId;
}

// Página extra de obtención para el diálogo, o null si no corresponde.
export function paginaDeObtencion(registry, entrada, nombre) {
  if (!entrada.insignia || obtenerInsignias(registry).includes(entrada.id)) return null;
  const numero = obtenerInsignias(registry).length + 1;
  return `¡${nombre} obtuvo la insignia de ${entrada.insignia}! (${numero}/${TOTAL_INSIGNIAS})`;
}
