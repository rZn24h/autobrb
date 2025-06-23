import imageCompression from 'browser-image-compression';

export interface ProcessedImage {
  file: File;
  url: string;
}

export async function processImage(file: File): Promise<ProcessedImage | null> {
  try {
    // 1. Verifică dimensiunea fișierului (8MB = 8 * 1024 * 1024 bytes)
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Imaginea este prea mare. Dimensiunea maximă permisă este 8MB.');
    }

    // 2. Verifică dimensiunile imaginii
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    if (img.width > 4000 || img.height > 4000) {
      URL.revokeObjectURL(imageUrl);
      throw new Error('Dimensiunile imaginii sunt prea mari. Dimensiunea maximă permisă este 4000x4000 pixeli.');
    }

    // 3. Comprimă imaginea
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    const compressedUrl = URL.createObjectURL(compressedFile);

    // Eliberează URL-ul original
    URL.revokeObjectURL(imageUrl);

    return {
      file: compressedFile,
      url: compressedUrl
    };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Eroare la procesarea imaginii: ${error.message}`);
    }
    throw error;
  }
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
} 