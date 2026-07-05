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
