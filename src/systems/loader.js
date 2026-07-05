// Carga genérica "asset real o placeholder" (regla de oro del proyecto).
// Cada asset [MILO] se declara una vez con su ruta fija y su generador de
// placeholder; cuando el PNG real aparece en /assets/..., se usa sin tocar
// código. La existencia se chequea con un HEAD silencioso (el loader de
// Phaser llena la consola de errores con archivos faltantes).

// Prefijo de despliegue: '/' en dev, configurable vía `base` de Vite si el
// juego se publica bajo un subdirectorio (ej. GitHub Pages).
export function assetUrl(ruta) {
  return import.meta.env.BASE_URL + ruta.replace(/^\//, '');
}

async function existeImagen(url) {
  try {
    const respuesta = await fetch(url, { method: 'HEAD' });
    return respuesta.ok && (respuesta.headers.get('content-type') || '').startsWith('image/');
  } catch {
    return false;
  }
}

// Una corrida del loader como promesa: `encolar` agrega los archivos y aquí
// se arranca y espera el `complete`. Las cargas de Boot deben ser
// secuenciales entre sí — dos corridas entrelazadas del mismo LoaderPlugin
// comparten el evento `complete` y el orden deja de ser confiable.
export function prometerCarga(scene, encolar) {
  return new Promise((resolver) => {
    encolar();
    if (scene.load.list.size === 0) {
      resolver();
      return;
    }
    scene.load.once('complete', resolver);
    scene.load.start();
  });
}

// definiciones: [{ key, url, tipo: 'spritesheet'|'image', frameConfig?, crearPlaceholder(scene) }]
export async function cargarAssetsConPlaceholder(scene, definiciones) {
  const disponibles = await Promise.all(definiciones.map(({ url }) => existeImagen(assetUrl(url))));
  const reales = definiciones.filter((_, i) => disponibles[i]);

  await prometerCarga(scene, () => {
    reales.forEach(({ key, url, tipo, frameConfig }) => {
      scene.load[tipo](key, assetUrl(url), frameConfig);
    });
  });

  definiciones.forEach((def) => {
    if (!scene.textures.exists(def.key)) def.crearPlaceholder(scene);
  });
}
