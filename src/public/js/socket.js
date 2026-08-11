const socket = io();

socket.on('availabilityUpdated', (service) => {
    const li = document.querySelector(`li[data-id="${service._id}"]`);
    if (li) {
        const estado = li.querySelector('.estado');
        estado.textContent = service.available ? 'Disponible' : 'No disponible';
    }
});