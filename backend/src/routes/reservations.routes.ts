import { Router } from 'express';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} from '../controllers/reservations.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from '../schemas/reservation.schema';

const router = Router();

router.use(authenticate);

router.get('/', getReservations);
router.get('/:id', getReservationById);
router.post('/', validate(createReservationSchema), createReservation);
router.put('/:id', validate(updateReservationStatusSchema), updateReservationStatus);
router.delete('/:id', deleteReservation);

export default router;
