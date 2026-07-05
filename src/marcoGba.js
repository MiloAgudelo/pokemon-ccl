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

// Escalado responsivo: la carcasa ocupa el 100% del viewport (CSS) y el
// canvas se estira con zoom FLOTANTE hasta llenar la pantalla del marco
// (medida real del DOM), conservando la proporción 3:2. `image-rendering:
// pixelated` mantiene el píxel nítido aunque el zoom no sea entero.
export function ajustarEscalaConsola(juego, anchoJuego, altoJuego) {
  const pantalla = document.querySelector('.display');
  if (!pantalla) return;

  const aplicar = () => {
    const ancho = pantalla.clientWidth;
    const alto = pantalla.clientHeight;
    // Sin dimensiones (pestaña oculta/minimizada): reintenta al redimensionar.
    if (ancho < 50 || alto < 50) return;

    const zoom = Math.max(0.25, Math.min(ancho / anchoJuego, alto / altoJuego));
    juego.scale.setZoom(Math.floor(zoom * 100) / 100);
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
