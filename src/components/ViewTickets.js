import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { getPriorityColor, calculateSlaEndTime, formatSlaDuration } from '../utils/ticketUtils'; // Import the utility functions

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null); // Pour stocker le ticket à modifier
    const [tooltip, setTooltip] = useState({ visible: false, description: '', x: 0, y: 0 }); // État pour le tooltip
    const [timers, setTimers] = useState({});

    useEffect(() => {
        fetchTickets();
    }, []);

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

            setEditingTicket(null); // Ferme le formulaire d'édition
            fetchTickets(); // Rafraîchir la liste après modification
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

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
                    </>
                )}
            </div>
        </>
    );
};

export default ViewTickets;
