const Ticket = require('../models/ticketModel');
const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils');
const moment = require("moment-timezone");


const calculateDeadline = (priority, createdAt = new Date()) => {
    const businessStartHour = 9;

    if (priority === "4" || priority === "5") {
        let adjustedDate = new Date(createdAt);
        if (adjustedDate.getHours() >= 18 || adjustedDate.getHours() < businessStartHour) {
            adjustedDate.setHours(businessStartHour, 0, 0, 0);
        }
        return addBusinessDays(adjustedDate, priority === "4" ? 3 : 5);
    }

    switch (priority) {
        case "1": return new Date(createdAt.getTime() + 1 * 60 * 60 * 1000);
        case "2": return new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
        case "3": return addBusinessHours(createdAt, 8);
        default: return createdAt;
    }
};

const calculateAlertTime = (priority, createdAt) => {
    const businessStartHour = 9;
    let alertOffset;

    if (priority === "4" || priority === "5") {
        let adjustedDate = new Date(createdAt);
        if (adjustedDate.getHours() >= 18 || adjustedDate.getHours() < businessStartHour) {
            adjustedDate.setHours(businessStartHour, 0, 0, 0);
        }
        return addBusinessDays(adjustedDate, priority === "4" ? 2 : 4);
    }

    switch (priority) {
        case "1": alertOffset = 10 / 3600; break;
        case "2": alertOffset = 15 / 60; break;
        case "3": alertOffset = 5; break;
        default: alertOffset = 0;
    }
    return addBusinessHours(new Date(createdAt), alertOffset);
};

exports.saveExtractedTickets = async (req, res) => {
    try {
        console.log("📥 Tickets reçus pour enregistrement :", req.body);
        let tickets = req.body;

        if (!Array.isArray(tickets) || tickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket fourni." });
        }

        tickets = tickets.map(ticket => {
            const createdAt = new Date();
            const deadline = calculateDeadline(ticket.priority, createdAt);
            const alertTime = calculateAlertTime(ticket.priority, createdAt);

            return {
                ...ticket,
                createdAt,
                deadline,
                alertTime
            };
        });

        await Ticket.insertMany(tickets);
        console.log("✅ Tickets enregistrés avec succès !");
        res.status(201).json({ message: "Tickets enregistrés avec succès !" });

    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des tickets :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// ✅ Fonction pour convertir une date "13/03/2025 14:41:15" en format ISO
const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // 🔹 Définition du format source : "13/03/2025 14:41:15"
    const parsedDate = moment.tz(dateStr, "DD/MM/YYYY HH:mm:ss", "Europe/Paris");

    // 🛑 Vérification si la conversion a échoué
    if (!parsedDate.isValid()) {
        console.error(`⚠️ Format de date invalide reçu: ${dateStr}`);
        return null;
    }

    console.log(`✅ Date convertie : ${dateStr} ➝ ${parsedDate.toISOString()}`);
    return parsedDate.toDate(); // ✅ Converti en objet `Date` utilisable par MongoDB
};

// 📌 Récupère tous les tickets enregistrés
exports.getExtractedTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des tickets", error });
    }
};
