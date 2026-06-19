import { supabase, PETS_BUCKET, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Sube una imagen al bucket pets-images en Supabase Storage
 */
export const uploadPetImage = async (
  buffer: Buffer,
  mimetype: string,
  originalName: string,
): Promise<UploadResult> => {
  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    throw new Error(
      `Formato de imagen no permitido. Use: ${ALLOWED_MIME_TYPES.join(', ')}`,
    );
  }

  // Validar tamaño
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    const maxMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    throw new Error(`El archivo excede el tamaño máximo de ${maxMB}MB`);
  }

  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const fileName = `${uuidv4()}${ext}`;
  const filePath = `pets/${fileName}`;

  const { error } = await supabase.storage
    .from(PETS_BUCKET)
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(PETS_BUCKET).getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
  };
};

/**
 * Actualiza una imagen existente en Supabase Storage
 */
export const updatePetImage = async (
  oldPath: string | null,
  buffer: Buffer,
  mimetype: string,
  originalName: string,
): Promise<UploadResult> => {
  // Eliminar imagen anterior si existe
  if (oldPath) {
    await deletePetImage(oldPath);
  }
  return uploadPetImage(buffer, mimetype, originalName);
};

/**
 * Elimina una imagen de Supabase Storage dado su path
 */
export const deletePetImage = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(PETS_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error(`Error al eliminar imagen ${filePath}:`, error.message);
    // No lanzar error para no bloquear otras operaciones
  }
};

/**
 * Extrae el path relativo de una URL pública de Supabase
 */
export const extractPathFromUrl = (publicUrl: string): string | null => {
  try {
    const url = new URL(publicUrl);
    // El path tiene formato: /storage/v1/object/public/BUCKET/path
    const parts = url.pathname.split(`/${PETS_BUCKET}/`);
    if (parts.length < 2) return null;
    return parts[1];
  } catch {
    return null;
  }
};
