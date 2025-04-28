import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../navbar';
import { createTicket } from '../../services/ticketService';  // Assurez-vous que ce chemin est correct

const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
        numeroTicket: '',
        priorite: '1',
        sujet: '',
        description: '',
        beneficiaire: '',
        dateEmission: '',
    });

    const [ticketCreated, setTicketCreated] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Créer un objet Date à partir de la valeur du champ "dateEmission"
        const dateTime = new Date(formData.dateEmission);

        // Vérifier si la date est valide
        if (isNaN(dateTime.getTime())) {
            alert('Veuillez entrer une date et une heure valides.');
            return;
        }

        // Créer un numéro de ticket unique (par exemple, basé sur le timestamp)
        const numeroTicket = `TICKET-${Date.now()}`;

        const newTicket = {
            numeroTicket: numeroTicket,
            priorite: formData.priorite,
            sujet: formData.sujet,
            description: formData.description,
            beneficiaire: formData.beneficiaire,
            dateEmission: dateTime.toISOString(),
        };

        try {
            // Appel à la fonction createTicket de ticketService
            const response = await createTicket(newTicket);

            // Si le ticket est créé avec succès, on met à jour l'état
            setTicketCreated(true);
            setFormData({
                numeroTicket: '',
                priorite: '1',
                sujet: '',
                description: '',
                beneficiaire: '',
                dateEmission: '',
            });
        } catch (error) {
            alert(`Erreur : ${error.message}`);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-end mt-4 mr-10 absolute right-1">
                <Link to="/create-Collab">
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Ajouter Collaborateur
                    </button>
                </Link>
            </div>
            <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-lg">
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
                            value={formData.dateEmission}
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
            </div>
        </>
    );
};

export default CreateTicketForm;
