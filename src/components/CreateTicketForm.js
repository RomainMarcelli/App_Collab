import React, { useState } from 'react';
import Navbar from './navbar'; // Assurez-vous que le chemin est correct

const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
        numeroTicket: '',
        priorite: '1',
        sujet: '',
        description: '',
        beneficiaire: '',
        dateEmission: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Ticket créé avec succès');
                setFormData({
                    numeroTicket: '',
                    priorite: '1',
                    sujet: '',
                    description: '',
                    beneficiaire: '',
                    dateEmission: '',
                });
            } else {
                console.log('Erreur côté serveur :', data);
                alert('Erreur lors de la création du ticket : ' + data.message);
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
            alert('Erreur réseau : ' + error.message);
        }
    };

    // Couleurs des priorités
    const priorityColors = {
        '1': 'bg-black text-white', // Priorité 1
        '2': 'bg-red-500 text-white', // Priorité 2
        '3': 'bg-yellow-500 text-white', // Priorité 3
        '4': 'bg-blue-500 text-white', // Priorité 4
        '5': 'bg-green-500 text-white', // Priorité 5
    };

    const priorityTimes = {
        1: '1h',
        2: '2h',
        3: '8h',
        4: '3 jours',
        5: '5 jours',
    };
    

    return (
        <>
            <Navbar />
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
