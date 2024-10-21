// src/components/CreateCollab.js

import React, { useState } from 'react';
import Navbar from './navbar';

const CreateCollab = () => {
    const [nom, setNom] = useState('');
    const [client, setClient] = useState('');
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false); // Nouvel état pour la popup

    // Liste des clients prédéfinis
    const clients = [
        'Nhood',
        'Nexity',
        'Somain'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:3000/api/collaborateurs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nom, client }),
        });

        const result = await response.json();

        if (response.ok) {
            setMessage('Collaborateur ajouté avec succès !');
            setNom('');
            setClient('');
            setShowPopup(true); // Afficher la popup
        } else {
            setMessage(`Erreur : ${result.message}`);
        }
    };

    // Fonction pour fermer la popup
    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <>
            <Navbar />
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Ajouter un Collaborateur</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom:</label>
                        <input
                            type="text"
                            id="nom"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-300"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client:</label>
                        <select
                            id="client"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-300"
                        >
                            <option value="" disabled>Sélectionnez un client</option>
                            {clients.map((clientName, index) => (
                                <option key={index} value={clientName}>{clientName}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-2 rounded-md hover:bg-blue-600"
                    >
                        Ajouter Collaborateur
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
            </div>

            {/* Popup de confirmation */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-bold">Succès</h3>
                        <p className="mt-2">{message}</p>
                        <button
                            onClick={closePopup}
                            className="mt-4 w-full bg-blue-500 text-white font-bold py-2 rounded-md hover:bg-blue-600"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateCollab;
