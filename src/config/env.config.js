import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
};

if(!config.port){
    console.error(`FATAL ERROR - PORT no esta definido o no es un numero valido -${config.port}-`);
    process.exit(1);
}
console.log(`Configuración cargada en modo: ${config.nodeEnv}`);

export default config;