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

// definiciones: [{ key, url, tipo: 'spritesheet'|'image', frameConfig?, crearPlaceholder(scene) }]
export async function cargarAssetsConPlaceholder(scene, definiciones) {
  const disponibles = await Promise.all(definiciones.map(({ url }) => existeImagen(assetUrl(url))));
  const reales = definiciones.filter((_, i) => disponibles[i]);

  if (reales.length > 0) {
    await new Promise((resolver) => {
      reales.forEach(({ key, url, tipo, frameConfig }) => {
        scene.load[tipo](key, assetUrl(url), frameConfig);
      });
      scene.load.once('complete', resolver);
      scene.load.start();
    });
  }

  definiciones.forEach((def) => {
    if (!scene.textures.exists(def.key)) def.crearPlaceholder(scene);
  });
}
