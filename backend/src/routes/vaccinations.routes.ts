import { Router } from 'express';
import {
  deleteVaccination,
  updateVaccination,
} from '../controllers/vaccinations.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { vaccinationSchema } from '../schemas/vaccination.schema';

const router = Router();

router.use(authenticate);

router.put('/:vaccinationId', validate(vaccinationSchema), updateVaccination);
router.delete('/:vaccinationId', deleteVaccination);

export default router;
