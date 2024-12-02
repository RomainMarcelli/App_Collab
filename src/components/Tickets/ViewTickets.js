import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../navbar';
import { getPriorityColor, formatSlaDuration } from '../../utils/ticketUtils';

// Composant pour modifier un ticket
const EditTicketForm = ({ editingTicket, setEditingTicket, handleUpdateTicket, collaborateurs = [] }) => {
    const handleChange = (e) => {
        console.log("Changing field:", e.target.name, "to:", e.target.value); // Log le champ et sa nouvelle valeur

        setEditingTicket({
            ...editingTicket,
            [e.target.name]: e.target.value,
        });

        console.log("Updated editingTicket:", {
            ...editingTicket,
            [e.target.name]: e.target.value,
        });
    };


    return (
        <div className="bg-gray-100 p-4 rounded-md shadow-md mt-6">
            <h3 className="text-lg font-bold mb-4">Modifier le Ticket</h3>

            <div className="mb-4">
                <label className="block text-gray-700">Numéro du Ticket</label>
                <input
                    type="text"
                    name="numeroTicket"
                    value={editingTicket?.numeroTicket || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Priorité</label>
                <select
                    name="priorite"
                    value={editingTicket?.priorite || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="1">1 (Urgent)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Sujet</label>
                <input
                    type="text"
                    name="sujet"
                    value={editingTicket?.sujet || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <textarea
                    name="description"
                    value={editingTicket?.description || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                ></textarea>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Bénéficiaire</label>
                <input
                    type="text"
                    name="beneficiaire"
                    value={editingTicket?.beneficiaire || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Date et Heure d'émission</label>
                <input
                    type="datetime-local"
                    name="dateEmission"
                    value={editingTicket?.dateEmission || ''} // Valeur actuelle de dateEmission
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

            </div>


            <div className="flex justify-end">
                <button
                    onClick={handleUpdateTicket}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                >
                    Sauvegarder
                </button>
                <button
                    onClick={() => setEditingTicket(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none"
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};




const ViewTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [collaborateurs, setCollaborateurs] = useState([]);
    const [timers, setTimers] = useState({});
    const [editingTicket, setEditingTicket] = useState(null);
    const [popupMessage, setPopupMessage] = useState(null);
    const [expiredTimerTickets, setExpiredTimerTickets] = useState([]); // État pour les tickets avec timers expirés
    const [popupDisabled, setPopupDisabled] = useState(false); // État pour désactiver temporairement la popup
    const popupTimerRef = useRef(null); // Référence pour stocker le timer



    const slaDurations = {
        1: 30 * 60 * 1000, // 30 minutes
        2: 1 * 60 * 60 * 1000, // 1 heure
        3: 8 * 60 * 60 * 1000, // 4 heures
        4: 48 * 60 * 60 * 1000, // 35 heures
        5: 72 * 60 * 60 * 1000, // 72 heures
    };

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tickets');
            const data = await response.json();
            if (response.ok) {
                console.log("Fetched tickets:", data); // Vérifie les données après mise à jour
                setTickets(data);
            } else {
                alert('Erreur lors de la récupération des tickets : ' + data.message);
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
        }
    };


    const fetchCollaborateurs = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/collaborateurs');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des collaborateurs');
            }
            const data = await response.json();
            setCollaborateurs(data);
        } catch (error) {
            console.error(error);
        }
    };

    const calculateRemainingTime = (priority, dateEmission) => {
        // Durées en fonction des priorités
        const priorityDurations = {
            '1': 15 * 60 * 1000, // 15 minutes
            '2': 30 * 60 * 1000, // 30 minutes
            '3': 4 * 60 * 60 * 1000, // 4 heures
            '4': 35 * 60 * 60 * 1000, // 35 heures
            '5': 2 * 24 * 60 * 60 * 1000, // 2 jours
        };

        const now = new Date().getTime(); // Heure actuelle en millisecondes
        const emissionTime = new Date(dateEmission).getTime(); // Date d'émission en millisecondes
        const elapsedTime = now - emissionTime; // Temps écoulé depuis la date d'émission

        // Calculer le temps restant
        const remainingTime = priorityDurations[priority] - elapsedTime;
        return remainingTime > 0 ? remainingTime : 0; // Retourne 0 si le temps est écoulé
    };

    const startTimers = () => {
        const newTimers = {};
        const expiredTickets = []; // Stocker les tickets avec timers expirés

        tickets.forEach((ticket) => {
            const remainingTime = calculateRemainingTime(ticket.priorite, ticket.dateEmission);

            if (remainingTime === 0) {
                expiredTickets.push(ticket); // Ajouter les tickets expirés
            }

            newTimers[ticket._id] = remainingTime;
        });

        setExpiredTimerTickets(expiredTickets); // Mettre à jour l'état des tickets expirés
        setTimers(newTimers);

        const interval = setInterval(() => {
            setTimers((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                for (const id in updatedTimers) {
                    if (updatedTimers[id] > 0) {
                        updatedTimers[id] -= 1000;
                    }
                }

                // Vérifier les nouveaux timers expirés
                const newlyExpired = tickets.filter(
                    (ticket) =>
                        updatedTimers[ticket._id] === 0 &&
                        !expiredTimerTickets.find((t) => t._id === ticket._id)
                );
                if (newlyExpired.length > 0) {
                    setExpiredTimerTickets((prev) => [...prev, ...newlyExpired]);
                }

                return updatedTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    };

    useEffect(() => {
        if (!popupDisabled && expiredTimerTickets.length > 0) {
            setPopupMessage(`Le timer du ticket ${expiredTimerTickets[0].numeroTicket} est expiré. Veuillez le relancer.`);
        }
    }, [expiredTimerTickets, popupDisabled]);


    useEffect(() => {
        return () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
        };
    }, []);


    useEffect(() => {
        fetchTickets();
        fetchCollaborateurs();
    }, []);

    useEffect(() => {
        if (tickets.length > 0) {
            startTimers();
        }
    }, [tickets]);

    const handleDelete = async (ticketId) => {
        const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?');
        if (confirmed) {
            try {
                const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchTickets();
                } else {
                    console.error('Erreur de suppression');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression :', error);
            }
        }
    };

    const handleEdit = (ticket) => {
        if (editingTicket && editingTicket._id === ticket._id) {
            // Si le formulaire est déjà ouvert pour ce ticket, le fermer
            setEditingTicket(null);
        } else {
            // Sinon, ouvrir le formulaire pour ce ticket
            setEditingTicket({
                ...ticket,
                dateEmission: ticket.dateEmission
                    ? new Date(ticket.dateEmission).toISOString().slice(0, 16)
                    : '',
                collaborateur: ticket.collaborateur || '',
            });
        }
    };


    const handleClosePopup = () => {
        setPopupMessage(null); // Masque la popup
        setPopupDisabled(true); // Désactive temporairement la popup
        setExpiredTimerTickets((prev) => prev.slice(1)); // Retire le ticket traité

        // Réactive la popup après 1 minute
        popupTimerRef.current = setTimeout(() => {
            setPopupDisabled(false);
        }, 60000); // 1 minute en millisecondes
    };


    useEffect(() => {
        return () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
        };
    }, []);


    const handleUpdateTicket = async () => {
        try {
            const updatedTicket = {
                ...editingTicket,
                dateEmission: editingTicket.dateEmission
                    ? new Date(editingTicket.dateEmission).toISOString()
                    : null,
                collaborateur: editingTicket.collaborateur || null,
            };

            console.log("Updating ticket with data:", updatedTicket);

            const response = await fetch(`http://localhost:3000/api/tickets/${editingTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTicket),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Update successful, server response:", data);

                setEditingTicket(null); // Réinitialise le formulaire d'édition
                await fetchTickets(); // Rafraîchit la liste des tickets
            } else {
                const errorData = await response.json();
                console.error("Update failed, server response:", errorData);
            }
        } catch (error) {
            console.error("Error updating ticket:", error);
        }
    };



    const formatTime = (timeInMillis) => {
        const totalSeconds = Math.floor(timeInMillis / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds
            .toString()
            .padStart(2, '0')}s`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };


    async function handleCloseTicket(ticketId) {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/close`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de la clôture du ticket: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Ticket fermé avec succès:', data);

            // Mettre à jour l'état local pour retirer le ticket fermé
            setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));

            // Afficher la popup de succès
            setPopupMessage('Le ticket a été fermé avec succès.');
            setTimeout(() => setPopupMessage(null), 3000); // Masquer après 3 secondes
        } catch (error) {
            console.error('Erreur de clôture du ticket:', error);
            alert('Une erreur est survenue lors de la fermeture du ticket. Veuillez réessayer.');
        }
    }



    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center">Liste des Tickets</h1>
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {tickets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Numéro</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Collaborateur</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Priorité</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Sujet</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Description</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Bénéficiaire</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Date</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">SLA</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Temps restant</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.numeroTicket}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {collaborateurs.find((collab) => collab._id === ticket.collaborateur)?.nom || 'Non attribué'}
                                            </td>
                                            <td className={`py-2 px-4 border border-gray-300 text-center ${getPriorityColor(ticket.priorite)}`}>{ticket.priorite}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.sujet}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.description}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.beneficiaire}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{formatDate(ticket.dateEmission)}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {formatSlaDuration(slaDurations[ticket.priorite])}
                                            </td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {timers[ticket._id] !== undefined ? formatTime(timers[ticket._id]) : 'Calcul en cours...'}
                                            </td>
                                            <td className="py-2 px-6 border border-gray-300 text-center flex flex-col items-center w-[250px]">
                                                <button
                                                    className={`cursor-pointer transition-all mb-2 ${editingTicket && editingTicket._id === ticket._id
                                                        ? 'bg-blue-700'
                                                        : 'bg-blue-500'
                                                        } text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]`}
                                                    onClick={() => handleEdit(ticket)}
                                                >
                                                    {editingTicket && editingTicket._id === ticket._id ? 'Fermer' : 'Modifier'}
                                                </button>

                                                <button
                                                    className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                                                    onClick={() => handleDelete(ticket._id)}
                                                >
                                                    Supprimer
                                                </button>
                                                <button
                                                    className="cursor-pointer transition-all mt-2 bg-green-500 text-white px-6 py-2 rounded-lg border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                                                    onClick={() => handleCloseTicket(ticket._id)}
                                                >
                                                    Fermer le Ticket
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center">Aucun ticket disponible.</p>
                    )}

                    {editingTicket && (
                        <EditTicketForm
                            editingTicket={editingTicket}
                            setEditingTicket={setEditingTicket}
                            handleUpdateTicket={handleUpdateTicket}
                            collaborateurs={collaborateurs}
                        />
                    )}


                    {popupMessage && (
                        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                            {popupMessage}
                        </div>
                    )}

                    {popupMessage && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                                <p className="text-lg font-semibold">{popupMessage}</p>
                                <button
                                    onClick={handleClosePopup} // Utilisation correcte de la fonction
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </>
    );
};

export default ViewTicket;
