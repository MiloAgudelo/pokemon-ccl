import Phaser from 'phaser';

const DURACION_FUNDIDO_MS = 300;

// Cambio de escena con fade a negro estilo GBA. Ignora llamadas repetidas
// (ej. machacar la tecla de acción durante el fundido).
export function irConFundido(scene, sceneKey, datos) {
  if (scene.enTransicion) return;
  scene.enTransicion = true;

  scene.cameras.main.fadeOut(DURACION_FUNDIDO_MS, 0, 0, 0);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(sceneKey, datos);
  });
}

export function entrarConFundido(scene) {
  scene.cameras.main.fadeIn(DURACION_FUNDIDO_MS, 0, 0, 0);
}
