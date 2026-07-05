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

// Escalado responsivo (Fase 6): zoom entero mientras el conjunto marco+canvas
// quepa en la ventana; si ni con zoom 1 cabe (celulares <480px), escala
// fraccional CSS sobre toda la carcasa (transform preserva el pixelado).
// El espacio del marco se MIDE del DOM real — cambia por breakpoint.
export function ajustarEscalaConsola(juego, anchoJuego, altoJuego) {
  const carcasa = document.querySelector('.gameboy');
  if (!carcasa) return;

  const aplicar = () => {
    // Ventana sin dimensiones (pestaña minimizada/oculta): no hay nada que
    // calcular; se reintenta en el próximo resize.
    if (window.innerWidth < 50 || window.innerHeight < 50) return;

    carcasa.style.transform = 'none';
    const canvas = juego.canvas;
    const margen = 16;
    const cromoX = carcasa.offsetWidth - canvas.offsetWidth;
    const cromoY = carcasa.offsetHeight - canvas.offsetHeight;
    const zoom = Math.max(
      1,
      Math.min(
        Math.floor((window.innerWidth - cromoX - margen) / anchoJuego),
        Math.floor((window.innerHeight - cromoY - margen) / altoJuego)
      )
    );
    juego.scale.setZoom(zoom);

    // Con el zoom ya aplicado al layout, si aún no cabe: escala fraccional.
    setTimeout(() => {
      const factor = Math.min(
        1,
        (window.innerWidth - 8) / carcasa.offsetWidth,
        (window.innerHeight - 8) / carcasa.offsetHeight
      );
      carcasa.style.transform = factor < 1 ? `scale(${Math.max(factor, 0.1)})` : 'none';
    }, 0);
  };

  aplicar();
  window.addEventListener('resize', aplicar);
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
