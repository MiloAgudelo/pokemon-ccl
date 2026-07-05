import { defineConfig } from 'vite';

// La carpeta /assets del proyecto se sirve como raíz pública:
// el archivo en disco /assets/sprites/rover_m.png se pide como URL /sprites/rover_m.png.
// Así los assets reales [MILO] se sueltan en /assets/... sin tocar código.
export default defineConfig({
  publicDir: 'assets',
});
