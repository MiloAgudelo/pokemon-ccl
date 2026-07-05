# CCL 2026 — Región Quial Interactiva
## Roadmap de desarrollo para Claude Code

Documento complementario al brief (`CCL2026_Juego_Interactivo_Brief.md`). Cada fase es una sesión de trabajo autocontenida con Claude Code. Los pasos marcados `[MILO]` son tareas humanas (generación/edición de assets, decisiones de contenido); el juego debe funcionar con placeholders mientras esos assets no existan.

**Regla de oro del proyecto**: nada se bloquea por un asset faltante. Todo asset tiene un placeholder generado por código (rectángulos de color, tiles sólidos, texto genérico) y una ruta de archivo fija donde el asset real lo reemplazará sin tocar código.

---

## Fase 0 — Esqueleto del proyecto

**Objetivo**: proyecto corriendo en el navegador con un canvas vacío estilo GBA.

1. Inicializar proyecto (Vite + Phaser 3, JavaScript). Estructura de carpetas:
   ```
   /src
     /scenes        (Boot, Title, NameInput, AvatarSelect, Intro, World, Dialogue)
     /data          (content.json, map data)
   /assets
     /tilesets      (placeholder: tileset generado por código)
     /sprites       (placeholder: rectángulo 16×32 de color)
     /ui            (marcos de diálogo, fuente)
     /audio         (vacío por ahora)
   /tools
     pixelate.py    (script de conversión IA→pixel art)
   ```
2. Configurar Phaser: resolución base 240×160 (pantalla GBA real), zoom 3x, `pixelArt: true`, `roundPixels: true`.
3. Cargar la fuente Press Start 2P (Google Fonts, OFL) para todo el texto in-game.
4. Escena Boot que carga assets y muestra pantalla de carga simple.

**Entregable**: página con canvas negro 720×480 nítido y texto "CCL 2026" en Press Start 2P.

---

## Fase 1 — Movimiento y colisión en mapa placeholder

**Objetivo**: un personaje placeholder camina por un mapa placeholder con colisiones. Es la validación técnica central.

1. Crear en código un tileset placeholder (tiles de colores sólidos: verde=pasto, gris=camino, azul=agua, café=muro).
2. Crear un mapa de prueba pequeño (20×15 tiles) directamente en JSON formato Tiled, con capa de suelo y capa de colisión.
3. Implementar movimiento **grid-based** (el personaje avanza tile por tile, como en Pokémon real — no movimiento libre de píxeles). Direcciones: flechas + WASD.
4. Colisión contra la capa de colisión del tilemap (arcade physics o chequeo de grilla manual — preferir chequeo de grilla, es más fiel al movimiento GBA y más simple).
5. Cámara que sigue al jugador con límites del mapa.
6. Sprite placeholder del jugador: rectángulo 16×32 con un triángulo indicando dirección.

**Entregable**: demo navegable donde el "personaje" camina por la grilla y no atraviesa muros.

`[MILO — puede hacerse en paralelo]`: descargar sprite sheet de Brendan/May (o Red/Leaf) de Spriters Resource y hacer el recolor scout en Aseprite/Piskel. Formato de entrega: PNG con grilla 16×32, 4 filas (abajo, izquierda, derecha, arriba) × 3 columnas (idle, paso 1, paso 2), fondo transparente. Guardar como `/assets/sprites/rover_m.png` y `/assets/sprites/rover_f.png`.

---

## Fase 2 — Sistema de diálogo y contenido data-driven

**Objetivo**: interactuar con objetos/NPCs abre cuadros de diálogo cuyo texto vive en `content.json`.

1. Crear `/src/data/content.json` con la estructura de las 15 pantallas de la Ayuda #1. Cada entrada: `id`, `titulo`, `paginas` (array de textos), `tipo` (npc/cartel/zona), `insignia` (opcional). **Poblar con el texto real del PDF de la Ayuda #1**; donde la ayuda diga `[PENDIENTE: ...]`, mantener el mismo marcador en el JSON.
2. Cuadro de diálogo estilo GBA: caja en la parte inferior, texto que se escribe letra por letra, indicador ▼ para avanzar, marco pixel art (placeholder: borde blanco simple).
3. Sistema de interacción: al estar adyacente a un objeto interactivo y presionar Z/Enter/Espacio, se abre el diálogo asociado por `id`.
4. NPCs placeholder: rectángulos de otro color sobre el mapa, definidos en una capa de objetos del JSON del mapa (posición + `content_id`).

