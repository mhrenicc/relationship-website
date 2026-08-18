/**
 * Shrinks a photograph in the browser before it is uploaded.
 *
 * A Server Action request body is capped — 1MB by Next's default, about 4.5MB
 * by Vercel whatever the config says — and a phone photograph is 3-5MB, so
 * sending originals simply fails. Downscaling here puts a request at roughly
 * 600KB and keeps uploads working from a phone on mobile data.
 *
 * The trade-off, stated plainly: the original never reaches the server, so the
 * archive holds this version and not the camera's. 2800px is the largest
 * variant we store anyway, so nothing that would have been kept is lost.
 */
const MAX_EDGE = 2800;
const QUALITY = 0.85;

export async function downscale(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  // `imageOrientation: "from-image"` applies the EXIF rotation while decoding.
  // Without it a portrait phone photo arrives on its side, and the tag is lost
  // once the canvas has flattened it.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // HEIC and anything else the browser cannot decode: send it as it is and
    // let the server decide, rather than dropping the photograph.
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) return file;

  // Only worth it if it actually got smaller.
  if (blob.size >= file.size && scale === 1) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
