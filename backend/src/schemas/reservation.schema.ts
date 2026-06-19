import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

export const createReservationSchema = z.object({
  reservationDate: z.coerce.date({
    errorMap: () => ({ message: 'Fecha de reserva inválida' }),
  }),
  reservationTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida. Use formato HH:MM'),
  petId: z.string().min(1, 'La mascota es requerida'),
  serviceId: z.string().min(1, 'El servicio es requerido'),
  notes: z.string().max(500).optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.nativeEnum(ReservationStatus, {
    errorMap: () => ({ message: 'Estado de reserva inválido' }),
  }),
  notes: z.string().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;
