// Acceso al contenido data-driven de la Ayuda #1. El texto vive en
// content.json; cuando el equipo resuelva un [PENDIENTE] se edita el JSON,
// nunca este código.
import contenido from './content.json';

const porId = new Map(contenido.pantallas.map((entrada) => [entrada.id, entrada]));

export function getContenido(id) {
  const entrada = porId.get(id);
  if (!entrada) {
    console.warn(`content.json no tiene la entrada "${id}"`);
  }
  return entrada || null;
}

// Para entradas que las escenas necesitan sí o sí (portada, intro_oak):
// falla fuerte con mensaje claro en vez de un TypeError críptico.
export function getContenidoRequerido(id) {
  const entrada = porId.get(id);
  if (!entrada) {
    throw new Error(`content.json no tiene la entrada requerida "${id}"`);
  }
  return entrada;
}

// Entradas que otorgan insignia (campo `insignia` = nombre visible;
// la identidad persistente es el `id` de la entrada).
export function pantallasConInsignia() {
  return contenido.pantallas.filter((entrada) => entrada.insignia);
}

// Reemplaza marcadores {variable} en un texto. Los que no tengan valor se
// dejan intactos (ej. los [PENDIENTE] no usan esta sintaxis y no se tocan).
export function interpolar(texto, variables) {
  return texto.replace(/\{(\w+)\}/g, (marcador, clave) =>
    clave in variables ? variables[clave] : marcador
  );
}
