import React, { useEffect, useState } from 'react';

const TicketsView = () => {
  // État pour stocker les tickets
  const [tickets, setTickets] = useState([]);
  // État pour gérer les erreurs
  const [error, setError] = useState(null);
  // État pour gérer le chargement
  const [loading, setLoading] = useState(true);

  // Récupérer les tickets au montage du composant
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tickets'); // Correction de l'URL
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des tickets');
        }
        const data = await response.json();
        setTickets(data); // Stocke les tickets dans l'état
      } catch (err) {
        setError(err.message); // Gérer les erreurs
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // Le tableau vide signifie que l'effet s'exécute une seule fois après le montage du composant

  if (loading) {
    return <p>Chargement des tickets...</p>; // Affichage pendant le chargement
  }

  return (
    <div>
      <h1>Liste des Tickets</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Affichage de l'erreur si présente */}
      <table>
        <thead>
          <tr>
            <th>Numéro de Ticket</th>
            <th>Priorité</th>
            <th>Sujet</th>
            <th>Bénéficiaire</th>
            <th>Description</th>
            <th>Date d'Émission</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>{ticket.numeroTicket}</td>
                <td>{ticket.priorite}</td>
                <td>{ticket.sujet}</td>
                <td>{ticket.beneficiaire}</td>
                <td>{ticket.description}</td>
                <td>{new Date(ticket.dateEmission).toLocaleDateString()}</td> {/* Date formatée */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Aucun ticket trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsView;
