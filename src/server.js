import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDB } from './config/database.config.js';

import { setIO } from './config/socket.config.js';

import { app } from './app.js';
import config from './config/env.config.js';

const server = createServer(app);
const io = new Server(server);

setIO(io);

io.on('connection', (socket) => {
    console.log('Cliente conectado');
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const startServer = async () => {
    await connectDB();
    server.listen(config.port, () => {
        console.log(`Servidor corriendo en el puerto http://localhost:${config.port}`);
    });
};

startServer();