**Entregable**: caminar hasta un NPC placeholder, presionar acción, leer el contenido real de una pantalla de la ayuda con paginación.

`[MILO]`: revisar/ajustar los textos de `content.json` cuando el equipo resuelva cada `[PENDIENTE]`. Nunca requiere tocar código.

---

## Fase 3 — Flujo de entrada (title → nombre → avatar → intro)

**Objetivo**: la experiencia personalizada completa antes de entrar al mapa.

1. **Title screen**: logo "Liga de Líderes · CCL 2026" (placeholder: texto en Press Start 2P), "▶ INICIAR AVENTURA" parpadeante.
2. **Input de nombre**: campo de texto estilo GBA (teclado nativo en móvil, input HTML superpuesto es aceptable). Guardar en estado global + localStorage… **Nota técnica**: si el juego se embebe en claude.ai usar solo estado en memoria; como página web propia, localStorage está bien para recordar al jugador.
3. **Selección de avatar**: dos sprites lado a lado (Rover H / Rover M), selección con flechas + acción. Placeholder: dos rectángulos de colores distintos hasta que existan los sprites reales.
4. **Intro del Profesor Oak**: secuencia de diálogo con el texto de la Pantalla 2 (la carta), usando el nombre del jugador interpolado ("¡{nombre}! Tu camino en el Movimiento Scout…"). Sprite de Oak placeholder.
5. Transición al mapa (fade a negro estilo GBA).

**Entregable**: flujo completo de inicio a mapa, con el nombre del jugador apareciendo en los diálogos.

`[MILO]`: 
- Sprite/retrato del Profesor Oak (existen sprites oficiales FRLG en Spriters Resource, solo descargar y recortar). Ruta: `/assets/sprites/oak.png`.
- Logo del CCL 2026 en pixel art para el title screen. Ruta: `/assets/ui/logo_ccl.png`. Placeholder mientras tanto: texto plano.

---

## Fase 4 — Mapa real: Liceo Quial + zona Cali

**Objetivo**: reemplazar el mapa placeholder por el mapa real del evento.

1. `[MILO]`: descargar tileset(s) de FireRed/LeafGreen (exteriores: caminos, pasto, árboles, cercas, edificios; interiores si se decide tener interiores). Guardar en `/assets/tilesets/`.
2. `[MILO + Claude Code]`: diseñar el layout en Tiled. Zonas mínimas:
   - Entrada/portería (contenido: pantallas 5 y 8)
   - Edificio principal / aulas (gimnasios de liderazgo, pantalla 6 — 6 puntos)
   - Zona de campamento con tiendas (pantalla 9)
   - Comedor (pantalla 10)
   - "Tienda" de equipamiento (pantalla 11)
   - Tablero de equipos (pantalla 12)
   - Zona de Acción Humanitaria con paleta cálida diferenciada (pantalla 7)
   - Afueras "zona Cali": Noche Cultural (pantalla 13) + hitos decorativos
   - Punto Hall of Fame (pantalla 15)
   Claude Code puede generar un primer layout del mapa en JSON de Tiled programáticamente como borrador, para que Milo lo refine visualmente en Tiled.
3. Cargar el mapa real en la escena World, migrar los puntos de interacción de la capa de objetos.
4. Implementar el script `/tools/pixelate.py` (Pillow): entrada PNG cualquiera → salida pixelada a resolución objetivo + paleta cuantizada (máx. 15 colores + transparencia, límite GBA). Uso: `python pixelate.py entrada.png salida.png --width 64`.

**Entregable**: mapa real navegable con todos los puntos de contenido ubicados.

`[MILO]`: generar con IA las piezas únicas (edificio del Liceo, Cristo Rey, Torre de Cali, Gato del Río), pasarlas por `pixelate.py`, limpiar en Aseprite/Piskel, entregar como PNGs individuales en `/assets/tilesets/landmarks/`.

---

## Fase 5 — Progresión: insignias y cierre

**Objetivo**: sensación de juego con objetivo, no solo museo navegable.

1. Tracker de insignias: HUD discreto (esquina superior) con 7 slots. Acción Humanitaria inicia desbloqueada (⚡); las otras 6 se desbloquean al visitar cada gimnasio.
2. Placeholder de insignias: círculos de colores. `[MILO]`: íconos pixel art de las 7 insignias, 16×16 o 24×24, en `/assets/ui/badges/`.
3. Al completar las 7: notificación estilo GBA ("¡Has obtenido todas las medallas de la Región Quial!") y se habilita el punto Hall of Fame.
4. Pantalla Hall of Fame: nombre del jugador, avatar, insignias, mensaje de cierre (texto pantalla 15). Si el generador de Trainer Card (workstream aparte) ya existe, enlazarlo aquí; si no, botón placeholder "Genera tu Trainer Card — Próximamente".
5. Easter egg de la Pokéball del Team Rocket: objeto oculto en el mapa que al interactuar muestra el QR/enlace al video del Staff. `[MILO]`: URL del video cuando exista; placeholder mientras tanto.

