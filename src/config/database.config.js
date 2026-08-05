import mongoose from 'mongoose';
import config from './env.config.js';

export const connectDB = async() => {
    try{
        await mongoose.connect(config.mongoUri);
        console.log('Conexion a MongoDB exitosa');
    }
    catch(error){
        console.log(`Hubo un error al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    }
};