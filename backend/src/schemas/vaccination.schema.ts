import { z } from 'zod';

const dateString = z.string().min(1, 'La fecha es requerida').refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  'La fecha no es valida',
);

export const vaccinationSchema = z.object({
  name: z.string().min(2, 'El nombre de la vacuna es requerido').max(100),
  applicationDate: dateString,
  nextDueDate: dateString.nullable().optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => {
  if (!data.nextDueDate) return true;
  return new Date(data.nextDueDate) >= new Date(data.applicationDate);
}, {
  message: 'La proxima dosis no puede ser anterior a la aplicacion',
  path: ['nextDueDate'],
});

export type VaccinationInput = z.infer<typeof vaccinationSchema>;
