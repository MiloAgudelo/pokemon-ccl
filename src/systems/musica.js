import { assetUrl } from './loader.js';

// Música de fondo (grabaciones Game Boy, ver /assets/audio/). Una pista a la
// vez; cambiar de pista detiene la anterior. Los navegadores bloquean el
// audio hasta el primer gesto del usuario, así que la reproducción queda en
// cola hasta el desbloqueo. El audio pesa ~12MB y se carga DESPUÉS de abrir
// el title (no bloquea el arranque): si una escena pidió su pista antes de
// que termine la descarga, suena al llegar (`alTerminarCargaMusica`).

const PISTAS = {
  titulo: '/audio/musica/titulo.mp3',
  intro_oak: '/audio/musica/intro_oak.mp3',
  mapa: '/audio/musica/mapa.mp3',
};
const SFX = {
  boton: '/audio/sfx/boton.wav',
};

const VOLUMEN = 0.4;
const VOLUMEN_SFX = 0.2;
let pistaActual = null;
let pistaDeseada = null;

export function cargarMusica(scene) {
  Object.entries(PISTAS).forEach(([nombre, ruta]) => {
    scene.load.audio(`musica_${nombre}`, assetUrl(ruta));
  });
  Object.entries(SFX).forEach(([nombre, ruta]) => {
    scene.load.audio(`sfx_${nombre}`, assetUrl(ruta));
  });
}

export function reproducirMusica(scene, nombre) {
  pistaDeseada = nombre;
  if (!scene.cache.audio.exists(`musica_${nombre}`)) return; // aún descargando

  // No confiar solo en la memoria del módulo: si algo detuvo el sonido
  // (stopAll externo, reinicio de escenas), hay que arrancar de nuevo.
  const yaSuena = scene.sound.get(`musica_${nombre}`);
  if (pistaActual === nombre && yaSuena && yaSuena.isPlaying) return;
  pistaActual = nombre;

  const sonido = scene.sound;
  sonido.stopAll();
  const arrancar = () => {
    // Puede haber cambiado de pista mientras esperaba el desbloqueo.
    if (pistaActual === nombre) {
      sonido.stopAll();
      sonido.play(`musica_${nombre}`, { loop: true, volume: VOLUMEN });
    }
  };

  if (sonido.locked) {
    sonido.once('unlocked', arrancar);
  } else {
    arrancar();
  }
}

// Llamar cuando la descarga de audio termine: arranca la pista que la escena
// actual haya pedido mientras tanto.
export function alTerminarCargaMusica(scene) {
  if (pistaDeseada) {
    pistaActual = null;
    reproducirMusica(scene, pistaDeseada);
  }
}

export function reproducirSfxBoton(scene) {
  if (scene.cache.audio.exists('sfx_boton')) {
    scene.sound.play('sfx_boton', { volume: VOLUMEN_SFX });
  }
}

// Mute global: tecla M y el botón ♪ del marco.
export function conectarMute(game) {
  const boton = document.getElementById('btn-silencio');
  const alternar = () => {
    game.sound.mute = !game.sound.mute;
    if (boton) boton.textContent = game.sound.mute ? '×' : '♪';
  };
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return; // escribiendo el nombre
    if (e.code === 'KeyM' && !e.repeat) alternar();
  });
  if (boton) boton.addEventListener('click', alternar);
}
