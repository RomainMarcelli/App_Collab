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
            if (!formData.dateEmission) {
                throw new Error('Veuillez sélectionner une date valide.');
            }

            const parsedDate = new Date(formData.dateEmission);

            if (isNaN(parsedDate.getTime())) {
                throw new Error('La date fournie est invalide.');
            }

            const dateEmission = parsedDate.toISOString();
            const dataToSend = { ...formData, dateEmission };

            const response = await fetch('http://localhost:5000/api/tickets', {
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

            setFormData({
                numeroTicket: '',
                priorite: '1',
                sujet: '',
                description: '',
                beneficiaire: '',
                dateEmission: '',
            });

            setIsPopupVisible(true);

            setTimeout(() => {
                setIsPopupVisible(false);
            }, 3000);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-extrabold text-indigo-600 mb-4 text-center">
                        Créer un Ticket
                    </h2>
                    <p className="text-gray-500 text-center mb-8">
                        Veuillez remplir les champs ci-dessous pour ajouter un nouveau ticket.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Numéro du Ticket</label>
                            <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
                                <span className="text-gray-500">
                                    <i className="fas fa-hashtag"></i>
                                </span>
                                <input
                                    type="text"
                                    name="numeroTicket"
                                    value={formData.numeroTicket}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border-none focus:outline-none"
                                    placeholder="Ex : TICKET_123"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Priorité</label>
                            <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
                                <select
                                    name="priorite"
                                    value={formData.priorite}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border-none focus:outline-none"
                                    required
                                >
                                    <option value="1">1 (Urgent)</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Sujet</label>
                            <input
                                type="text"
                                name="sujet"
                                value={formData.sujet}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ex : Problème de connexion"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="4"
                                placeholder="Décrivez le problème ici..."
                                required
                            ></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Bénéficiaire</label>
                            <input
                                type="text"
                                name="beneficiaire"
                                value={formData.beneficiaire}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ex : Nom du bénéficiaire"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Date et Heure d'émission</label>
                            <input
                                type="datetime-local"
                                name="dateEmission"
                                value={formData.dateEmission || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Ajouter le Ticket
                            </button>
                        </div>
                    </form>

                    {isPopupVisible && (
                        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300">
                            Ticket créé avec succès !
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreateTicketForm;
