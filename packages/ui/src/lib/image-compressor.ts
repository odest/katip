export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

export interface CompressedImage {
  dataUrl: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.8,
  format: "webp",
};

export async function compressImage(
  source: File | Blob | string,
  options: CompressImageOptions = {}
): Promise<CompressedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const img = await loadImage(source);
  const originalSize = await getSourceSize(source);

  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxWidth,
    opts.maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, 0, 0, width, height);

  const mimeType = getMimeType(opts.format);
  const blob = await canvasToBlob(canvas, mimeType, opts.quality);
  const dataUrl = canvas.toDataURL(mimeType, opts.quality);

  return {
    dataUrl,
    blob,
    originalSize,
    compressedSize: blob.size,
    compressionRatio: blob.size / originalSize,
    width,
    height,
  };
}

export async function compressDataUrl(
  dataUrl: string,
  options: CompressImageOptions = {}
): Promise<CompressedImage> {
  return compressImage(dataUrl, options);
}

export async function compressFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressedImage> {
  return compressImage(file, options);
}

async function loadImage(
  source: File | Blob | string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));

    if (typeof source === "string") {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
    }
  });
}

async function getSourceSize(source: File | Blob | string): Promise<number> {
  if (source instanceof File || source instanceof Blob) {
    return source.size;
  }
  if (source.startsWith("data:")) {
    const base64 = source.split(",")[1];
    if (base64) {
      return Math.ceil((base64.length * 3) / 4);
    }
  }
  return 0;
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    } else {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }

    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  return { width, height };
}

function getMimeType(format: "webp" | "jpeg" | "png"): string {
  const mimeTypes = {
    webp: "image/webp",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  return mimeTypes[format];
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      mimeType,
      quality
    );
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
