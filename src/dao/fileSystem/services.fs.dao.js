import fs from 'node:fs/promises';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

import { findById } from '../../utils/findById.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_ARCHIVO = path.join(__dirname, '../../data/services.json');

async function leer(){
    try{
        const data = await fs.readFile(RUTA_ARCHIVO, 'utf-8');
        return JSON.parse(data);
    }
    catch(error){
        throw new Error(`Hubo un error al leer los archivos: ${error.message}`);
    }
}

async function guardar(data){
    try{
        await fs.writeFile(RUTA_ARCHIVO,
        JSON.stringify(
            data,
            null,
            2
        ),'utf-8');
    }
    catch(error){
        throw new Error(`Hubo un error al guardar los archivos: ${error.message}`);
    }
}

export async function getAll(){
    return await leer();
}

export async function getById(id){
    const services = await leer();
    return findById(id,services);
}

export async function create(data){
    let services = await leer();
    services.push(data);
    await guardar(services);
    return data;
}
export async function update(id, service){
    const services = await leer();
    const buscarServicio = findById(id, services);
    if(buscarServicio){
        const serviciosActualizados = services.map( s => s.id === Number(id) ? service : s);
        await guardar(serviciosActualizados);
    }
    return service;
}

export async function _delete(id){
    const services = await leer();
    let servicioBorrado = findById(id, services);
    if(servicioBorrado){
        const serviciosActualizados = services.filter(s => s.id !== Number(id));
        await guardar(serviciosActualizados);
    }
    return servicioBorrado;
}
  