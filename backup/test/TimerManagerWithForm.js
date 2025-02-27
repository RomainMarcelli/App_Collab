import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CreateTicket = () => {
    const [formData, setFormData] = useState({
        name: '',
        dateEmission: '',
        timeEmission: '',
        priorite: '1',
    });

    const [ticketCreated, setTicketCreated] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dateTime = new Date(`${formData.dateEmission}T${formData.timeEmission}`);
        if (isNaN(dateTime.getTime())) {
            alert('Veuillez entrer une date et une heure valides.');
            return;
        }

        const newTicket = {
            id: Date.now(),
            name: formData.name,
            dateEmission: dateTime.toISOString(),
            priorite: formData.priorite,
        };

        // Ajouter le ticket au localStorage
        const existingTickets = JSON.parse(localStorage.getItem('tickets')) || [];
        localStorage.setItem('tickets', JSON.stringify([...existingTickets, newTicket]));

        setTicketCreated(true);
        setFormData({ name: '', dateEmission: '', timeEmission: '', priorite: '1' });
    };


    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Créer un Ticket</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Nom du Ticket</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Date d'Émission</label>
                    <input
                        type="date"
                        name="dateEmission"
                        value={formData.dateEmission}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Heure d'Émission</label>
                    <input
                        type="time"
                        name="timeEmission"
                        value={formData.timeEmission}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Priorité</label>
                    <select
                        name="priorite"
                        value={formData.priorite}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="1">P1 (30 minutes)</option>
                        <option value="2">P2 (1 heure)</option>
                        <option value="3">P3 (4 heures)</option>
                        <option value="4">P4 (35 heures)</option>
                        <option value="5">P5 (72 heures)</option>
                    </select>
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Créer le Ticket
                    </button>
                </div>
            </form>

            {ticketCreated && (
                <div className="mt-6 text-center">
                    <Link to="/tickets">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                            Voir les Tickets
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CreateTicket;
