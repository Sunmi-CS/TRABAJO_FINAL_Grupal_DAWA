import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Cliente con service role key para operaciones de storage (sin restricciones RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const PETS_BUCKET = process.env.SUPABASE_BUCKET_PETS ?? 'pets-images';
export const MAX_FILE_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB ?? '5', 10)) * 1024 * 1024;
export const ALLOWED_MIME_TYPES = (process.env.ALLOWED_MIME_TYPES ?? 'image/jpeg,image/jpg,image/png,image/webp')
  .split(',')
  .map((t) => t.trim());
