import React, { useState, useEffect } from 'react';

// Utilitaire pour calculer le temps restant en fonction de la date d'émission et de la priorité
const slaDurations = {
    1: 30 * 60 * 1000,         // 30 minutes pour P1
    2: 1 * 60 * 60 * 1000,     // 1 heure pour P2
    3: 4 * 60 * 60 * 1000,     // 4 heures pour P3
    4: 35 * 60 * 60 * 1000,    // 35 heures pour P4
    5: 72 * 60 * 60 * 1000
}; // en ms (1h, 2h, 3h, etc.)

// Fonction pour calculer le temps restant
function calculateRemainingTime(dateEmission, slaDuration) {
    const emissionTime = new Date(dateEmission).getTime();
    const currentTime = Date.now();
    const elapsedTime = currentTime - emissionTime;
    const remainingTime = slaDuration - elapsedTime;

    return remainingTime > 0 ? remainingTime : 0;
}

// Fonction pour formater le temps restant en heures, minutes, secondes
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

const TicketTestPage = () => {
    const [tickets, setTickets] = useState([]);
    const [timers, setTimers] = useState({});
    const [newTicket, setNewTicket] = useState({ numero: '', priorite: 1, dateEmission: '' });

    // Mettre à jour les timers toutes les secondes
    useEffect(() => {
        const interval = setInterval(() => {
            const updatedTimers = {};

            tickets.forEach(ticket => {
                const slaDuration = slaDurations[ticket.priorite];
                const remainingTime = calculateRemainingTime(ticket.dateEmission, slaDuration);
                updatedTimers[ticket.id] = remainingTime;
            });

            setTimers(updatedTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [tickets]);

    // Ajouter un nouveau ticket
    const handleAddTicket = () => {
        const newId = Date.now().toString();
        const ticket = {
            ...newTicket,
            id: newId,
            dateEmission: newTicket.dateEmission || new Date().toISOString(),
        };
        setTickets([...tickets, ticket]);
        setNewTicket({ numero: '', priorite: 1, dateEmission: '' });
    };

    // Gérer les changements dans le formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTicket({ ...newTicket, [name]: value });
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Création de Tickets</h2>

            {/* Formulaire pour ajouter un ticket */}
            <div className="mb-6">
                <input
                    type="text"
                    name="numero"
                    placeholder="Numéro du ticket"
                    value={newTicket.numero}
                    onChange={handleChange}
                    className="border p-2 mr-4"
                />
                <select
                    name="priorite"
                    value={newTicket.priorite}
                    onChange={handleChange}
                    className="border p-2 mr-4"
                >
                    {[1, 2, 3, 4, 5].map((prio) => (
                        <option key={prio} value={prio}>
                            Priorité {prio}
                        </option>
                    ))}
                </select>
                <input
                    type="datetime-local"
                    name="dateEmission"
                    value={newTicket.dateEmission}
                    onChange={handleChange}
                    className="border p-2 mr-4"
                />
                <button onClick={handleAddTicket} className="bg-blue-500 text-white p-2 rounded">
                    Ajouter Ticket
                </button>
            </div>

            {/* Liste des tickets avec timers */}
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border">Numéro</th>
                        <th className="px-4 py-2 border">Priorité</th>
                        <th className="px-4 py-2 border">Date d'émission</th>
                        <th className="px-4 py-2 border">Timer</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 border text-center">{ticket.numero}</td>
                            <td className="px-4 py-4 border text-center">Priorité {ticket.priorite}</td>
                            <td className="px-4 py-4 border text-center">
                                {new Date(ticket.dateEmission).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 border text-center">
                                {timers[ticket.id] !== undefined ? formatTime(timers[ticket.id]) : 'Calcul en cours...'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TicketTestPage;
