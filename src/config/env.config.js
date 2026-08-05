import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI
};

if(!config.mongoUri){
    console.error(`FATAL ERROR - MONGO_URI no esta definida -`);
    process.exit(1);
}
console.log(`Configuración cargada en modo: ${config.nodeEnv}`);

export default config;