import * as servicesService from '../services/services.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const renderServices = asyncHandler(async (req, res) => {
    const services = await servicesService.getServices();
    const plainServices = services.map(s => s.toObject());
    res.render('services', { services: plainServices });
});

export const renderAvailability = asyncHandler(async (req, res) => {
    const services = await servicesService.getServices();
    const plainServices = services.map(s => s.toObject());
    res.render('availability', { services: plainServices });
});