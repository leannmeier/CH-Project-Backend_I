import { app } from './app.js';
import config  from './config/env.config.js';

app.listen(config.port, () => {
    console.log(`Servidor corriendo en http://localhost:${config.port}`);
})