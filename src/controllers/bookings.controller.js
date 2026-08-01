import * as bookingsService from '../service/bookings.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const createBooking = asyncHandler(async (req, res) => {
    const resultado = await bookingsService.createBooking(req.body);
    if(resultado?.error){
        return res.status(400).json({ status: 'error', message: resultado.error });
    }
    res.status(201).json( { status: 'success', payload: resultado } );
})

export const getBookingById = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    const booking = await bookingsService.getBookingById(bid);
    if(booking){
        res.status(200).json( { status: 'success', payload: booking } );
    }
    else{
        res.status(404).json({ status: 'error', message : 'Reserva no encontrada' });
    }
})

export const addServiceToBooking = asyncHandler(async (req, res) => {
    const { bid, sid } = req.params;
    const booking = await bookingsService.addServiceToBooking(bid,sid);
    if(booking?.error){
        return res.status(404).json({ status: 'error', message: booking.error });
    }
    res.status(201).json({ status: 'success', payload: booking });
})