**Entregable**: loop completo jugable de inicio a Hall of Fame.

---

## Fase 6 — Móvil y pulido

**Objetivo**: que funcione bien en el celular, que es donde lo abrirá la mayoría.

1. **Marco de consola GBA en HTML/CSS** que envuelve el canvas (el wrapper `#consola` de `index.html` ya existe como punto de anclaje). Layout horizontal de GBA real: D-pad a la izquierda, botones A/B a la derecha, Start/Select abajo. Los botones del marco son los controles táctiles reales: D-pad = movimiento, A = acción/avanzar diálogo, B = cancelar (cerrar diálogo/volver). En desktop el marco es decorativo y el teclado sigue funcionando igual. La integración de input tiene un único punto de entrada: `src/systems/controles.js`. Referencias de concepto (todas son Game Boy vertical — adaptar a GBA horizontal): `chase-mew/pokemon-js` (GitHub), el Gameboy CodePen de Brandon Smith, `luttje/css-pokemon-gameboy` (GitHub). Probar en viewport angosto (~380px).
2. Ajuste de zoom responsivo: el canvas (y su marco GBA) escala al tamaño de pantalla manteniendo múltiplos enteros cuando sea posible.
3. Sonido (opcional, al final): música chiptune de fondo + SFX de pasos/diálogo. `[MILO]`: decidir si se usa música libre (OpenGameArt, licencias CC) o se omite. Botón de mute obligatorio si hay audio.
4. Optimización de carga: sprites y tilesets en atlas si el tiempo de carga lo amerita.
5. QA final: probar todos los puntos de contenido, verificar que ningún `[PENDIENTE]` visible haya quedado sin resolver o sin su placeholder "Próximamente" intencional.

**Entregable**: versión lista para compartir por link.

---

## Fase 7 — Despliegue

1. Build de producción (Vite build → estáticos).
2. Hosting: Vercel es la opción natural (ya está en el stack de herramientas disponibles); alternativa: GitHub Pages.
3. Decidir URL/subdominio y si se embebe en la ayuda digital vía iframe.
4. Prueba de humo en 3 dispositivos reales (Android gama media, iPhone, desktop).

---

## Resumen de dependencias [MILO]

| Asset / decisión | Fase donde se necesita | Placeholder mientras tanto |
|---|---|---|
| Sprites Rover H/M recoloreados | 1-2 | Rectángulo 16×32 con indicador de dirección |
| Sprite Profesor Oak | 3 | Rectángulo + nombre en el diálogo |
| Logo CCL pixel art | 3 | Texto en Press Start 2P |
| Tilesets FRLG descargados | 4 | Tileset de colores sólidos |
| Layout del mapa refinado en Tiled | 4 | Mapa borrador generado por código |
| Landmarks de Cali pixelados | 4 | Ausentes (el mapa funciona sin ellos) |
| Íconos de las 7 insignias | 5 | Círculos de colores |
| URL video Team Rocket | 5 | Texto "Próximamente" |
| Textos `[PENDIENTE]` resueltos | 2+ | El mismo marcador `[PENDIENTE]` o "Próximamente" |
| Decisión de audio | 6 | Sin audio |

---

## Disciplina de commits y revisiones de código

**Commits.** No commitear solo al final de cada fase: commitear cada vez que una unidad funcional queda completa y corriendo sin errores (ej. "sistema de movimiento grid-based", "cuadro de diálogo con paginación", "escena de selección de avatar"). Regla práctica: si el dev server corre limpio y algo nuevo funciona, se commitea. Mensajes en español, formato `Fase N: <qué se hizo>`. Nunca commitear código roto; si una fase queda a medias al cerrar la sesión, commitear con el sufijo `(WIP)` y anotarlo en la sección de estado.

**Revisiones de calidad.** Al completar cada fase con checkpoint marcado abajo, correr una revisión con la skill `thermo-nuclear-code-quality-review` sobre los archivos modificados desde la última revisión, y atender los hallazgos críticos antes de avanzar:

