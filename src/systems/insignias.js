import { REGISTRY_KEYS } from '../config.js';
import { guardarLocal, leerLocal } from './almacen.js';

// Progresión de insignias: 6 gimnasios + Acción Humanitaria (pre-desbloqueada,
// igual que en el diseño de la Ayuda). Fuente de verdad: registry; localStorage
// solo rehidrata entre sesiones.

export const TOTAL_INSIGNIAS = 7;
const PRE_DESBLOQUEADAS = ['Acción Humanitaria'];

export function iniciarInsignias(registry) {
  if (registry.has(REGISTRY_KEYS.INSIGNIAS)) return;

  let guardadas = [];
  try {
    guardadas = JSON.parse(leerLocal(REGISTRY_KEYS.INSIGNIAS)) || [];
  } catch {
    guardadas = [];
  }
  const iniciales = [...new Set([...PRE_DESBLOQUEADAS, ...guardadas])];
  registry.set(REGISTRY_KEYS.INSIGNIAS, iniciales);
}

export function obtenerInsignias(registry) {
  return registry.get(REGISTRY_KEYS.INSIGNIAS) || [];
}

// Devuelve true si la insignia es nueva (para mostrar el aviso de obtención).
export function desbloquearInsignia(registry, nombre) {
  const actuales = obtenerInsignias(registry);
  if (actuales.includes(nombre)) return false;

  const nuevas = [...actuales, nombre];
  registry.set(REGISTRY_KEYS.INSIGNIAS, nuevas);
  guardarLocal(REGISTRY_KEYS.INSIGNIAS, JSON.stringify(nuevas));
  return true;
}

export function insigniasCompletas(registry) {
  return obtenerInsignias(registry).length >= TOTAL_INSIGNIAS;
}
