import React, { useEffect, useState } from 'react';
import axios from 'axios';

const slaDurations = {
    1: 30 * 60 * 1000, // 30 minutes
    2: 1 * 60 * 60 * 1000, // 1 heure
    3: 4 * 60 * 60 * 1000, // 4 heures
    4: 35 * 60 * 60 * 1000, // 35 heures
    5: 72 * 60 * 60 * 1000, // 72 heures
};

const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TicketsList = () => {
    const [tickets, setTickets] = useState([]);
    const [timers, setTimers] = useState({});

    useEffect(() => {
        // Charger les tickets depuis l'API
        const fetchTickets = async () => {
            try {
                const response = await axios.get('/api/tickets');
                setTickets(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des tickets:', error);
            }
        };

        fetchTickets();
    }, []);

    useEffect(() => {
        // Calculer le temps restant pour chaque ticket
        const interval = setInterval(() => {
            const updatedTimers = {};
            tickets.forEach((ticket) => {
                const emissionTime = new Date(ticket.dateEmission).getTime();
                const slaDuration = slaDurations[ticket.priorite];
                const currentTime = Date.now();
                const remainingTime = slaDuration - (currentTime - emissionTime);

                updatedTimers[ticket._id] = remainingTime > 0 ? remainingTime : 0;
            });
            setTimers(updatedTimers);
        }, 1000);

        return () => clearInterval(interval); // Nettoyer l'intervalle
    }, [tickets]);

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Liste des Tickets</h1>
            {tickets.length === 0 ? (
                <p className="text-gray-500 text-center">Aucun ticket disponible.</p>
            ) : (
                <ul className="space-y-4">
                    {tickets.map((ticket) => (
                        <li key={ticket._id} className="bg-gray-100 p-4 rounded shadow">
                            <p className="font-medium">Ticket N° : {ticket.numeroTicket}</p>
                            <p>Priorité : P{ticket.priorite}</p>
                            <p>Sujet : {ticket.sujet}</p>
                            <p>Bénéficiaire : {ticket.beneficiaire}</p>
                            <p>Date d'Émission : {new Date(ticket.dateEmission).toLocaleString()}</p>
                            <p>
                                Temps restant :{' '}
                                {timers[ticket._id] !== undefined
                                    ? formatTime(timers[ticket._id])
                                    : 'Calcul en cours...'}
                            </p>
                            <p>Collaborateur : {ticket.collaborateur || 'Non affecté'}</p>
                            <p>État : {ticket.estAffecte ? 'Affecté' : 'Non affecté'}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TicketsList;