- ✔ Checkpoint 1: al cerrar la **Fase 1** (movimiento y colisión — el núcleo del juego; los defectos estructurales aquí se propagan a todo lo demás).
- ✔ Checkpoint 2: al cerrar la **Fase 3** (fin del bloque de fases automáticas; el proyecto ya tiene todas sus escenas y sistemas base).
- ✔ Checkpoint 3: al cerrar la **Fase 5** (loop completo con progresión; última revisión estructural antes del pulido).
- ✔ Checkpoint 4: al cerrar la **Fase 6**, antes del despliegue.

Los hallazgos no críticos (mejoras deseables) se anotan en la sección de estado como deuda técnica, con el archivo y la razón, para decidir después si se atienden.

---

## Cómo usar este roadmap con Claude Code

Sugerencia de arranque de cada sesión:

> "Estamos construyendo el juego CCL 2026 Región Quial. Lee `CCL2026_Juego_Interactivo_Brief.md` y `CCL2026_Roadmap.md`. Hoy vamos a ejecutar la Fase N. El estado actual del proyecto es: [breve descripción]. Recuerda la regla de oro: nada se bloquea por assets faltantes, todo tiene placeholder con ruta fija."

Y al cerrar cada fase, pedirle que actualice una sección de estado al final de este archivo (qué se completó, qué quedó pendiente) para que la siguiente sesión arranque con contexto.

---

## Estado del proyecto

_(Claude Code: actualizar esta sección al final de cada fase.)_

- [x] Fase 0 — Esqueleto _(2026-07-04)_
- [x] Fase 1 — Movimiento y colisión _(2026-07-04, Checkpoint 1 ✔)_
- [x] Fase 2 — Diálogo y contenido _(2026-07-04)_
- [x] Fase 3 — Flujo de entrada _(2026-07-04, Checkpoint 2 ✔)_
- [ ] Fase 4 — Mapa real
- [ ] Fase 5 — Progresión
- [ ] Fase 6 — Móvil y pulido
- [ ] Fase 7 — Despliegue

### Notas por fase

**Fase 0 (2026-07-04)** — Completada sin desviaciones. Detalles de implementación:
- El contenido de la Ayuda #1 se toma de `CCL2026_Ayuda1_Contenido.md` (conversión fiel del PDF, confirmado por Milo como fuente oficial).
- Fuente Press Start 2P auto-hospedada en `/assets/ui/fonts/PressStart2P.ttf` (descargada de Google Fonts, OFL) — no depende de red en runtime.
- Vite sirve la carpeta `/assets` como raíz pública (`publicDir: 'assets'`): la ruta en disco de los assets [MILO] es exactamente la del roadmap (ej. `/assets/sprites/rover_m.png`); en código se piden sin el prefijo (`/sprites/rover_m.png`).
- `tools/pixelate.py` existe como stub; su implementación real es tarea de la Fase 4.

**Fase 1 (2026-07-04)** — Completada. Movimiento grid-based tile por tile (flechas + WASD), colisión por chequeo de grilla contra la capa `colision` del tilemap, cámara con límites, sprite placeholder 16×32 con triángulo direccional y layout de frames idéntico al PNG real que entregará Milo (3 col × 4 filas). Desviaciones/decisiones:
- Los assets [MILO] faltantes se detectan con un chequeo HEAD silencioso (`src/systems/loader.js`) en vez de dejar que el loader de Phaser falle con errores rojos en consola. Al soltar el PNG real en `/assets/sprites/` se usa automáticamente.
- **Checkpoint 1 (thermo-nuclear) ✔** — 0 críticos, 1 mayor y 4 menores. Atendidos: patrón genérico "asset real o placeholder" extraído a `src/systems/loader.js` (mayor); clave+datos del mapa unificados en `src/data/maps.js`; claves del registry centralizadas en `REGISTRY_KEYS` (`src/config.js`); `detener()` con early-return si ya está idle.
- **Deuda técnica** (no crítica, revisar en Fase 7): la URL de la fuente en `index.html` (`/ui/fonts/...`) asume despliegue en raíz; con `base` distinto (ej. GitHub Pages) hay que verificar que Vite la reescriba o usar ruta relativa. Las URLs de assets en runtime ya usan `import.meta.env.BASE_URL`.
- **Compromiso de diseño para Fase 2** (de la revisión): el diálogo se implementa como escena overlay paralela que pausa `World` (`scene.pause`/`resume`), no como flags booleanos dentro del `update()` de World.

