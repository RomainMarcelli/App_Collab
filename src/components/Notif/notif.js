import { useState, useEffect, useRef } from "react";
import Navbar from "../navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TicketForm() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [priority, setPriority] = useState("1");

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    let originalTitle = document.title;
    const alertIntervalRef = useRef(null); // ✅ Utilisation de useRef pour éviter des bugs avec setInterval

    // 🔔 Demander la permission pour les notifications
    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("🔔 Notifications activées !");
                }
            });
        }
    }, []);

    // 🔎 Vérifier périodiquement les alertes
    useEffect(() => {
        const checkAlerts = async () => {
            console.log("🔍 Vérification des alertes en cours...");
            try {
                const response = await fetch("http://localhost:5000/api/notif");
                const notifications = await response.json();

                console.log("🔍 Notifications récupérées :", notifications);

                const now = new Date();
                notifications.forEach((notif) => {
                    const alertTime = new Date(notif.alertTime);
    
                    if (alertTime <= now) {
                        console.log(`⏳ Alerte déclenchée pour le ticket ${notif.ticketNumber}`);
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

    // ✅ Afficher une notification stylée + popup
    const showNotification = (ticketNumber, priority) => {
        console.log(`🔔 Notification déclenchée pour le ticket ${ticketNumber} (Priorité ${priority})`);
    
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

    // ✅ Envoyer un ticket
    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { ticketNumber, priority };

        console.log("📩 Envoi des données :", ticketData); // ✅ Vérifie que les données partent bien

        try {
            const response = await fetch("http://localhost:5000/api/notif", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ticketData),
            });

            const result = await response.json();
            console.log("📩 Réponse serveur :", result); // ✅ Vérifie la réponse du serveur

            if (response.ok) {
                toast.success(`✅ Notification enregistrée ! Deadline: ${new Date(result.deadline).toLocaleString()}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
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
