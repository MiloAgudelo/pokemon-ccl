# CCL 2026 — Región Quial Interactiva
## Brief técnico y creativo para desarrollo (Claude Code)

Versión: borrador de planeación · No incluye código, solo especificación para construir.

---

## 1. Visión general

Gamificar la Ayuda #1 del CCL 2026 como un mini-juego 2D navegable, con estética Game Boy Advance (Pokémon Ruby/Sapphire/Emerald/FireRed, era 2002-2004). El jugador crea su Rover, entra a una versión pixel-art del Liceo Quial con alrededores inspirados en Cali, y descubre la información logística y pedagógica del evento caminando e interactuando con NPCs y objetos, en vez de leyendo un documento estático.

No reemplaza la ayuda escrita — es una capa jugable adicional que expone el mismo contenido.

---

## 2. Stack técnico recomendado

| Pieza | Elección | Por qué |
|---|---|---|
| Motor de juego | **Phaser 3** (JavaScript) | Framework maduro, gratuito, con sistema de tilemaps y colisión "arcade physics" nativo. No requiere programar física de colisiones a mano. |
| Editor de mapas | **Tiled Map Editor** (escritorio, gratuito) | Se pintan las capas de suelo, decoración y colisión visualmente. Exporta JSON que Phaser consume directo. |
| Formato de mapa | Tilemap basado en grilla de **16×16 px** (estándar GBA) | Compatibilidad directa con tilesets y sprites reales de la era Gen III. |
| Sprite del personaje | **16×32 px** por frame (estándar de personaje de 2 tiles de alto) | Igual razón — encaja con el resto de assets sin reescalar. |
| Renderizado | Zoom **2x o 3x** con escalado nearest neighbor (`pixelArt: true` en Phaser, sin antialiasing) | FireRed/LeafGreen también usa tiles de 16×16; la nitidez viene del escalado en múltiplos enteros y del detalle del tileset, no de tiles más grandes. |
| Fuente de tilesets | Prioridad: **FireRed/LeafGreen**, complemento: Emerald | Estética preferida: más detalle y mejor paleta que Ruby/Sapphire dentro del mismo formato 16×16. |
| Distribución | Página web independiente (HTML/JS empaquetado) | Se puede embeber en la ayuda digital o compartir como link aparte. |

**Alternativas descartadas y por qué:**
- *RPG Maker MZ*: más rápido para prototipar, pero licencia de pago, menos control sobre el empaquetado web y peor integración con un flujo de assets custom.
- *PixiJS puro / Canvas manual*: control total, pero obliga a programar colisión y sistema de tiles desde cero — justo lo que se quiere evitar.
- *Kaboom/Kaplay*: liviano y moderno, pero el tooling de tilemaps es menos maduro que el de Phaser + Tiled.

---

## 3. Pipeline de assets visuales

### 3.1 Principio general

La IA generativa de imágenes es poco confiable para:
- Tilesets sembrables (seamless) en pixel art.
- Sprites animados multi-frame consistentes entre sí.

La IA generativa **sí** sirve para:
- Piezas únicas sueltas (un edificio, un monumento, un logo) generadas como imagen fija y luego adaptadas a pixel art manualmente.

### 3.2 Mapa base

- Partir de un **tileset real de FireRed/LeafGreen** (rutas, pasto, cercas, edificios genéricos, agua) obtenido de fuentes de sprites de la comunidad (Spriters Resource / Bulbagarden Archives / veekun). Complementar con tiles de Emerald donde FRLG no tenga el elemento necesario.
- Editar y recombinar ese tileset en Tiled para construir el layout del Liceo Quial.
- Elementos únicos (edificio principal del Liceo, hitos de Cali como el Cristo Rey, la Torre de Cali, el Gato del Río) se generan por separado con IA como ilustración fija, luego se reducen de resolución y se ajustan a la paleta GBA (15-bit / paleta limitada) para que no desentonen visualmente con el resto del mapa. Este ajuste es manual o semi-manual (herramienta tipo Aseprite/Piskel), no un paso de IA.
- Estos elementos se colocan como objetos decorativos sobre el tileset base, no como parte del tileset sembrable.
- **Herramienta del pipeline**: el proyecto debe incluir un script utilitario (Python/Pillow) que convierta un PNG generado por IA a pixel art: reducción de resolución a la grilla objetivo + cuantización a paleta GBA + nearest neighbor. La limpieza final es manual (Aseprite, Piskel o Pixelorama).

### 3.3 Sprite del personaje

- Base: sprite sheet del protagonista de Ruby/Sapphire/Emerald (Brendan y May) de Spriters Resource — ya incluye las 4 direcciones y frames de caminar. Alternativa a evaluar: los protagonistas de FireRed/LeafGreen (Red y Leaf), cuyos sprites overworld son estilísticamente idénticos y coherentes con el tileset FRLG elegido.
- Recolor manual de la ropa a uniforme scout (camisa caqui, pañoleta del evento) manteniendo la silueta y el estilo de píxel original.
- Dos variantes (masculino/femenino) para la selección de avatar.
- 4 direcciones × 3 frames de caminata = 12 frames por variante, en el layout de grilla estándar de Pokémon.

### 3.4 Nota práctica sobre las fuentes

