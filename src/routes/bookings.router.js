import { Router } from 'express';
import { addServiceToBooking, createBooking, getBookingById,  } from '../controllers/bookings.controller.js';

import { validateBody, validateParams } from '../middlewares/validationSchema.js';
import { createBookingSchema, bookingParamsSchema } from '../validations/bookings.validation.js';

const router = Router();

router.post('/', validateBody(createBookingSchema), createBooking);
router.get('/:bid', getBookingById);
router.post('/:bid/services/:sid', validateParams(bookingParamsSchema), addServiceToBooking);

export default router;