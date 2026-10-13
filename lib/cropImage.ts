export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export async function getCroppedImage(
  imageSrc: string,
  crop: PixelCrop,
  maxDimension = 960,
  quality = 0.85
): Promise<string> {
  const img = await loadImage(imageSrc);
  let { width, height } = crop;
  if (width > height && width > maxDimension) {
    height = Math.round((height * maxDimension) / width);
    width = maxDimension;
  } else if (height > maxDimension) {
    width = Math.round((width * maxDimension) / height);
    height = maxDimension;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
