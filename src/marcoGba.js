// Conecta los botones del marco de consola GBA (index.html) con el juego:
// cada botón despacha los mismos eventos de teclado que usa el juego, así
// táctil y teclado comparten exactamente el mismo camino de input.
// D-pad = flechas, A = Z (acción), B = X (cancelar/avanzar), Start = Enter,
// Select = Escape (saltar diálogo).

const TECLAS = {
  ArrowUp: { key: 'ArrowUp', keyCode: 38 },
  ArrowDown: { key: 'ArrowDown', keyCode: 40 },
  ArrowLeft: { key: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { key: 'ArrowRight', keyCode: 39 },
  KeyZ: { key: 'z', keyCode: 90 },
  KeyX: { key: 'x', keyCode: 88 },
  Enter: { key: 'Enter', keyCode: 13 },
  Escape: { key: 'Escape', keyCode: 27 },
};

function despachar(tipo, code) {
  const { key, keyCode } = TECLAS[code];
  window.dispatchEvent(
    new KeyboardEvent(tipo, { code, key, keyCode, which: keyCode, bubbles: true })
  );
}

// Canvas "líquido": la carcasa ocupa el 100% del viewport (CSS) y el juego
// llena la pantalla del marco SIN franjas — la resolución interna se adapta
// a la proporción de cada pantalla (se ve más o menos mundo, nunca bandas).
// El zoom flotante da el tamaño de píxel; las escenas leen this.scale.
export function ajustarEscalaConsola(juego, anchoBase, altoBase) {
  const pantalla = document.querySelector('.display');
  if (!pantalla) return;

  // El mapa mide 960px de ancho (map_liceo); la resolución interna no debe
  // superarlo o la cámara se quedaría sin mundo que mostrar a los lados.
  const ANCHO_INTERNO_MAX = 940;

  const aplicar = () => {
    const ancho = pantalla.clientWidth;
    const alto = pantalla.clientHeight;
    // Sin dimensiones (pestaña oculta/minimizada): reintenta al redimensionar.
    if (ancho < 50 || alto < 50) return;

    // Píxel mínimo 2×2 (look GBA en celulares); en pantallas altas el alto
    // interno se ancla a la resolución base.
    const zoom = Math.max(2, alto / altoBase, ancho / ANCHO_INTERNO_MAX);
    const anchoInterno = Math.max(240, Math.round(ancho / zoom));
    const altoInterno = Math.max(160, Math.round(alto / zoom));

    juego.scale.setGameSize(anchoInterno, altoInterno);
    // Zoom final exacto para cubrir la pantalla completa: el sub-píxel que
    // sobre lo recorta el overflow:hidden del .display — cero franjas.
    juego.scale.setZoom(Math.max(ancho / anchoInterno, alto / altoInterno));
  };

  aplicar();
  window.addEventListener('resize', aplicar);
  new ResizeObserver(aplicar).observe(pantalla);
}

export function conectarMarcoGba() {
  document.querySelectorAll('[data-tecla]').forEach((boton) => {
    const code = boton.dataset.tecla;
    if (!TECLAS[code]) return;

    let presionado = false;
    const bajar = (e) => {
      e.preventDefault();
      if (presionado) return;
      presionado = true;
      despachar('keydown', code);
    };
    const soltar = (e) => {
      e.preventDefault();
      if (!presionado) return;
      presionado = false;
      despachar('keyup', code);
    };

    boton.addEventListener('pointerdown', bajar);
    boton.addEventListener('pointerup', soltar);
    boton.addEventListener('pointerleave', soltar);
    boton.addEventListener('pointercancel', soltar);
    boton.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}
