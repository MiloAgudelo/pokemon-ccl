import Phaser from 'phaser';
import { TEXT_STYLE, SCENE_KEYS, REGISTRY_KEYS, PALETA } from '../config.js';
import { getContenido, interpolar } from '../data/content.js';
import { alPresionarAccion } from '../systems/controles.js';
import { desbloquearInsignia, paginaDeObtencion } from '../systems/insignias.js';
import { alPresionarB, alPresionarSalto } from '../systems/controles.js';

const MARGEN = 6;
const ALTO_CAJA = 72;
const RELLENO = 8;
const ALTO_TITULO = 18;
const LINEAS_POR_PAGINA = 4;
const INTERLINEADO = 6;
const MS_POR_LETRA = 15;
const NOMBRE_DEFAULT = 'ROVER';

// Cuadro de diálogo estilo GBA: caja inferior, texto letra por letra,
// indicador parpadeante para avanzar y paginación automática.
//
// Es una escena overlay: quien la lanza se pausa a sí mismo y esta escena
// lo reanuda al cerrar (así el update del mundo no necesita saber de diálogos).
// Datos de lanzamiento: { contentId, escenaPadre? } (default: World).
export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.DIALOGUE);
  }

  init(datos) {
    this.contentId = datos.contentId;
    this.escenaPadre = datos.escenaPadre || SCENE_KEYS.WORLD;
  }

  create() {
    const entrada = getContenido(this.contentId);
    if (!entrada || entrada.paginas.length === 0) {
      this.cerrar();
      return;
    }

    const nombre = this.registry.get(REGISTRY_KEYS.NOMBRE) || NOMBRE_DEFAULT;
    const W = this.scale.width;
    const H = this.scale.height;
    const cajaY = H - MARGEN - ALTO_CAJA;
    const anchoCaja = W - MARGEN * 2;

    // Marco placeholder: caja oscura con borde blanco simple.
    this.add
      .rectangle(MARGEN, cajaY, anchoCaja, ALTO_CAJA, PALETA.cajaFondo)
      .setOrigin(0, 0)
      .setStrokeStyle(1, PALETA.cajaBorde);

    if (entrada.titulo) {
      const anchoTitulo = entrada.titulo.length * 8 + RELLENO * 2;
      this.add
        .rectangle(MARGEN, cajaY - ALTO_TITULO + 1, anchoTitulo, ALTO_TITULO, PALETA.cajaFondo)
        .setOrigin(0, 0)
        .setStrokeStyle(1, PALETA.cajaBorde);
      this.add.text(MARGEN + RELLENO, cajaY - ALTO_TITULO + 6, entrada.titulo, TEXT_STYLE);
    }

    this.texto = this.add.text(MARGEN + RELLENO, cajaY + RELLENO, '', {
      ...TEXT_STYLE,
      wordWrap: { width: anchoCaja - RELLENO * 2 },
      lineSpacing: INTERLINEADO,
    });

    // Indicador de "presiona para avanzar": triángulo que parpadea
    // (dibujado, no glifo de texto — Press Start 2P no trae flechas).
    this.indicador = this.add
      .triangle(W - MARGEN - 12, H - MARGEN - 9, 0, 0, 6, 0, 3, 4, 0xf8f8f8)
      .setVisible(false);
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        if (this.esperandoInput) this.indicador.setVisible(!this.indicador.visible);
      },
    });

    const paginasContenido = entrada.paginas.map((pagina) => interpolar(pagina, { nombre }));
    // Punto con insignia aún no obtenida: página extra de obtención al final,
    // estilo "¡Obtuviste la MEDALLA X!" de GBA. Se desbloquea al cerrar.
    const paginaInsignia = paginaDeObtencion(this.registry, entrada, nombre);
    this.insigniaPendiente = paginaInsignia ? entrada.id : null;
    if (paginaInsignia) paginasContenido.push(paginaInsignia);
    this.paginas = this.paginar(paginasContenido);
    this.pagina = 0;
    this.tipeo = null;
    this.mostrarPagina();

    alPresionarAccion(this, () => this.avanzar());
    // B también avanza (como en Pokémon); ESC/Select salta el diálogo entero.
    alPresionarB(this, () => this.avanzar());
    alPresionarSalto(this, () => this.cerrar());
  }

  // Divide los párrafos del contenido en páginas que caben en la caja, usando
  // el word-wrap real del objeto de texto. Así un párrafo largo editado en el
  // JSON nunca se desborda: solo genera más páginas.
  paginar(parrafos) {
    const paginas = [];
    parrafos.forEach((parrafo) => {
      const lineas = this.texto.getWrappedText(parrafo);
      for (let i = 0; i < lineas.length; i += LINEAS_POR_PAGINA) {
        paginas.push(lineas.slice(i, i + LINEAS_POR_PAGINA).join('\n'));
      }
    });
    return paginas.length > 0 ? paginas : [''];
  }

  mostrarPagina() {
    const contenidoPagina = this.paginas[this.pagina];
    this.esperandoInput = false;
    this.indicador.setVisible(false);
    this.texto.setText('');

    if (contenidoPagina.length === 0) {
      this.terminarTipeo();
      return;
    }

    let letras = 0;
    this.tipeo = this.time.addEvent({
      delay: MS_POR_LETRA,
      repeat: contenidoPagina.length - 1,
      callback: () => {
        letras++;
        this.texto.setText(contenidoPagina.slice(0, letras));
        if (letras >= contenidoPagina.length) this.terminarTipeo();
      },
    });
  }

  terminarTipeo() {
    if (this.tipeo) {
      this.tipeo.remove();
      this.tipeo = null;
    }
    this.texto.setText(this.paginas[this.pagina]);
    this.esperandoInput = true;
    this.indicador.setVisible(true);
  }

  avanzar() {
    if (!this.esperandoInput) {
      // Aún tipeando: completar la página de una vez.
      this.terminarTipeo();
      return;
    }
    if (this.pagina < this.paginas.length - 1) {
      this.pagina++;
      this.mostrarPagina();
    } else {
      this.cerrar();
    }
  }

  cerrar() {
    if (this.insigniaPendiente) {
      desbloquearInsignia(this.registry, this.insigniaPendiente);
    }
    this.scene.stop();
    this.scene.resume(this.escenaPadre);
  }
}
