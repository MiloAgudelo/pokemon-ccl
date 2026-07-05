import Phaser from 'phaser';

const DURACION_FUNDIDO_MS = 300;

// Cambio de escena con fade a negro estilo GBA. Si ya hay un fade-OUT en
// curso se ignora (machacar teclas no dispara dos scene.start), sin estado
// propio que pueda quedar pegado entre reruns de la escena. Un fade-in en
// curso no bloquea: se interrumpe y se sale — importante porque una escena
// puede pausarse con su fade-in a medias (ej. Intro lanza el diálogo en su
// primer frame) y ese efecto congelado seguiría "corriendo" al reanudar.
export function irConFundido(scene, sceneKey, datos) {
  const fundido = scene.cameras.main.fadeEffect;
  if (fundido.isRunning && fundido.direction) return; // direction=true: fade-out

  scene.cameras.main.fadeOut(DURACION_FUNDIDO_MS, 0, 0, 0);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(sceneKey, datos);
  });
}

export function entrarConFundido(scene) {
  scene.cameras.main.fadeIn(DURACION_FUNDIDO_MS, 0, 0, 0);
}
