// Convierte una foto cualquiera en una versión "pixel-art": la reduce a pocos
// bloques de color y la vuelve a escalar sin suavizado, para que combine con
// el resto de la interfaz retro. Todo corre en el navegador (canvas), sin
// servidor ni IA de por medio.

interface PixelateOptions {
  /** Bloques de "pixel" a lo largo del lado más grande. */
  pixelSize?: number;
  /** Tamaño final del lienzo en px. */
  outputSize?: number;
  /** Niveles de color por canal (menos niveles = look más retro). */
  levels?: number;
}

export async function pixelateImage(
  file: File,
  { pixelSize = 48, outputSize = 320, levels = 6 }: PixelateOptions = {}
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const downscale = pixelSize / Math.max(bitmap.width, bitmap.height);
  const smallWidth = Math.max(1, Math.round(bitmap.width * downscale));
  const smallHeight = Math.max(1, Math.round(bitmap.height * downscale));

  // 1. Reduce la imagen a un puñado de bloques (el suavizado del navegador
  // hace de promedio de color por bloque, como un mip-map).
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = smallWidth;
  smallCanvas.height = smallHeight;
  const smallCtx = smallCanvas.getContext("2d");
  if (!smallCtx) throw new Error("No se pudo preparar el lienzo.");
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.drawImage(bitmap, 0, 0, smallWidth, smallHeight);
  bitmap.close();

  // 2. Posteriza los colores para que se vea más "8-bit" y menos foto borrosa.
  const imageData = smallCtx.getImageData(0, 0, smallWidth, smallHeight);
  const step = 255 / (levels - 1);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
  smallCtx.putImageData(imageData, 0, 0);

  // 3. Escala hacia arriba sin suavizado, para bloques nítidos.
  const upscale = outputSize / Math.max(smallWidth, smallHeight);
  const finalWidth = Math.round(smallWidth * upscale);
  const finalHeight = Math.round(smallHeight * upscale);

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = finalWidth;
  finalCanvas.height = finalHeight;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) throw new Error("No se pudo preparar el lienzo.");
  finalCtx.imageSmoothingEnabled = false;
  finalCtx.drawImage(smallCanvas, 0, 0, finalWidth, finalHeight);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen pixel-art.")),
      "image/webp",
      0.92
    );
  });
}
