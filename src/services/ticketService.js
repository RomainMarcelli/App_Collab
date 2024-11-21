export const createTicket = async (ticketData) => {
    console.log('Données envoyées au serveur:', ticketData); // Log des données envoyées
    const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du ticket');
    }
    return data;
};
