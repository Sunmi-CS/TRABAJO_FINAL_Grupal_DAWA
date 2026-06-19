import multer from 'multer';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../config/supabase';

// Almacenamos en memoria para luego subir a Supabase Storage
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato no permitido. Use: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

export const uploadPetPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
}).single('photo');

export const uploadAvatarPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
}).single('avatar');
