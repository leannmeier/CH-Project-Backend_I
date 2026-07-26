import { Router } from 'express';
import { BookingManager } from '../managers/BookingManager.js';

const router = Router();
const manager = new BookingManager();

router.post('/', async (req, res) => {
    const resultado = await manager.createBooking(req.body);
    if(resultado?.error){
        return res.status(400).json({ status: 'error', message: resultado.error });
    }
    res.status(201).json( { status: 'success', payload: resultado } )
});

router.get('/:bid', async (req, res) => {
    const { bid } = req.params;
    const booking = await manager.getBookingById(bid);
    if(booking){
        res.status(200).json( { status: 'success', payload: booking } );
    }
    else{
        res.status(404).json({ status: 'error', message : 'Reserva no encontrada' });
    }
});

router.post('/:bid/services/:sid', async (req, res) => {
    try{
        const { bid, sid } = req.params;
        const booking = await manager.addServiceToBooking(bid, sid);
        if(booking?.error){
            return res.status(404).json({ status: 'error', message: booking.error });
        }
        res.status(201).json({ status: 'success', payload: booking });
    }
    catch(error){
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

export default router;