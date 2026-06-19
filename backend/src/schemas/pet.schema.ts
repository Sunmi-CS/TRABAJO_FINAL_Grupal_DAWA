import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  species: z.string().min(1, 'La especie es requerida').max(50),
  breed: z.string().max(100).optional(),
  age: z.coerce.number().int().min(0, 'La edad debe ser positiva').max(50),
  weight: z.coerce.number().min(0.1, 'El peso debe ser mayor a 0').max(500),
  notes: z.string().max(500).optional(),
});

export const updatePetSchema = createPetSchema.partial();

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
