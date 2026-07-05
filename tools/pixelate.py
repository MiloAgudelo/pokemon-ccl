"""Herramienta del pipeline de assets: convierte un PNG generado por IA a pixel art.

Reduce la resolución a la grilla objetivo, cuantiza a una paleta limitada
estilo GBA (máx. 15 colores + transparencia) y ajusta cada canal a múltiplos
de 8 (el hardware GBA usa 5 bits por canal). El resultado se coloca en el
mapa como decoración; la limpieza final es manual (Aseprite/Piskel).

Uso:
    python tools/pixelate.py entrada.png salida.png --ancho 64
    python tools/pixelate.py entrada.png salida.png --ancho 96 --colores 12

Requiere Pillow:  pip install Pillow
"""

import argparse
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Falta Pillow. Instálalo con:  pip install Pillow')


def pixelar(ruta_entrada, ruta_salida, ancho_objetivo, max_colores):
    img = Image.open(ruta_entrada).convert('RGBA')

    alto_objetivo = max(1, round(img.height * ancho_objetivo / img.width))
    # Ajustar el alto a la grilla de 16 px (tiles GBA) si queda cerca.
    resto = alto_objetivo % 16
    if 0 < resto <= 3:
        alto_objetivo -= resto
    elif resto >= 13:
        alto_objetivo += 16 - resto

    reducida = img.resize((ancho_objetivo, alto_objetivo), Image.LANCZOS)

    # Separar alfa antes de cuantizar (quantize no maneja RGBA bien).
    alfa = reducida.getchannel('A')
    rgb = reducida.convert('RGB')
    cuantizada = rgb.quantize(colors=max_colores, method=Image.MEDIANCUT, dither=Image.NONE)
    resultado = cuantizada.convert('RGB')

    # Canales a múltiplos de 8, como la paleta de 15 bits del GBA.
    resultado = resultado.point(lambda v: (v // 8) * 8)

    resultado = resultado.convert('RGBA')
    resultado.putalpha(alfa.point(lambda a: 255 if a >= 128 else 0))

    resultado.save(ruta_salida)
    print(f'ok: {ruta_salida} ({ancho_objetivo}x{alto_objetivo}, <= {max_colores} colores)')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('entrada', help='PNG de entrada (ilustración generada por IA)')
    parser.add_argument('salida', help='PNG de salida pixelado')
    parser.add_argument('--ancho', type=int, default=64, help='ancho objetivo en px (default 64)')
    parser.add_argument('--colores', type=int, default=15, help='máx. colores de paleta (default 15)')
    args = parser.parse_args()
    pixelar(args.entrada, args.salida, args.ancho, args.colores)