**Fase 2 (2026-07-04)** — Completada. `content.json` con las 15 pantallas de la Ayuda #1 (texto real, `[PENDIENTE]` intactos), cuadro de diálogo GBA (tipeo letra a letra, indicador triangular parpadeante, paginación automática con word-wrap real — un párrafo largo en el JSON solo genera más páginas, nunca se desborda), interacción con Z/Enter/Espacio/tap, y 5 puntos de interacción en el mapa de prueba (capitulos, convocados, alimentacion, equipamiento, ruta_acceso) definidos en la capa de objetos con `content_id`. El diálogo es escena overlay que pausa World (compromiso del Checkpoint 1 cumplido). Desviaciones/decisiones:
- Los emojis decorativos del documento (🗺📅🍽 etc.) se omiten en `content.json`: Press Start 2P no tiene esos glifos y renderizarían rotos a 8px. Ninguna palabra del texto se perdió. Igual con ▶/▼: los indicadores se dibujan como triángulos, no como glifos.
- Se agregó "sistema" como `tipo` extra (portada, intro_oak) para las pantallas que consumen escenas propias en vez de NPCs del mapa; "npc/cartel/zona" se mantienen para puntos del mapa.
- La entrada `portada` lleva campos extra (`subtitulo`, `prompt`) que usará el title screen (Fase 3).
- Los NPCs bloquean el paso (se interactúa desde la casilla adyacente, como en Pokémon).
- `{nombre}` se interpola desde el registry; default "ROVER" hasta que exista el input de nombre (Fase 3).

**Fase 3 (2026-07-04)** — Completada. Flujo completo: title screen (logo [MILO] con fallback a texto, prompt parpadeante) → input de nombre (campo HTML estilo GBA, teclado nativo en móvil, validación de vacío, mayúsculas, registry + localStorage con try/catch para contextos que lo bloqueen) → selección de avatar (flechas/A/D + acción; tap selecciona, segundo tap confirma) → intro del Profesor Oak (pantalla 2 como diálogo con `{nombre}` interpolado, sprite placeholder) → fundido al mapa. Fundidos GBA entre todas las escenas (`src/systems/transiciones.js`). Verificado de punta a punta, incluido el camino de replay (volver al title y repetir el flujo).
- **Checkpoint 2 (thermo-nuclear) ✔** — 1 crítico, 3 mayores, 5 menores. Atendidos (hallazgos 1-6): guard de transición sin estado propio (bloquea solo con fade-out en curso; un fade-in congelado por pausa ya no soft-lockea — bug encontrado y corregido durante la verificación), listener RESUME de Intro con `once`, botón de acción centralizado en `src/systems/controles.js` (filtro de auto-repeat incluido: mantener ENTER ya no atraviesa el flujo), tap-confirma en avatar, valor del input sin interpolación HTML, claves de registry/localStorage unificadas en `REGISTRY_KEYS`.
**Avance Fase 4 (2026-07-04, tarea [MILO] delegada a Claude)** — Tilesets FRLG descargados de The Spriters Resource y verificados visualmente. En `/assets/tilesets/frlg/`: `tileset_2.png` (exteriores: pasto, agua, árboles, caminos, rocas — el principal para el mapa), `tileset_1.png` (edificios urbanos), `edificios.png` (edificios con nombre: lab de Oak, Centro Pokémon, gimnasio, casas), `tileset_general.png` (árboles/flores/edificios, fondo magenta a limpiar), `tiles_animados.png` (agua/flores/fuente). En `/assets/sprites/fuentes/`: `frlg_jugadores_red_leaf.png` (Red y Leaf overworld, frames de caminata 4 direcciones — materia prima para el recolor scout) y `frlg_npcs_overworld.png` (NPCs overworld, incluye a Oak para recortar). **Ojo**: son hojas de sprites con espaciado mixto y fondos de color, no tilesets listos para Tiled; el recorte/reorganización a grilla 16×16 con transparencia es parte de la Fase 4.

- **Deuda técnica** (hallazgos menores 7-9, atender a más tardar en Fase 5): (7) `WorldScene` — ternario textura-por-tipo → tabla declarativa cuando la Fase 4 agregue tipos ("zona" hoy cae en NPC por el else); (8) `TitleScene` usa `getContenido('portada')` sin guard contra null — agregar `getContenidoRequerido` que falle con mensaje claro para entradas tipo "sistema"; (9) paleta de colores (`#88a0b8`, `#f8d048`) y timers de parpadeo duplicados → `PALETA` en config + helper `parpadear` cuando la Fase 5 construya el HUD.
