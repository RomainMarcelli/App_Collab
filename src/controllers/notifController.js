const Notif = require('../models/notifModel');
const { sendDesktopNotification } = require('../utils/notification'); // ✅ Assure-toi d'importer la fonction



// Fonction pour calculer la deadline en fonction de la priorité
const calculateDeadline = (priority) => {
    const now = new Date();
    switch (priority) {
        case "1": return new Date(now.getTime() + 1 * 60 * 60 * 1000); // P1 = 1H
        case "2": return new Date(now.getTime() + 2 * 60 * 60 * 1000); // P2 = 2H
        case "3": return new Date(now.getTime() + 8 * 60 * 60 * 1000); // P3 = 8H
        case "4": return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // P4 = 3 jours
        case "5": return new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // P5 = 5 jours
        default: return now;
    }
};

const calculateAlertTime = (priority) => {
    const now = new Date();
    switch (priority) {
        // case "1": return new Date(now.getTime() + 1 * 60 * 1000); // P1 = 5 min
        case "1": return new Date(now.getTime() + 10 * 1000); // P1 = 10 sec
        case "2": return new Date(now.getTime() + 15 * 60 * 1000); // P2 = 15 min
        case "3": return new Date(now.getTime() + 4 * 60 * 60 * 1000); // P3 = 4H
        case "4": return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // P4 = 2 jours
        case "5": return new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // P5 = 4 jours
        default: return now;
    }
};


// Créer une notification avec une deadline
exports.createNotifFromRequest = async (req, res) => {
    try {
        const { ticketNumber, priority } = req.body;

        if (!ticketNumber || !priority) {
            return res.status(400).json({ message: "Tous les champs sont requis !" });
        }

        const deadline = calculateDeadline(priority);
        const alertTime = calculateAlertTime(priority);

        const newNotif = new Notif({ ticketNumber, priority, deadline, alertTime });
        await newNotif.save();

        res.status(201).json({ message: "Notification enregistrée avec succès !", deadline, alertTime });
    } catch (error) {
        console.error("Erreur lors de l’enregistrement de la notification :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
};


// Récupérer toutes les notifications
exports.getAllNotifs = async (req, res) => {
    try {
        const notifications = await Notif.find().sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des notifications", error });
    }
};


exports.getUpcomingNotifications = async (req, res) => {
    try {
        const now = new Date();
        const notifications = await Notif.find({
            alertTime: { $lte: now },
            alertSent: { $ne: true }
        });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des notifications", error });
    }
};


exports.checkForAlerts = async () => {
    const now = new Date();
    const notifications = await Notif.find({ alertTime: { $lte: now }, alertSent: { $ne: true } });

    notifications.forEach(async (notif) => {
        console.log(`🚨 ALERTE : Ticket ${notif.ticketNumber} (Priorité ${notif.priority})`);

        // ✅ Envoi d'une notification de bureau
        sendDesktopNotification(
            "⚠️ Alerte Ticket",
            `La deadline approche pour le ticket ${notif.ticketNumber} (Priorité ${notif.priority}).`
        );

        // ✅ Marquer la notification comme envoyée
        await Notif.updateOne({ _id: notif._id }, { $set: { alertSent: true } });
    });
};

// ✅ Vérifier les alertes toutes les minutes
setInterval(exports.checkForAlerts, 60 * 1000);