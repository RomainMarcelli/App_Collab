import React, { useEffect, useState } from 'react';
import Navbar from './navbar';

const CollaborateursList = () => {
    const [collaborateurs, setCollaborateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tickets, setTickets] = useState([]); // State pour stocker les tickets
    const [selectedCollaborateur, setSelectedCollaborateur] = useState(null); // State pour le collaborateur sélectionné

    useEffect(() => {
        const fetchCollaborateurs = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/collaborateurs');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des collaborateurs.');
                }
                const data = await response.json();
                setCollaborateurs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCollaborateurs();
    }, []);

    // Fonction pour récupérer les tickets affectés à un collaborateur
    const handleVoirTickets = async (collaborateurId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/affectes/${collaborateurId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des tickets affectés.');
            }
            const data = await response.json();
            setTickets(data); // Stocker les tickets dans le state
            setSelectedCollaborateur(collaborateurId); // Définir le collaborateur sélectionné
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Liste des Collaborateurs</h2>
                {loading ? (
                    <div className="text-center py-4">
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-4">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Nom</th>
                                    <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Client</th>
                                    <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collaborateurs.map((collab) => (
                                    <tr key={collab._id} className="hover:bg-gray-100 transition-colors duration-200">
                                        <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">{collab.nom}</td>
                                        <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">{collab.client}</td>
                                        <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                                onClick={() => handleVoirTickets(collab._id)}
                                            >
                                                Voir les tickets affecté
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Afficher les tickets affectés au collaborateur sélectionné */}
                        {selectedCollaborateur && (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-4">Tickets affectés au collaborateur sélectionné :</h3>
                                {tickets.length === 0 ? (
                                    <p>Aucun ticket affecté à ce collaborateur.</p>
                                ) : (
                                    <ul>
                                        {tickets.map((ticket) => (
                                            <li key={ticket._id} className="mb-2 p-2 border border-gray-300 rounded">
                                                {ticket.sujet} - {ticket.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default CollaborateursList;
