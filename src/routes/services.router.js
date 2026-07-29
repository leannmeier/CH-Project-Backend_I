import { Router } from 'express';
import { addService, deleteService, getServiceById, getServices, updateService } from '../controllers/services.controller.js';

const router = Router();

router.get('/', getServices);
router.get('/:sid', getServiceById);
router.post('/', addService);
router.put('/:sid', updateService);
router.delete('/:sid', deleteService);

export default router;