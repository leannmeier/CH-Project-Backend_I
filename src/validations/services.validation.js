import { z } from 'zod';

export const createServiceSchema = z.object({
    name: z.string(),
    description: z.string(),
    duration: z.string(),
    price: z.number(),
    category: z.string(),
    available: z.boolean()
});

export const updateServiceSchema = createServiceSchema.partial();