import { Router } from 'express';
import { 
    addServiceToBooking, 
    createBooking, 
    getBookingById, 
    deleteServiceToBooking, 
    updateQuantity, 
    deleteBooking  } from '../controllers/bookings.controller.js';

import { validateBody, validateParams } from '../middlewares/validationSchema.js';
import { createBookingSchema, bookingParamsSchema, updateQuantitySchema, bidParamSchema } from '../validations/bookings.validation.js';

const router = Router();

router.post('/', validateBody(createBookingSchema), createBooking);
router.get('/:bid', getBookingById);
router.post(
    '/:bid/services/:sid', 
    validateParams(bookingParamsSchema), 
    addServiceToBooking
);
router.delete(
    '/:bid/services/:sid', 
    validateParams(bookingParamsSchema), 
    deleteServiceToBooking 
);
router.put(
    '/:bid/services/:sid',
    validateParams(bookingParamsSchema),
    validateBody(updateQuantitySchema),
    updateQuantity
);
router.delete('/:bid',validateParams(bidParamSchema), deleteBooking );

export default router;