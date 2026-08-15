import { Router } from 'express';
import { getServices, getServiceById, addService, updateService, deleteService } from '../controllers/services.controller.js';
import { createServiceSchema, updateServiceSchema } from '../validations/services.validation.js';
import { validateBody } from '../middlewares/validationSchema.js';

const router = Router();

router.get('/', getServices);
router.get('/:sid', getServiceById);
router.post('/', validateBody(createServiceSchema), addService);
router.put('/:sid', validateBody(updateServiceSchema), updateService);
router.delete('/:sid', deleteService);

export default router;