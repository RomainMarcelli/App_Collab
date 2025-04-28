import React, { useEffect, useState } from 'react';

const ViewName = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/tickets');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des tickets');
                }
                const data = await response.json();
                console.log(data); // Vérifiez ici la structure des données
                setTickets(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) return <div>Chargement des tickets...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Liste des Tickets</h1>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Numéro de Ticket</th>
                        <th className="border px-4 py-2">Collaborateur</th>
                        <th className="border px-4 py-2">Priorité</th>
                        <th className="border px-4 py-2">Sujet</th>
                        <th className="border px-4 py-2">Description</th>
                        <th className="border px-4 py-2">Bénéficiaire</th>
                        <th className="border px-4 py-2">Date d'Émission</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket._id}>
                            <td className="border px-4 py-2 text-center">{ticket.numeroTicket}</td>
                            <td className="border px-4 py-2 text-center">
                                {ticket.collaborateur && ticket.collaborateur.nom ? ticket.collaborateur.nom : 'Aucun'}
                            </td>
                            <td className="border px-4 py-2 text-center">{ticket.priorite}</td>
                            <td className="border px-4 py-2 text-center">{ticket.sujet}</td>
                            <td className="border px-4 py-2 text-center">{ticket.description}</td>
                            <td className="border px-4 py-2 text-center">{ticket.beneficiaire}</td>
                            <td className="border px-4 py-2 text-center">
                                {new Date(ticket.dateEmission).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewName;
