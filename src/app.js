import express from 'express';
import { engine } from 'express-handlebars';

import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewsRouter from './routes/views.router.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.disable('x-powered-by');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');
app.use(express.static('./src/public'));

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/views', viewsRouter);

app.use(errorHandler);

export { app };