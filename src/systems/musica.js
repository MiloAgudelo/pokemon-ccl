import { assetUrl } from './loader.js';

// Música de fondo (grabaciones Game Boy, ver /assets/audio/). Una pista a la
// vez; cambiar de pista detiene la anterior. Los navegadores bloquean el
// audio hasta el primer gesto del usuario, así que la reproducción queda en
// cola hasta el desbloqueo.

const PISTAS = {
  titulo: '/audio/musica/titulo.mp3',
  intro_oak: '/audio/musica/intro_oak.mp3',
  mapa: '/audio/musica/mapa.mp3',
};

const VOLUMEN = 0.4;
let pistaActual = null;

export function cargarMusica(scene) {
  Object.entries(PISTAS).forEach(([nombre, ruta]) => {
    scene.load.audio(`musica_${nombre}`, assetUrl(ruta));
  });
}

export function reproducirMusica(scene, nombre) {
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

// Mute global con la tecla M (el botón visual llega con el pulido de Fase 6).
export function conectarMute(game) {
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return; // escribiendo el nombre
    if (e.code === 'KeyM' && !e.repeat) {
      game.sound.mute = !game.sound.mute;
    }
  });
}
