import { Router } from 'express';
import { ServiceManager } from '../managers/ServiceManager.js';

const router = Router();
const manager = new ServiceManager();

router.get('/', async (req, res) => {
    let services = await manager.getServices();
    const { category, available } = req.query;
    if(category){
        services = services.filter(s => s.category === category)
    }
    if(available !== undefined){
        services = services.filter(s => s.available === (available === 'true'));
    }
    res.status(200).json( { status: 'success', payload: services } );
});

router.get('/:sid', async (req, res) => {
    const { sid } = req.params;
    const service = await manager.getServiceById(sid);
    if(service){
        res.status(200).json({ status : 'success', payload : service});
    } 
    else{
        res.status(404).json({ status: 'error', message : 'Servicio no encontrado' });
    }
});

router.post('/', async (req, res) => {
    let resultado = await manager.addService(req.body);
    if(resultado?.error){
        return res.status(400).json({ status: 'error', message: resultado.error });
    }
    res.status(201).json( { status: 'success', payload: resultado } )
});

router.put('/:sid', async (req, res) => {
    const { sid } = req.params;
    let actualizarServicio = await manager.updateService(sid, req.body);
    if(actualizarServicio){
        res.status(200).json( { status: 'success', payload: actualizarServicio } );
    }
    else{
        res.status(404).json( { status : 'error', message : 'Servicio no encontrado' });
    }
});

router.delete('/:sid', async (req, res) => {
    const { sid } = req.params;
    let eliminarServicio = await manager.deleteService(sid);
    if(eliminarServicio){
        res.status(200).json( { status: 'success', payload: eliminarServicio } );
    }
    else{
        res.status(404).json( { status : 'error', message : 'Servicio no encontrado' });
    }
});

export default router;