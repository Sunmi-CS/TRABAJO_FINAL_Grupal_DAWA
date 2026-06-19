import { supabase, PETS_BUCKET, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Sube un avatar de usuario al bucket de Supabase Storage (carpeta avatars/)
 */
export const uploadAvatar = async (
  buffer: Buffer,
  mimetype: string,
  originalName: string,
  userId: string,
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
  // Usar userId como nombre para sobreescribir la foto anterior del mismo usuario
  const fileName = `${userId}${ext}`;
  const filePath = `avatars/${fileName}`;

  // Intentar eliminar la foto anterior del usuario (si existe)
  await supabase.storage.from(PETS_BUCKET).remove([`avatars/${userId}.jpg`, `avatars/${userId}.jpeg`, `avatars/${userId}.png`, `avatars/${userId}.webp`]);

  const { error } = await supabase.storage
    .from(PETS_BUCKET)
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir avatar: ${error.message}`);
  }

  const { data } = supabase.storage.from(PETS_BUCKET).getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
  };
};
