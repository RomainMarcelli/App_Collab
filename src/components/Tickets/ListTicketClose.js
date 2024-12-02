import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar';

const ListTicketClose = () => {
    const [closedTickets, setClosedTickets] = useState([]);

    useEffect(() => {
        fetchClosedTickets();
    }, []);

    const fetchClosedTickets = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/closed-tickets');
            setClosedTickets(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des tickets fermés:', error);
        }
    };

    // Fonction pour supprimer un ticket fermé
    const handleDeleteTicket = async (ticketId) => {
        try {
            console.log('ID du ticket à supprimer:', ticketId);  // Affiche l'ID pour vérification
            await axios.delete(`http://localhost:3000/api/closed-tickets/${ticketId}`);

            // Met à jour l'état après la suppression
            setClosedTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== ticketId));

            alert('Ticket fermé supprimé avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression du ticket fermé:', error.response ? error.response.data : error.message);
            alert('Erreur lors de la suppression du ticket fermé');
        }
    };
    const handleReopenTicket = async (ticketId) => {
        try {
            console.log('ID du ticket à rouvrir:', ticketId);
            await axios.post(`http://localhost:3000/api/closed-tickets/${ticketId}/reopen`);
            // Mettre à jour l'état local pour retirer le ticket rouvert de la liste fermée
            setClosedTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
            alert('Ticket rouvert avec succès');
        } catch (error) {
            console.error('Erreur lors de la réouverture du ticket fermé:', error.response ? error.response.data : error.message);
            alert('Erreur lors de la réouverture du ticket fermé');
        }
    };
    


    return (
        <>
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Liste des Tickets Fermés</h1>
                {closedTickets.length === 0 ? (
                    <p>Aucun ticket fermé pour le moment.</p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Numéro</th>
                                <th className="border px-4 py-2">Priorité</th>
                                <th className="border px-4 py-2">Sujet</th>
                                <th className="border px-4 py-2">Description</th>
                                <th className="border px-4 py-2">Bénéficiaire</th>
                                <th className="border px-4 py-2">Date d'Émission</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {closedTickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td className="border px-4 py-2">{ticket.numeroTicket}</td>
                                    <td className="border px-4 py-2">{ticket.priorite}</td>
                                    <td className="border px-4 py-2">{ticket.sujet}</td>
                                    <td className="border px-4 py-2">{ticket.description}</td>
                                    <td className="border px-4 py-2">{ticket.beneficiaire}</td>
                                    <td className="border px-4 py-2">{new Date(ticket.dateEmission).toLocaleDateString()}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded"
                                            onClick={() => handleDeleteTicket(ticket._id)}
                                        >
                                            Supprimer
                                        </button>
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                            onClick={() => handleReopenTicket(ticket._id)}
                                        >
                                            Rouvrir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default ListTicketClose;
