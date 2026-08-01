import * as servicesService from '../service/services.service.js'
import { asyncHandler } from '../utils/asyncHandler.js';

export const getServices = asyncHandler(async (req, res) => {
    let services = await servicesService.getServices();
    const { category, available } = req.query;
    if(category){
        services = services.filter(s => s.category === category)
    }
    if(available !== undefined){
        services = services.filter(s => s.available === (available === 'true'));
    }
    res.status(200).json( { status: 'success', payload: services } );
});

export const getServiceById = asyncHandler(async (req, res) => {
    const { sid } = req.params;
    const service = await servicesService.getServiceById(sid);
    if(service){
        res.status(200).json({ status : 'success', payload : service});
    } 
    else{
        res.status(404).json({ status: 'error', message : 'Servicio no encontrado' });
    }
})

export const addService = asyncHandler(async (req, res) => {
    let resultado = await servicesService.createService(req.body);
    if(resultado?.error){
        return res.status(400).json({ status: 'error', message: resultado.error });
    }
    res.status(201).json( { status: 'success', payload: resultado } )
})

export const updateService = asyncHandler(async (req, res) => {
    const { sid } = req.params;
    let actualizarServicio = await servicesService.updateService(sid, req.body);
    if(actualizarServicio){
        res.status(200).json( { status: 'success', payload: actualizarServicio } );
    }
    else{
        res.status(404).json( { status : 'error', message : 'Servicio no encontrado' });
    }
})

export const deleteService = asyncHandler(async (req, res) => {
    const { sid } = req.params;
    let eliminarServicio = await servicesService.deleteService(sid);
    if(eliminarServicio){
        res.status(200).json( { status: 'success', payload: eliminarServicio } );
    }
    else{
        res.status(404).json( { status : 'error', message : 'Servicio no encontrado' });
    }
})