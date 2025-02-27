import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar';

const AffecterTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [collaborateurs, setCollaborateurs] = useState([]);
    const [selectedCollaborateurs, setSelectedCollaborateurs] = useState({});
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [ticketsAffectes, setTicketsAffectes] = useState(new Set()); // État pour suivre les tickets affectés

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/tickets');
                const nonAffectes = response.data.filter(ticket => !ticket.estAffecte);
                setTickets(nonAffectes);
            } catch (error) {
                console.error('Erreur lors de la récupération des tickets:', error);
            }
        };
    
        const fetchCollaborateurs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/collaborateurs');
                setCollaborateurs(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des collaborateurs:', error);
            }
        };
    
        fetchTickets();
        fetchCollaborateurs();
    }, []);

    const handleSelectCollaborateur = (ticketId, collaborateurId) => {
        setSelectedCollaborateurs(prevState => ({
            ...prevState,
            [ticketId]: collaborateurId,
        }));
    };

    const handleAffecterTicket = async (ticketId) => {
        const collaborateurId = selectedCollaborateurs[ticketId];
        if (!collaborateurId) {
            setPopupMessage('Veuillez sélectionner un collaborateur.');
            setPopupVisible(true);
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/tickets/${ticketId}/affecter`, { collaborateurId });
            setPopupMessage('Ticket affecté avec succès !');
            setPopupVisible(true);
            
            // Ajoutez le ticket à l'ensemble des tickets affectés
            setTicketsAffectes(prev => new Set(prev).add(ticketId));
            // Réinitialiser le collaborateur sélectionné pour ce ticket
            setSelectedCollaborateurs(prevState => ({
                ...prevState,
                [ticketId]: '', // Clear the selected collaborator for this ticket
            }));
        } catch (error) {
            console.error('Erreur lors de l\'affectation du ticket:', error);
            setPopupMessage('Erreur lors de l\'affectation du ticket.');
            setPopupVisible(true);
        }
    };    

    // Gérer la fermeture de la popup
    const handleClosePopup = () => {
        setPopupVisible(false);
        // Mettre à jour les tickets affichés pour exclure les tickets affectés
        setTickets(prevTickets => prevTickets.filter(ticket => !ticketsAffectes.has(ticket._id)));
    };

    return (
        <>
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Affecter un Ticket</h1>
                {tickets.length === 0 ? (
                    <p>Aucun ticket disponible.</p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">N° ticket</th>
                                <th className="border px-4 py-2">Sujet</th>
                                <th className="border px-4 py-2">Description</th>
                                <th className="border px-4 py-2">Affecter à</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td className="border px-4 py-2">{ticket.numeroTicket}</td>
                                    <td className="border px-4 py-2">{ticket.sujet}</td>
                                    <td className="border px-4 py-2">{ticket.description}</td>
                                    <td className="border px-4 py-2  flex flex-col items-center">
                                        <select
                                            className="border rounded p-1"
                                            onChange={(e) => handleSelectCollaborateur(ticket._id, e.target.value)}
                                            value={selectedCollaborateurs[ticket._id] || ''}
                                        >
                                            <option value="">Sélectionner un collaborateur</option>
                                            {collaborateurs.map((collaborateur) => (
                                                <option key={collaborateur._id} value={collaborateur._id}>
                                                    {collaborateur.nom}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex justify-center mt-4">
                                            <button
                                                className="bg-green-500 text-white px-4 py-2 rounded"
                                                onClick={() => handleAffecterTicket(ticket._id)}
                                                disabled={!selectedCollaborateurs[ticket._id]}
                                            >
                                                Affecter
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {popupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded shadow-lg">
                            <p>{popupMessage}</p>
                            <button
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleClosePopup} // Appeler la fonction de fermeture
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

export default AffecterTickets;
