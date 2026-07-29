import express from 'express';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.disable('x-powered-by');
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);

app.use(errorHandler);

export { app };