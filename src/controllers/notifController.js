const { Client } = require("discord.js");
const Notif = require('../models/notifModel');
const { sendDesktopNotification } = require('../utils/notification'); // ✅ Assure-toi d'importer la fonction
const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils');


// Fonction pour calculer la deadline en fonction de la priorité

// Fonction pour calculer la deadline en fonction de la priorité
const calculateDeadline = (priority, createdAt = null) => {
    const now = createdAt ? new Date(createdAt) : new Date(); // ✅ Prend `createdAt` si fourni, sinon `new Date()`

    switch (priority) {
        case "1": return new Date(now.getTime() + 1 * 60 * 60 * 1000); // P1 = 1H
        case "2": return new Date(now.getTime() + 2 * 60 * 60 * 1000); // P2 = 2H
        case "3": return addBusinessHours(now, 8); // ✅ P3 = 8H avec business hours
        case "4": return addBusinessDays(now, 3); // ✅ P4 = 3 jours complets
        case "5": return addBusinessDays(now, 5); // ✅ P5 = 5 jours complets
        default: return now;
    }
};

const calculateAlertTime = (priority, createdAt) => {
    let alertOffset;
    let useBusinessDays = false; // ✅ Détermine si on compte en jours ouvrés

    switch (priority) {
        case "1": alertOffset = 10 / 3600; break;  // ✅ P1 = 10 secondes après `createdAt`
        case "2": alertOffset = 15 / 60; break;   // ✅ P2 = 15 minutes après `createdAt`
        case "3": alertOffset = 4; break;         // ✅ P3 = 4 heures après `createdAt`
        case "4": alertOffset = 2; useBusinessDays = true; break; // ✅ P4 = 2 jours après `createdAt`
        case "5": alertOffset = 4; useBusinessDays = true; break; // ✅ P5 = 4 jours après `createdAt`
        default: alertOffset = 0;
    }

    if (useBusinessDays) {
        // ✅ Si P4 ou P5, ajouter des jours ouvrés à `createdAt`
        const finalAlertTime = addBusinessDays(new Date(createdAt), alertOffset);
        return finalAlertTime;
    } else {
        // ✅ Si P1, P2 ou P3, ajouter des heures ouvrées à `createdAt`
        const finalAlertTime = addBusinessHours(new Date(createdAt), alertOffset);
        return finalAlertTime;
    }
};

exports.createNotifFromRequest = async (req, res) => {
    try {
        const { ticketNumber, priority, createdAt } = req.body;

        if (!ticketNumber || !priority) {
            return res.status(400).json({ message: "Tous les champs sont requis !" });
        }

        const createdDate = createdAt ? new Date(createdAt) : new Date(); // ✅ Prend `createdAt` si fourni
        const deadline = calculateDeadline(priority, createdDate);
        const alertTime = calculateAlertTime(priority, createdDate); // ✅ Maintenant basé sur `createdAt`

        const newNotif = new Notif({
            ticketNumber,
            priority,
            createdAt: createdDate,
            deadline,
            alertTime,
            alertSent: false,
        });

        await newNotif.save();

        res.status(201).json({
            message: "Notification enregistrée avec succès !",
            deadline,
            alertTime,
            createdAt: newNotif.createdAt,
        });
    } catch (error) {
        console.error("❌ Erreur lors de l’enregistrement de la notification :", error);
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


exports.checkForAlerts = async (client) => {
    if (!client) {
        console.error("❌ Erreur : client Discord non défini !");
        return;
    }

    const now = new Date();
    const alerts = await Notif.find({ alertTime: { $lte: now }, alertSent: false });

    if (alerts.length > 0) {
        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Impossible de trouver le canal Discord !");
            return;
        }

        for (const notif of alerts) {
            const message = `Pourriez-vous prendre ce ticket ${notif.ticketNumber} ? C'est une priorité ${notif.priority} svp`;

            await channel.send(message);

            // ✅ Marquer comme envoyé pour éviter les doublons
            await Notif.updateOne({ _id: notif._id }, { $set: { alertSent: true } });

            console.log(`✅ Message Discord envoyé pour ${notif.ticketNumber}`);
        }
    }
};


exports.deleteNotif = async (req, res) => {
    try {
        const { id } = req.params;
        await Notif.findByIdAndDelete(id);
        res.status(200).json({ message: "Ticket supprimé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du ticket", error });
    }
};