import { reproducirSfxBoton } from './musica.js';

// Botón de acción del juego (Z / Enter / Espacio + tap). Único punto donde
// se define: los botones táctiles del marco despachan estas mismas teclas y
// todas las escenas filtran el auto-repeat igual.
export const TECLAS_ACCION = ['Z', 'ENTER', 'SPACE'];

const EVENTOS_ACCION = TECLAS_ACCION.map((tecla) => `keydown-${tecla}`);

// conSfx: beep de botón al accionar (apagado en el mundo, donde presionar
// acción sin objetivo no debe sonar).
export function alPresionarAccion(scene, callback, { conTap = true, conSfx = true } = {}) {
  const accionar = () => {
    if (conSfx) reproducirSfxBoton(scene);
    callback();
  };
  EVENTOS_ACCION.forEach((evento) => {
    scene.input.keyboard.on(evento, (e) => {
      if (!e.repeat) accionar();
    });
  });
  if (conTap) {
    scene.input.on('pointerdown', () => accionar());
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
