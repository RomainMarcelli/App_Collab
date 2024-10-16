import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { getPriorityColor, calculateSlaEndTime, formatSlaDuration, startTicketTimer, formatRemainingTime, ticketDurations } from '../utils/ticketUtils';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, description: '', x: 0, y: 0 });
    const [timers, setTimers] = useState({}); // État pour stocker les timers pour chaque ticket

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateTimers();
        }, 1000); // Actualise le timer toutes les secondes

        return () => clearInterval(intervalId); // Nettoyer l'intervalle lors de la destruction du composant
    }, [tickets]);

    useEffect(() => {
        tickets.forEach(ticket => {
            startTicketTimer(ticket._id);
        });
    }, [tickets]);

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tickets');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des tickets');
            }
            const data = await response.json();
            setTickets(data);
            setLoading(false);

            // Initialiser les timers pour chaque ticket
            const initialTimers = {};
            data.forEach(ticket => {
                initialTimers[ticket._id] = calculateRemainingTime(ticket);
            });
            setTimers(initialTimers);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Fonction pour calculer le temps restant pour un ticket
    const calculateRemainingTime = (ticket) => {
        const slaEndTime = calculateSlaEndTime(ticket); // Calcule la date de fin SLA
        const currentTime = Date.now();
        return slaEndTime ? slaEndTime.getTime() - currentTime : null; // Durée restante en millisecondes
    };

    // Fonction pour mettre à jour les timers
    const updateTimers = () => {
        const updatedTimers = { ...timers };
        tickets.forEach(ticket => {
            const remainingTime = calculateRemainingTime(ticket);
            updatedTimers[ticket._id] = remainingTime;
            // Vérifie si le timer a atteint zéro
            if (remainingTime <= 0) {
                notifyUser(ticket); // Appelle la fonction de notification
                updatedTimers[ticket._id] = 0; // Définit le timer à zéro
            }
        });
        setTimers(updatedTimers);
    };

    const notifyUser = (ticket) => {
        alert(`Le ticket ${ticket.numeroTicket} a atteint la fin de sa durée !`); // Notification simple
    };

    // Formater le temps en HH:MM:SS
    const formatTimer = (milliseconds) => {
        if (milliseconds <= 0) return "00:00:00"; // Si le temps est épuisé, retourner 0
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleEdit = (ticket) => {
        setEditingTicket(ticket);
    };

    const handleUpdateTicket = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${editingTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingTicket),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du ticket');
            }

            setEditingTicket(null);
            fetchTickets();
        } catch (error) {
            console.error('Erreur de mise à jour:', error);
        }
    };

    const handleDelete = async (ticketId) => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce ticket ?");
        if (confirmed) {
            await deleteTicket(ticketId);
            fetchTickets();
        }
    };

    const deleteTicket = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Erreur de suppression:', errorData);
                return;
            }

            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Erreur lors de la requête DELETE:', error);
        }
    };

    // Gestion du survol pour afficher le tooltip
    const handleMouseOver = (e, description) => {
        setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            description: description,
        });
    };

    const handleMouseOut = () => {
        setTooltip({ visible: false, x: 0, y: 0, description: '' });
    };

    if (loading) {
        return <p className="text-center">Chargement des tickets...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Erreur : {error}</p>;
    }

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto bg-white p-8 shadow-md rounded-lg overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Liste des Tickets</h2>
                {tickets.length === 0 ? (
                    <p className="text-center">Aucun ticket trouvé</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 border text-center text-gray-600">Numéro</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">Priorité</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">Sujet</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">Description</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">Bénéficiaire</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">Date d'émission</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">SLA</th>
                                        <th className="px-4 py-3 border text-center text-gray-600">Timer</th> {/* Nouvelle colonne Timer */}
                                        <th className="px-4 py-3 border text-center text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => {
                                        const slaEndTime = calculateSlaEndTime(ticket);
                                        const slaDuration = slaEndTime ? slaEndTime.getTime() - Date.now() : null;

                                        return (
                                            <tr key={ticket._id} className="hover:bg-gray-50 mb-10">
                                                <td className="px-4 py-4 border text-center">{ticket.numeroTicket}</td>
                                                <td className={`px-4 py-4 border text-center ${getPriorityColor(ticket.priorite)}`}>
                                                    {ticket.priorite}
                                                </td>
                                                <td className="px-4 py-4 border text-center">{ticket.sujet}</td>
                                                <td
                                                    className="px-4 py-4 border text-center truncate max-w-xs cursor-pointer"
                                                    onMouseOver={(e) => handleMouseOver(e, ticket.description)}
                                                    onMouseOut={handleMouseOut}
                                                >
                                                    {ticket.description}
                                                </td>
                                                <td className="px-4 py-4 border text-center">{ticket.beneficiaire}</td>
                                                <td className="px-4 py-4 border text-center">{new Date(ticket.dateEmission).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 border text-center">
                                                    {slaDuration !== null ? formatSlaDuration(slaDuration) : 'Non défini'}
                                                </td>
                                                <td className="px-4 py-4 border text-center" id={`timer-${ticket._id}`}>
                                                    {formatRemainingTime(ticketDurations[ticket._id] || 0)} {/* Temps initial ici */}
                                                </td>
                                                {/* Timer */}
                                                <td className="px-4 py-4 border text-center">
                                                    <button
                                                        className="cursor-pointer transition-all bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                                        onClick={() => handleEdit(ticket)}
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        className="cursor-pointer transition-all bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                                        onClick={() => handleDelete(ticket._id)}
                                                    >
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {tooltip.visible && (
                    <div
                        className="absolute z-10 px-4 py-2 bg-gray-200 rounded shadow-md text-sm"
                        style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
                    >
                        {tooltip.description}
                    </div>
                )}
            </div>
        </>
    );
};

export default ViewTickets;