Los sprites y tilesets de Pokémon son propiedad de Nintendo/Game Freak. Se usan aquí editados, con fines internos y no comerciales, para un evento Scout — es una práctica común en proyectos fan no comerciales, pero vale la pena que el equipo de Comunicaciones lo tenga presente si en algún momento se piensa distribuir el juego fuera del ámbito interno del evento.

---

## 4. Arquitectura de contenido (dialogue/data-driven)

El texto e información de cada pantalla de la ayuda **no debe vivir hardcodeado en el código del juego**. Debe vivir en un archivo de datos separado (JSON o similar), donde cada entrada representa un punto de interacción del mapa: NPC, cartel, objeto.

Ventaja directa: cuando el equipo resuelva un campo `[PENDIENTE]` de la ayuda original, se edita el archivo de datos — no se toca el juego.

### 4.1 Mapeo Pantallas de la Ayuda → Elementos del juego

| Pantalla (Ayuda #1) | Elemento en el juego |
|---|---|
| 1. Portada | Title screen del juego |
| 2. Intro del Profesor Oak | Cutscene inicial de diálogo (con Pokéball-QR oculta como easter egg clickeable, enlaza al video de Staff) |
| 3. Región Quial / mapa | Vista general del mapa al iniciar la exploración |
| 4. Cuenta regresiva / capítulos | Cartel o NPC informativo cerca de la entrada |
| 5. Trainer Card / convocados | NPC de registro en la portería |
| 6. Gimnasios de liderazgo | 6 edificios/NPCs distribuidos en el mapa, cada uno desbloquea una insignia al visitarlo. Acción Humanitaria aparece **pre-desbloqueada**, igual que en el diseño original |
| 7. Misión especial / Acción Humanitaria | Zona narrativa diferenciada (paleta cálida), fuera del edificio principal |
| 8. Ruta de acceso | NPC/cartel en la entrada del mapa |
| 9. Campamento | Zona de tiendas de campaña navegable |
| 10. Alimentación | NPC en zona de comedor |
| 11. Equipamiento / qué llevar | NPC tipo "tienda" con checklist |
| 12. Equipos / selección de región | Tablero interactivo o NPC |
| 13. Noche Cultural | Punto de interés en la "zona Cali", fuera del Liceo |
| 14. Código de entrenador / vestuario | NPC cerca de la zona de dormitorios/tiendas |
| 15. Hall of Fame / cierre | Pantalla de cierre al completar el recorrido (idealmente conectada al generador de Trainer Card ya conceptualizado en otro workstream) |

---

## 5. Flujo de usuario (UX)

1. **Title screen** — "Liga de Líderes · CCL 2026" con botón de inicio.
2. **Input de nombre** — pantalla simple pidiendo el nombre del jugador.
3. **Selección de avatar** — Rover hombre o mujer.
4. **Intro del Profesor Oak** — diálogo de bienvenida y contexto narrativo (texto de Pantalla 2).
5. **Spawn en el mapa** — el jugador aparece en la entrada del Liceo Quial.
6. **Exploración libre** — movimiento con flechas/WASD en desktop, D-pad táctil en móvil. Colisión con edificios y límites del mapa.
7. **Interacciones** — al acercarse a un NPC/objeto y presionar una tecla de acción (o tap en móvil), se abre un cuadro de diálogo con el contenido de esa pantalla.
8. **Progreso de insignias** — un tracker simple en pantalla (ej. esquina superior) refleja cuántos gimnasios se han visitado.
9. **Cierre** — al completar el recorrido (o visitar el punto de Hall of Fame), se muestra la pantalla de cierre.

---

## 6. Fases de desarrollo sugeridas

**Fase 1 — MVP jugable**
Title → nombre → avatar → intro de Oak → un mapa pequeño con 4-5 puntos de interacción, usando assets mínimamente editados. Objetivo: validar que la sensación de juego es la correcta antes de invertir en producción de assets completa.

**Fase 2 — Contenido completo**
Mapa completo con las 15 pantallas representadas, tracker de insignias funcional, conexión con el generador de Trainer Card en el Hall of Fame.

**Fase 3 — Pulido**
Easter eggs adicionales, hitos de Cali, sonido/música estilo chiptune, controles táctiles refinados para móvil.

---

## 7. Decisiones pendientes antes de construir

Estas preguntas no bloquean el inicio del desarrollo, pero conviene resolverlas pronto:

- ¿El layout del mapa debe imitar el Liceo Quial real o ser una versión libre/estilizada?
- Prioridad de controles móviles: ¿D-pad táctil desde la Fase 1, o desktop-first con móvil en Fase 3?
- ¿Dónde se aloja el juego final? (embebido en la ayuda digital, link independiente, ambos)
- ¿Se lanza con placeholders "Próximamente" en los campos que hoy están `[PENDIENTE]` en la ayuda, o se espera a tener todo cerrado antes de mostrar esas secciones en el juego?

---

## 8. Referencias de assets ya identificadas

- Sprite sheet del jugador (Brendan/May, Ruby/Sapphire/Emerald) — The Spriters Resource
- Tilesets y sprites overworld Gen III — Bulbagarden Archives, veekun.com/dex/downloads
- Fuente tipográfica: Press Start 2P (Google Fonts, licencia OFL) — ya definida en el manual de marca
