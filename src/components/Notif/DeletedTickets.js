import { useState, useEffect } from "react";
import Navbar from "../navbar";
import { toast } from "react-toastify";

export default function DeletedTickets() {
    const [deletedTickets, setDeletedTickets] = useState([]);

    // 🔄 Récupère les tickets supprimés depuis l'API
    useEffect(() => {
        const fetchDeletedTickets = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/deleted-notifs");
                if (!response.ok) throw new Error("Erreur lors de la récupération des tickets supprimés.");
                const data = await response.json();
                setDeletedTickets(data);
            } catch (error) {
                console.error("Erreur :", error);
                toast.error("Impossible de récupérer les tickets supprimés !");
            }
        };

        fetchDeletedTickets();
    }, []);

    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🗑️ Historique des Tickets Supprimés ({deletedTickets.length})
                </h2>

                {deletedTickets.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun ticket supprimé enregistré.</p>
                ) : (
                    <ul className="space-y-4">
                        {deletedTickets.map((ticket) => (
                            <li
                                key={ticket._id}
                                className="p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 transform hover:scale-105 bg-gray-50 border-gray-400"
                            >
                                <p className="text-lg font-semibold text-gray-800">
                                    🏷️ <strong>Ticket :</strong> {ticket.ticketNumber}
                                </p>
                                <p className="text-gray-600"><strong>📌 Priorité :</strong> <span className="font-bold">{ticket.priority}</span></p>
                                <p className="text-gray-600"><strong>📅 Crée :</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                                <p className="text-gray-700"><strong>⏳ Deadline :</strong> {new Date(ticket.deadline).toLocaleString()}</p>
                                <p className="text-gray-700"><strong>🔔 Alerte prévue :</strong> {new Date(ticket.alertTime).toLocaleString()}</p>
                                <p className="text-red-600"><strong>🗑️ Supprimé le :</strong> {new Date(ticket.deletedAt).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
