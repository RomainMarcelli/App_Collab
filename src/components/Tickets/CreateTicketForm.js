import React, { useState } from 'react';
import Navbar from '../navbar'; // Assurez-vous que le chemin est correct

const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
        numeroTicket: '',
        priorite: '1',
        sujet: '',
        description: '',
        beneficiaire: '',
        dateEmission: '', // Définit la date avec une chaîne vide par défaut
    });

    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Vérifiez si la date est bien définie
            if (!formData.dateEmission) {
                throw new Error('Veuillez sélectionner une date valide.');
            }

            // Convertir la date en objet Date (sans toISOString pour conserver le fuseau local)
            const parsedDate = new Date(formData.dateEmission);

            // Vérifiez si la date est valide
            if (isNaN(parsedDate.getTime())) {
                throw new Error('La date fournie est invalide.');
            }

            // Formate la date en ISO string pour l'envoi au backend
            const dateEmission = parsedDate.toISOString();

            const dataToSend = { ...formData, dateEmission };

            console.log('Données à envoyer :', dataToSend);

            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création du ticket');
            }

            console.log('Ticket créé avec succès', data);

            // Réinitialise le formulaire immédiatement après succès
            setFormData({
                numeroTicket: '',
                priorite: '1',
                sujet: '',
                description: '',
                beneficiaire: '',
                dateEmission: '',
            });

            // Affiche la popup
            setIsPopupVisible(true);

            // Cache la popup après un délai
            setTimeout(() => {
                setIsPopupVisible(false);
            }, 3000); // Cache la popup après 3 secondes
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error.message);
            alert(error.message); // Montre l'erreur à l'utilisateur
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-lg relative">
                <h2 className="text-2xl font-bold mb-6 text-center">Créer un Ticket</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Numéro du Ticket</label>
                        <input
                            type="text"
                            name="numeroTicket"
                            value={formData.numeroTicket}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Priorité</label>
                        <select
                            name="priorite"
                            value={formData.priorite}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="1">1</option>
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
                            value={formData.sujet}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Bénéficiaire</label>
                        <input
                            type="text"
                            name="beneficiaire"
                            value={formData.beneficiaire}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Date et Heure d'émission</label>
                        <input
                            type="datetime-local"
                            name="dateEmission"
                            value={formData.dateEmission || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Ajouter le Ticket
                        </button>
                    </div>
                </form>

                {isPopupVisible && (
                    <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center p-4 rounded-md shadow-md">
                        Ticket créé avec succès !
                    </div>
                )}
            </div>
        </>
    );
};

export default CreateTicketForm;
