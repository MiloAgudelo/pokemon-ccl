// Botón de acción del juego (Z / Enter / Espacio + tap). Único punto donde
// se define, para que el D-pad táctil de la Fase 6 se enchufe en un solo
// lugar y todas las escenas filtren el auto-repeat igual.
export const TECLAS_ACCION = ['Z', 'ENTER', 'SPACE'];

const EVENTOS_ACCION = TECLAS_ACCION.map((tecla) => `keydown-${tecla}`);

export function alPresionarAccion(scene, callback, { conTap = true } = {}) {
  EVENTOS_ACCION.forEach((evento) => {
    scene.input.keyboard.on(evento, (e) => {
      if (!e.repeat) callback();
    });
  });
  if (conTap) {
    scene.input.on('pointerdown', () => callback());
  }
}

// Botón B (X en teclado): cancelar/atrás; en diálogos avanza, como en Pokémon.
export function alPresionarB(scene, callback) {
  scene.input.keyboard.on('keydown-X', (e) => {
    if (!e.repeat) callback();
  });
}

// Salto/atajo (ESC en teclado, Select en el marco).
export function alPresionarSalto(scene, callback) {
  scene.input.keyboard.on('keydown-ESC', (e) => {
    if (!e.repeat) callback();
  });
}
