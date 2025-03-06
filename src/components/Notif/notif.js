import { useState, useEffect, useRef } from "react";
import Navbar from "../navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function TicketForm() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [priority, setPriority] = useState("1");
    const [tickets, setTickets] = useState([]); // ✅ Stocke les tickets récupérés
    const [createdAt, setCreatedAt] = useState("");
    const [showShinkenForm, setShowShinkenForm] = useState(false);
    const [shinkenTicketCount, setShinkenTicketCount] = useState(1);
    const [shinkenTicketNumbers, setShinkenTicketNumbers] = useState([""]); // Stocke les tickets
    const [showModal, setShowModal] = useState(false);
    const [showForm, setShowForm] = useState(true); // ✅ État pour afficher/masquer le formulaire
    const [modalMessage, setModalMessage] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [filterType, setFilterType] = useState("");
    const [isSticky, setIsSticky] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [newCreatedAt, setNewCreatedAt] = useState("");
    const filterRef = useRef(null);
    const placeholderRef = useRef(null);



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

    useEffect(() => {
        const handleScroll = () => {
            if (filterRef.current && placeholderRef.current) {
                const rect = placeholderRef.current.getBoundingClientRect();
                setIsSticky(rect.top <= 0);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
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

    // ✅ Corrige le formatage pour afficher l'heure locale au lieu de UTC
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000; // Décalage en millisecondes
        const localDate = new Date(date - offset); // Appliquer le décalage
        return localDate.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM en heure locale
    };

    const handleUpdate = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/notif/${ticketId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ newCreatedAt: new Date(newCreatedAt).toISOString() }),
            });

            if (!response.ok) {
                toast.error("❌ Erreur lors de la mise à jour.");
                return;
            }

            const data = await response.json();

            if (!data.updatedNotif) {
                toast.error("❌ Erreur : La réponse de l'API ne contient pas la mise à jour.");
                return;
            }

            toast.success("✔ Ticket mis à jour !");

            // ✅ Met à jour l'affichage avec la version mise à jour de la BDD
            setTickets((prevTickets) =>
                prevTickets.map((t) =>
                    t._id === ticketId ? { ...t, createdAt: data.updatedNotif.createdAt } : t
                )
            );

            setEditingTicketId(null);
        } catch (error) {
            console.error("❌ Erreur:", error);
            toast.error("❌ Impossible de modifier le ticket !");
        }
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

    const filteredTickets = tickets.filter(ticket => {
        return (
            (filterPriority ? ticket.priority === filterPriority : true) &&
            (filterType ? ticket.ticketNumber.startsWith(filterType) : true) &&
            (searchTerm ? ticket.ticketNumber.includes(searchTerm) : true)
        );
    });


    return (
        <>
            <Navbar />
            <ToastContainer /> {/* ✅ Conteneur pour les notifications */}
            {/* Flèches pour naviguer en haut et en bas de la page */}
            <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-110"
                >
                    <FaArrowUp size={20} />
                </button>
                <button
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-110"
                >
                    <FaArrowDown size={20} />
                </button>
            </div>
            {showForm && (
                <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                    {/* <h2 className="text-xl font-semibold mb-4">Créer un Ticket</h2> */}

                    {!showShinkenForm ? (
                        <div>
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
            )}
            <div ref={placeholderRef} className="h-0"></div>
            <div ref={filterRef} className={`w-full bg-white p-4 border-b border-gray-200 transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-40 shadow-md' : 'relative'}`}>
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Filtres</h2>
                    <div className="flex gap-4">
                        {/* Filtrer par priorité */}
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="p-2 border rounded-lg w-1/3"
                        >
                            <option value="">Toutes priorités</option>
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>

                        {/* Barre de recherche */}
                        <input
                            type="text"
                            placeholder="Rechercher un ticket..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border rounded-lg w-1/3"
                        />

                        {/* Filtrer par type (I ou P) */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="p-2 border rounded-lg w-1/3"
                        >
                            <option value="">Tous types</option>
                            <option value="I">Commence par I</option>
                            <option value="S">Commence par S</option>
                        </select>


                    </div>
                </div>
            </div>


            {/* ✅ Liste des tickets */}
            <div className="max-w-2xl mx-auto mt-10 mb-[20px] p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    📋 Liste des Tickets ({filteredTickets.length})
                </h2>

                {filteredTickets.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun ticket enregistré.</p>
                ) : (
                    <ul className="space-y-4">
                        {filteredTickets
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
                                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-gray-800">
                                                🏷️ <strong>Ticket :</strong> {ticket.ticketNumber}
                                            </p>
                                            <p className="text-gray-600"><strong>📌 Priorité :</strong> <span className="font-bold">{ticket.priority}</span></p>
                                            <p className="text-gray-600"><strong>📅 Crée :</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                                            <p className="text-gray-700 font-semibold"><strong>⏳ Deadline :</strong> {new Date(ticket.deadline).toLocaleString()}</p>
                                            <p className="text-gray-700"><strong>🔔 Alerte prévue :</strong> {new Date(ticket.alertTime).toLocaleString()}</p>
                                        </div>

                                        <div className="flex flex-col items-center gap-3">
                                            {/* ✅ Bouton Modifier */}
                                            <button
                                                onClick={() => {
                                                    setEditingTicketId(editingTicketId === ticket._id ? null : ticket._id); // ✅ Ouvre/ferme le formulaire
                                                    setNewCreatedAt(formatDateForInput(ticket.createdAt));
                                                }}
                                                className="flex items-center bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300 shadow-md"
                                            >
                                                {editingTicketId === ticket._id ? "Annuler" : "Modifier"}
                                            </button>

                                            {/* ✅ Formulaire de modification */}
                                            {editingTicketId === ticket._id && (
                                                <div className="mt-2 p-4 bg-gray-100 rounded-lg shadow-inner flex flex-col items-center w-full">
                                                    <input
                                                        type="datetime-local"
                                                        value={newCreatedAt}
                                                        onChange={(e) => setNewCreatedAt(e.target.value)}
                                                        className="border p-2 rounded-lg w-full focus:ring focus:ring-blue-300"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdate(ticket._id)}
                                                        className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md w-full"
                                                    >
                                                        Enregistrer
                                                    </button>
                                                </div>
                                            )}

                                            {/* ✅ Bouton Supprimer */}
                                            <button
                                                onClick={() => handleDelete(ticket._id)}
                                                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
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