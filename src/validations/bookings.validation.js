import { z } from 'zod';

export const createBookingSchema = z.object({
    clientName: z.string(),
    clientEmail: z.string().email(),
    date: z.string(),
    time: z.string(),
    status: z.boolean().optional(),
    services: z.array(z.object({
        service: z.string(),
        quantity: z.number()
    })).optional()
});

export const bookingParamsSchema = z.object({
    bid: z.string().regex(/^[0-9a-fA-F]{24}$/),
    sid: z.string().regex(/^[0-9a-fA-F]{24}$/)
});