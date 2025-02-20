import { useState, useEffect, useRef } from "react";
import Navbar from "../navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TicketForm() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [priority, setPriority] = useState("1");
    const [tickets, setTickets] = useState([]); // ✅ Stocke les tickets récupérés

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    let originalTitle = document.title;
    const alertIntervalRef = useRef(null); // ✅ Utilisation de useRef pour éviter des bugs avec setInterval

    // 🔔 Demander la permission pour les notifications
    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                }
            });
        }
    }, []);

    // 🔎 Vérifier périodiquement les alertes
    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/notif");
                const notifications = await response.json();

                const now = new Date();
                notifications.forEach((notif) => {
                    const alertTime = new Date(notif.alertTime);

                    if (alertTime <= now) {
                        showNotification(notif.ticketNumber, notif.priority);
                    }
                });
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des notifications :", error);
            }
        };

        const interval = setInterval(checkAlerts, 30000);
        return () => clearInterval(interval);
    }, []); // ❌ ERREUR : `showNotification` est utilisé mais absent du tableau des dépendances    

    // ✅ Charger tous les tickets au chargement du composant
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/notif");
                const data = await response.json();
                setTickets(data); // ✅ Met à jour l'état des tickets
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des tickets :", error);
            }
        };

        fetchTickets();
        const interval = setInterval(fetchTickets, 30000); // ✅ Rafraîchit toutes les 30 sec
        return () => clearInterval(interval);
    }, []);

    // ✅ Afficher une notification stylée + popup
    const showNotification = (ticketNumber, priority) => {

        const message = `🚨 Attention ! La deadline approche pour le ticket ${ticketNumber} (Priorité ${priority}).`;

        showFullScreenPopup(ticketNumber, priority);
        startBlinking("⚠️ ALERTE TICKET ⚠️");

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⚠️ Alerte Ticket", {
                body: message,
                icon: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
                requireInteraction: true
            });
        }

        toast.warn(message, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            style: { background: "#ffcc00", color: "#000", fontWeight: "bold", fontSize: "18px" }
        });
    };

    // ✅ Popup plein écran
    const showFullScreenPopup = (ticketNumber, priority) => {
        setModalMessage(`🚨 Attention ! La deadline approche pour le ticket ${ticketNumber} (Priorité ${priority}).`);
        setShowModal(true);
    };

    // ✅ Faire clignoter l'onglet (si minimisé)
    const startBlinking = (message) => {
        if (alertIntervalRef.current) return; // ✅ Évite de créer plusieurs intervalles
        let isOriginalTitle = true;

        alertIntervalRef.current = setInterval(() => {
            document.title = isOriginalTitle ? message : originalTitle;
            isOriginalTitle = !isOriginalTitle;
        }, 1000);
    };

    const stopBlinking = () => {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
        document.title = originalTitle;
    };

    // Fonction pour Supprimer un ticket
    const handleDelete = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/notif/${ticketId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("🗑️ Ticket supprimé avec succès !");
                setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId)); // ✅ Mise à jour de l'affichage
            } else {
                toast.error("❌ Erreur lors de la suppression du ticket.");
            }
        } catch (error) {
            console.error("❌ Erreur:", error);
            toast.error("❌ Erreur lors de la suppression !");
        }
    };


    // ✅ Envoyer un ticket
    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { ticketNumber, priority };


        try {
            const response = await fetch("http://localhost:5000/api/notif", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ticketData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(
                    <div style={{ textAlign: "left", lineHeight: "1.5" }}>
                        <div style={{ fontSize: "16px", fontWeight: "bold" }}>Ticket enregistré !</div>
                        <div><strong>Deadline:</strong> {new Date(result.deadline).toLocaleString()}</div>
                        <div><strong>Alerte prévue:</strong> {new Date(result.alertTime).toLocaleString()}</div>
                    </div>,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    }
                );                
                setTicketNumber("");
                setPriority("1");
            } else {
                toast.error("❌ Erreur lors de l'enregistrement de la notification: " + result.message);
            }
        } catch (error) {
            console.error("❌ Erreur: ", error);
            toast.error("❌ Erreur lors de l'envoi des données !");
        }
    };

    return (
        <>
            <Navbar />
            <ToastContainer /> {/* ✅ Conteneur pour les notifications */}
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Créer un Ticket</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Numéro du Ticket</label>
                        <input
                            type="text"
                            value={ticketNumber}
                            onChange={(e) => setTicketNumber(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Priorité</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                    >
                        Soumettre
                    </button>
                </form>
            </div>

            {/* ✅ Liste des tickets */}
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Liste des Tickets</h2>
                {tickets.length === 0 ? (
                    <p className="text-gray-500">Aucun ticket enregistré.</p>
                ) : (
                    <ul className="space-y-2">
                        {tickets.map((ticket) => (
                            <li key={ticket._id} className="p-3 bg-gray-100 rounded-lg shadow flex justify-between items-center">
                                <div>
                                    <p><strong>Ticket :</strong> {ticket.ticketNumber}</p>
                                    <p><strong>Priorité :</strong> {ticket.priority}</p>
                                    <p><strong>Deadline :</strong> {new Date(ticket.deadline).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(ticket._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ✅ Popup plein écran */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
                        <h2 className="text-2xl font-bold text-red-600">⚠️ ALERTE ⚠️</h2>
                        <p className="text-lg mt-2">{modalMessage}</p>
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => {
                                setShowModal(false);
                                stopBlinking();
                            }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
