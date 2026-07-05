// Persistencia local opcional. Si localStorage no está disponible (ej. el
// juego embebido en un contexto que lo bloquea), el juego sigue funcionando
// solo con el estado en memoria (registry).
const PREFIJO = 'ccl2026.';

export function guardarLocal(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, valor);
  } catch {
    // Sin almacenamiento: se pierde al recargar, nada más.
  }
}

export function leerLocal(clave) {
  try {
    return localStorage.getItem(PREFIJO + clave);
  } catch {
    return null;
  }
}
