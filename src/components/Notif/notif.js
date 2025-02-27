import { useState, useEffect, useRef } from "react";
import Navbar from "../navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TicketForm() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [priority, setPriority] = useState("1");
    const [tickets, setTickets] = useState([]); // ✅ Stocke les tickets récupérés
    const [createdAt, setCreatedAt] = useState("");
    const [showShinkenForm, setShowShinkenForm] = useState(false);
    const [shinkenTicketCount, setShinkenTicketCount] = useState(1);
    const [shinkenTicketNumbers, setShinkenTicketNumbers] = useState([""]); // Stocke les tickets
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
        const ticketData = {
            ticketNumber,
            priority,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
        };

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

    // Met à jour le nombre de tickets et ajuste le tableau
    const handleShinkenCountChange = (count) => {
        setShinkenTicketCount(count);
        setShinkenTicketNumbers(new Array(parseInt(count)).fill("")); // Remplit un tableau vide avec `count` entrées
    };

    // Met à jour les valeurs des tickets individuels
    const handleShinkenTicketChange = (index, value) => {
        const newTickets = [...shinkenTicketNumbers];
        newTickets[index] = value;
        setShinkenTicketNumbers(newTickets);
    };

    // Envoie les tickets à l'API
    // Envoie le message sur Discord
    const sendShinkenToDiscord = async (tickets) => {
        try {
            const response = await fetch("http://localhost:5000/api/shinken/discord", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets }),
            });

            if (response.ok) {
                console.log("✅ Message Shinken envoyé sur Discord !");
            } else {
                console.error("❌ Erreur lors de l'envoi du message Discord.");
            }
        } catch (error) {
            console.error("❌ Impossible d'envoyer le message Discord :", error);
        }
    };

    const handleShinkenSubmit = async () => {
        if (shinkenTicketNumbers.some(ticket => !ticket.trim())) {
            toast.error("❌ Veuillez remplir tous les champs.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/shinken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets: shinkenTicketNumbers }),
            });

            if (response.ok) {
                toast.success(`${shinkenTicketNumbers.length} tickets Shinken envoyés  !`);
                setShinkenTicketNumbers([""]);
                setShinkenTicketCount(1);
                setShowShinkenForm(false);

                // ✅ Envoie le message à Discord après l'ajout des tickets
                await sendShinkenToDiscord(shinkenTicketNumbers);
            } else {
                toast.error("❌ Erreur lors de l'activation de Shinken.");
            }
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi :", error);
            toast.error("❌ Impossible d'envoyer la demande.");
        }
    };

    return (
        <>
            <Navbar />
            <ToastContainer /> {/* ✅ Conteneur pour les notifications */}
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Créer un Ticket</h2>
                {/* <form onSubmit={handleSubmit}>
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
                    <div className="mb-4">
                        <label className="block text-gray-700">Date de création du Ticket</label>
                        <input
                            type="datetime-local"
                            value={createdAt}
                            onChange={(e) => setCreatedAt(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                    >
                        Soumettre
                    </button>
                </form> */}
                {!showShinkenForm ? (
                    <div>
                        {/* <h2 className="text-xl font-semibold mb-4">Créer un Ticket</h2> */}
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
                            <div className="mb-4">
                                <label className="block text-gray-700">Date de création du Ticket</label>
                                <input
                                    type="datetime-local"
                                    value={createdAt}
                                    onChange={(e) => setCreatedAt(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white font-semibold p-3 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                Soumettre
                            </button>
                        </form>

                        <button
                            onClick={() => setShowShinkenForm(true)}
                            className="w-full bg-gradient-to-r from-gray-800 to-black mt-5 text-white font-semibold p-3 rounded-lg shadow-md hover:from-black hover:to-gray-900 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            Shinken
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-300">
                        <h2 className="text-lg font-bold text-gray-700">Saisir les Shinkens</h2>

                        {/* Sélecteur du nombre de tickets */}
                        <div className="mb-3">
                            <label className="block text-gray-700 font-semibold">Nombre de tickets :</label>
                            <select
                                value={shinkenTicketCount}
                                onChange={(e) => handleShinkenCountChange(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        {/* Champs pour entrer les numéros de tickets */}
                        {shinkenTicketNumbers.map((ticket, index) => (
                            <div key={index} className="mb-3">
                                <input
                                    type="text"
                                    value={ticket}
                                    onChange={(e) => handleShinkenTicketChange(index, e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder={`Numéro du ticket ${index + 1}`}
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex justify-between mt-3">
                            <button
                                onClick={handleShinkenSubmit}
                                className="w-full bg-gradient-to-r mr-3 from-green-500 to-green-600 text-white font-semibold p-3 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                Valider
                            </button>

                            <button
                                onClick={() => setShowShinkenForm(false)}
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold p-3 rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ Liste des tickets */}
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    📋 Liste des Tickets ({tickets.length})
                </h2>

                {tickets.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun ticket enregistré.</p>
                ) : (
                    <ul className="space-y-4">
                        {tickets
                            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) // ✅ Trie par deadline la plus récente
                            .map((ticket) => (
                                <li
                                    key={ticket._id}
                                    className={`p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 transform hover:scale-105
                            ${ticket.priority === "1" ? "border-red-500 bg-red-50" : ""}
                            ${ticket.priority === "2" ? "border-orange-500 bg-orange-50" : ""}
                            ${ticket.priority === "3" ? "border-yellow-500 bg-yellow-50" : ""}
                            ${ticket.priority === "4" ? "border-blue-500 bg-blue-50" : ""}
                            ${ticket.priority === "5" ? "border-green-500 bg-green-50" : ""}`
                                    }
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">
                                                🏷️ <strong>Ticket :</strong> {ticket.ticketNumber}
                                            </p>
                                            <p className="text-gray-600"><strong>📌 Priorité :</strong> <span className="font-bold">{ticket.priority}</span></p>
                                            <p className="text-gray-600"><strong>📅 Crée :</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                                            <p className="text-gray-700 font-semibold"><strong>⏳ Deadline :</strong> {new Date(ticket.deadline).toLocaleString()}</p>
                                            <p className="text-gray-700"><strong>🔔 Alerte prévue :</strong> {new Date(ticket.alertTime).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(ticket._id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
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
