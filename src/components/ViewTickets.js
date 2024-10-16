import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { getPriorityColor, formatSlaDuration } from '../utils/ticketUtils'; // Import the utility functions

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, description: '', x: 0, y: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [timers, setTimers] = useState({}); // Timer state
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [closedTickets, setClosedTickets] = useState([]); // Store closed ticket IDs
    const [isPopupDisplayed, setIsPopupDisplayed] = useState(false); // Nouveau drapeau






    // Define SLA and timer durations based on ticket priorities
    const slaDurations = {
        1: 1 * 60 * 60 * 1000,
        2: 2 * 60 * 60 * 1000,
        3: 8 * 60 * 60 * 1000,
        4: 2 * 24 * 60 * 60 * 1000,
        5: 5 * 24 * 60 * 60 * 1000,
    };

    const timerDurations = {
        1: 1 * 10 * 1000,         // 30 minutes for P1
        2: 1 * 60 * 60 * 1000,     // 1 hour for P2
        3: 4 * 60 * 60 * 1000,     // 4 hours for P3
        4: 35 * 60 * 60 * 1000,    // 35 hours for P4
        5: 72 * 60 * 60 * 1000, // 1 week in milliseconds
    };
    const [formData, setFormData] = useState({
        numeroTicket: '',
        priorite: '1',
        sujet: '',
        description: '',
        beneficiaire: '',
        dateEmission: '',
    });

    // Mise à jour des timers
    const updateTimers = () => {
        setTimers(prevTimers => {
            const newTimers = { ...prevTimers };
            tickets.forEach(ticket => {
                // Skip closed tickets
                if (closedTickets.includes(ticket._id)) return;

                const now = Date.now();
                const ticketStartTime = new Date(ticket.dateEmission).getTime();
                const elapsedTime = now - ticketStartTime;

                const totalDuration = timerDurations[ticket.priorite];
                const remainingTime = totalDuration - elapsedTime;

                // Met à jour les minuteries
                newTimers[ticket._id] = remainingTime <= 0 ? 0 : remainingTime;
            });
            return newTimers;
        });
    };

    // Gérer l'affichage de la popup en fonction des timers
    const checkPopupDisplay = () => {
        tickets.forEach(ticket => {
            if (!closedTickets.includes(ticket._id)) {
                const now = Date.now();
                const ticketStartTime = new Date(ticket.dateEmission).getTime();
                const elapsedTime = now - ticketStartTime;

                const totalDuration = timerDurations[ticket.priorite];
                const remainingTime = totalDuration - elapsedTime;

                // Afficher la popup si le temps est écoulé
                if (remainingTime <= 0) {
                    setPopupMessage(`Il faut relancer le ticket ${ticket.numeroTicket} c'est une P${ticket.priorite}`);
                    setPopupVisible(true);
                }
            }
        });
    };

    const handleClosePopup = () => {
        console.log("Message popup:", popupMessage);

        // Extraction du numéro de ticket
        const ticketNumber = popupMessage.split(' ')[5]; // Vérifiez l'index en fonction du format
        console.log("Numéro de ticket extrait:", ticketNumber);

        // Recherche du ticket à fermer
        const ticketToClose = tickets.find(ticket => ticket.numeroTicket === ticketNumber);

        // Affichage des tickets disponibles et du ticket trouvé
        console.log("Tickets disponibles:", tickets);
        console.log("Ticket trouvé:", ticketToClose);

        if (ticketToClose) {
            setClosedTickets(prev => [...prev, ticketToClose._id]); // Ajout du ticket fermé
            setPopupVisible(false); // Fermeture de la popup
            console.log("Popup fermée.");
        } else {
            console.error("Ticket non trouvé pour le numéro:", ticketNumber);
        }
    };

    // useEffect pour récupérer les tickets
    useEffect(() => {
        fetchTickets();
    }, []);

    // useEffect pour mettre à jour les timers
    useEffect(() => {
        const interval = setInterval(() => {
            updateTimers();
        }, 1000); // Met à jour les timers toutes les secondes

        return () => clearInterval(interval);
    }, [tickets]);

    // useEffect pour vérifier l'affichage de la popup
    useEffect(() => {
        const interval = setInterval(() => {
            checkPopupDisplay();
        }, 10000); // Vérifie l'affichage de la popup toutes les secondes

        return () => clearInterval(interval);
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
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleEdit = (ticket) => {
        if (editingTicket && editingTicket._id === ticket._id) {
            // Fermez le tooltip si c'est le même ticket
            setEditingTicket(null); // Assurez-vous de réinitialiser le ticket en cours d'édition
        } else {
            // Ouvrez le tooltip et définissez le ticket à éditer
            setEditingTicket(ticket);
            setTooltipVisible(true);
        }
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

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
            <div className="mx-auto bg-white p-8 shadow-md rounded-lg overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Liste des Tickets</h2>
                {tickets.length === 0 ? (
                    <p className="text-center">Aucun ticket trouvé</p>
                ) : (
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
                                    <th className="px-4 py-3 border text-center text-gray-600">Timer</th>
                                    <th className="px-4 py-3 border text-center text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
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
                                            {formatSlaDuration(slaDurations[ticket.priorite])}
                                        </td>
                                        <td className="px-4 py-4 border text-center">
                                            {timers[ticket._id] !== undefined ? formatTime(timers[ticket._id]) : 'En attente'}
                                        </td>
                                        <td className="px-4 py-4 border text-center flex flex-col items-center">
                                            <button
                                                className="cursor-pointer transition-all mb-2 bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                                                onClick={() => handleEdit(ticket)}
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                                                onClick={() => handleDelete(ticket._id)}
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tooltip.visible && (
                    <div
                        className="absolute bg-gray-800 text-white p-2 rounded-md"
                        style={{
                            left: tooltip.x + 10,
                            top: tooltip.y + 10,
                            zIndex: 9999,
                        }}
                    >
                        {tooltip.description}
                    </div>
                )}

                {editingTicket && (
                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">Modifier le Ticket</h3>
                        <form onSubmit={handleUpdateTicket} className="flex flex-col">
                            <input
                                type="text"
                                value={editingTicket.numeroTicket}
                                onChange={(e) => setEditingTicket({ ...editingTicket, numeroTicket: e.target.value })}
                                placeholder="Numéro"
                                className="border rounded-md p-2 mb-2"
                            />

                            <select
                                value={editingTicket.priorite}
                                onChange={(e) => setEditingTicket({ ...editingTicket, priorite: e.target.value })}
                                className="w-full px-3 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                            <input
                                type="text"
                                value={editingTicket.sujet}
                                onChange={(e) => setEditingTicket({ ...editingTicket, sujet: e.target.value })}
                                placeholder="Sujet"
                                className="border rounded-md p-2 mb-2"
                            />
                            <input
                                type="text"
                                value={editingTicket.description}
                                onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                                placeholder="Description"
                                className="border rounded-md p-2 mb-2"
                            />
                            <input
                                type="text"
                                value={editingTicket.beneficiaire}
                                onChange={(e) => setEditingTicket({ ...editingTicket, beneficiaire: e.target.value })}
                                placeholder="Bénéficiaire"
                                className="border rounded-md p-2 mb-2"
                            />
                            <input
                                type="datetime-local"
                                value={new Date(editingTicket.dateEmission).toISOString().slice(0, 16)}
                                onChange={(e) => setEditingTicket({ ...editingTicket, dateEmission: e.target.value })}
                                placeholder="Date d'émission"
                                className="border rounded-md p-2 mb-2"
                            />
                            <button
                                type="submit"
                                className="bg-green-500 text-white p-2 rounded-md"
                            >
                                Enregistrer
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingTicket(null)}
                                className="bg-gray-500 text-white p-2 rounded-md mt-2"
                            >
                                Annuler
                            </button>
                        </form>
                    </div>
                )}
                {popupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-md popup">
                            <h3 className="text-lg font-bold mb-2">Alerte de Ticket</h3>
                            <p>{popupMessage}</p>
                            <button
                                onClick={handleClosePopup}
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}


            </div>
        </>
    );
};

export default ViewTickets;
