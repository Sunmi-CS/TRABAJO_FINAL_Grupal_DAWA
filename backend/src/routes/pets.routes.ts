import { Router } from 'express';
import {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} from '../controllers/pets.controller';
import {
  createVaccination,
  getVaccinationsByPet,
} from '../controllers/vaccinations.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadPetPhoto } from '../middlewares/upload.middleware';
import { createPetSchema, updatePetSchema } from '../schemas/pet.schema';
import { vaccinationSchema } from '../schemas/vaccination.schema';

const router = Router();

router.use(authenticate);

router.get('/', getPets);
router.get('/:petId/vaccinations', getVaccinationsByPet);
router.post('/:petId/vaccinations', validate(vaccinationSchema), createVaccination);
router.get('/:id', getPetById);

router.post(
  '/',
  uploadPetPhoto,
  (req, _res, next) => {
    // Parsear campos numéricos del FormData antes de validar
    if (req.body.age) req.body.age = Number(req.body.age);
    if (req.body.weight) req.body.weight = Number(req.body.weight);
    next();
  },
  validate(createPetSchema),
  createPet,
);

router.put(
  '/:id',
  uploadPetPhoto,
  (req, _res, next) => {
    if (req.body.age) req.body.age = Number(req.body.age);
    if (req.body.weight) req.body.weight = Number(req.body.weight);
    next();
  },
  validate(updatePetSchema),
  updatePet,
);

router.delete('/:id', deletePet);

export default router;
