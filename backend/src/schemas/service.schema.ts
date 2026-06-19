import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().min(1, 'La descripción es requerida').max(500),
  price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  duration: z.coerce.number().int().min(1, 'La duración debe ser al menos 1 minuto'),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
