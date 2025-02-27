import React, { useEffect, useState } from 'react';
import Navbar from '../navbar';

const CollaborateursList = () => {
    const [collaborateurs, setCollaborateurs] = useState([]);
    const [client, setClient] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tickets, setTickets] = useState([]);
    const [selectedCollaborateur, setSelectedCollaborateur] = useState(null);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCollaborateur, setEditedCollaborateur] = useState({ nom: '', client: '' });

    const clients = [
        'Nhood',
        'Nexity',
        'Somain'
    ];

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

    const handleVoirTickets = async (collaborateurId) => {
        setLoadingTickets(true);
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/affectes/${collaborateurId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des tickets affectés.');
            }
            const data = await response.json();
            setTickets(data);
            setSelectedCollaborateur(collaborateurId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleEditCollaborateur = (collab) => {
        setIsEditing(true);
        setEditedCollaborateur({ nom: collab.nom, client: collab.client });
        setSelectedCollaborateur(collab._id);
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/collaborateurs/${selectedCollaborateur}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedCollaborateur),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du collaborateur.');
            }

            setCollaborateurs((prev) =>
                prev.map((collab) =>
                    collab._id === selectedCollaborateur
                        ? { ...collab, nom: editedCollaborateur.nom, client: editedCollaborateur.client }
                        : collab
                )
            );
            setClient('');
            setIsEditing(false);
            setSelectedCollaborateur(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCollaborateur = async (collaborateurId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/collaborateurs/${collaborateurId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du collaborateur.');
            }

            // Mettre à jour la liste des collaborateurs après suppression
            setCollaborateurs((prev) => prev.filter((collab) => collab._id !== collaborateurId));
        } catch (err) {
            setError(err.message);
        }
    };

    const renderTickets = () => {
        if (loadingTickets) {
            return <p className="text-gray-600">Chargement des tickets...</p>;
        }
    
        if (tickets.length === 0) {
            return <p>Aucun ticket affecté à ce collaborateur.</p>;
        }
    
        return (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Numéro de ticket</th>
                        <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Priorité</th>
                        <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Bénéficiaire</th>
                        <th className="py-3 px-4 border-b border-gray-300 text-center text-gray-600 font-medium">Sujet</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket._id} className="hover:bg-gray-100 transition-colors duration-200">
                            <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">{ticket.numeroTicket}</td>
                            <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">{ticket.priorite}</td>
                            <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">{ticket.beneficiaire}</td>
                            <td className="py-3 px-4 border-b border-gray-300 text-gray-700 text-center">{ticket.sujet}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
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
                                                className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
                                                onClick={() => handleVoirTickets(collab._id)}
                                            >
                                                Voir les tickets affectés
                                            </button>
                                            <button
                                                className="bg-yellow-500 text-white px-4 py-2 mr-2 rounded"
                                                onClick={() => handleEditCollaborateur(collab)}
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-4 py-2 rounded"
                                                onClick={() => handleDeleteCollaborateur(collab._id)}
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {selectedCollaborateur && (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-4">Tickets affectés au collaborateur sélectionné :</h3>
                                {renderTickets()}
                            </div>
                        )}
                    </div>
                )}

                {isEditing && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                            <h3 className="text-xl font-bold mb-4">Modifier Collaborateur</h3>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Nom :</label>
                            <input
                                type="text"
                                value={editedCollaborateur.nom}
                                onChange={(e) => setEditedCollaborateur({ ...editedCollaborateur, nom: e.target.value })}
                                className="border border-gray-300 p-2 w-full mb-4"
                            />
                            <label className="block mb-2 text-sm font-medium text-gray-700">Client :</label>
                            <select
                                id="client"
                                value={editedCollaborateur.client}
                                onChange={(e) => setEditedCollaborateur({ ...editedCollaborateur, client: e.target.value })}
                                required
                                className="mt-1 block mb-5 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-300"
                            >
                                <option value="" disabled>Sélectionnez un client</option>
                                {clients.map((clientName, index) => (
                                    <option key={index} value={clientName}>{clientName}</option>
                                ))}
                            </select>
                            <div className="flex justify-end">
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                    onClick={handleSaveChanges}
                                >
                                    Sauvegarder
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CollaborateursList;
