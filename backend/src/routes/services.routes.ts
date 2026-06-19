import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema';

const router = Router();

// Rutas públicas
router.get('/', getServices);
router.get('/:id', getServiceById);

// Rutas protegidas (ADMIN)
router.post('/', authenticate, requireAdmin, validate(createServiceSchema), createService);
router.put('/:id', authenticate, requireAdmin, validate(updateServiceSchema), updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);

export default router;
