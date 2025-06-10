const { Client } = require("discord.js");
const Notif = require('../models/notifModel');
const { sendDesktopNotification } = require('../utils/notification'); // ✅ Assure-toi d'importer la fonction
const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils');
const DeletedNotif = require('../models/deletedNotifModel'); // ✅ Import du modèle des tickets supprimés

// Fonction pour calculer la deadline en fonction de la priorité
const calculateDeadline = (priority, createdAt = null) => {
    const now = createdAt ? new Date(createdAt) : new Date();
    const businessStartHour = 9;

    if (priority === "4" || priority === "5") {
        let adjustedCreatedAt = new Date(createdAt);
        if (adjustedCreatedAt.getHours() >= 18 || adjustedCreatedAt.getHours() < businessStartHour) {
            // Avancer au jour ouvré suivant à 9h
            adjustedCreatedAt = addBusinessDays(adjustedCreatedAt, 1);
            adjustedCreatedAt.setHours(businessStartHour, 0, 0, 0);
        }

        return addBusinessDays(adjustedCreatedAt, priority === "4" ? 3 : 5);
    }

    switch (priority) {
        case "1": return addBusinessHours(now, 1); // au lieu de new Date(now.getTime() + ...)
        case "2": return addBusinessHours(now, 2);
        case "3": return addBusinessHours(now, 8);
        default: return now;
    }

};

const calculateAlertTime = (priority, createdAt) => {
    const businessStartHour = 9;
    let alertOffset;
    let useBusinessDays = false;

    if (priority === "4" || priority === "5") {
        let adjustedCreatedAt = new Date(createdAt);
        if (adjustedCreatedAt.getHours() >= 18 || adjustedCreatedAt.getHours() < businessStartHour) {
            // Avancer au jour ouvré suivant à 9h
            adjustedCreatedAt = addBusinessDays(adjustedCreatedAt, 1);
            adjustedCreatedAt.setHours(businessStartHour, 0, 0, 0);
        }
        return addBusinessDays(adjustedCreatedAt, priority === "4" ? 2 : 4);
    }

    switch (priority) {
        case "1": alertOffset = 10 / 60; break; // 10 minutes = 0.1667 h
        case "2": alertOffset = 15 / 60; break; // 15 minutes = 0.25 h
        case "3": alertOffset = 5; break;
        default: alertOffset = 0;
    }
    return addBusinessHours(new Date(createdAt), alertOffset);

    return addBusinessHours(new Date(createdAt), alertOffset);
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
            // ✅ Ajoute la notification locale avant Discord
            sendDesktopNotification(
                "⚠️ Alerte Ticket",
                `La deadline approche pour le ticket ${notif.ticketNumber} (Priorité ${notif.priority}).`
            );

            // ✅ Message Discord
            const message = `Pourriez-vous prendre ce ticket **${notif.ticketNumber}** ? C'est une priorité **${notif.priority}** svp`;
            await channel.send(message);

            // ✅ Marquer comme envoyé pour éviter les doublons
            await Notif.updateOne({ _id: notif._id }, { $set: { alertSent: true } });

            console.log(`✅ Notification envoyée pour ${notif.ticketNumber} (PC + Discord)`);
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

exports.updateNotifTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { newCreatedAt } = req.body;

        if (!newCreatedAt) {
            return res.status(400).json({ message: "La nouvelle heure est requise !" });
        }

        // ✅ Vérifie que le ticket existe
        const notif = await Notif.findById(id);
        if (!notif) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }

        // ✅ Récupérer la priorité existante
        const priority = notif.priority;

        // ✅ Met à jour `createdAt` et recalculer `deadline` et `alertTime`
        notif.createdAt = new Date(newCreatedAt);
        notif.deadline = calculateDeadline(priority, notif.createdAt);
        notif.alertTime = calculateAlertTime(priority, notif.createdAt);

        const updatedNotif = await notif.save(); // ✅ Sauvegarde dans MongoDB

        if (!updatedNotif) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour en base de données" });
        }

        res.status(200).json({
            message: "Notification mise à jour avec succès !",
            updatedNotif
        });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de l'heure du ticket :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
};


exports.deleteNotif = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Vérifie si le ticket existe avant suppression
        const notif = await Notif.findById(id);
        if (!notif) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }

        // ✅ Stocke le ticket dans la collection des tickets supprimés
        const deletedNotif = new DeletedNotif({
            ticketNumber: notif.ticketNumber,
            priority: notif.priority,
            createdAt: notif.createdAt,
            deadline: notif.deadline,
            alertTime: notif.alertTime,
            alertSent: notif.alertSent,
            deletedAt: new Date() // ✅ Ajoute la date de suppression
        });

        await deletedNotif.save(); // ✅ Sauvegarde le ticket supprimé
        await Notif.findByIdAndDelete(id); // ✅ Supprime le ticket de la collection principale

        res.status(200).json({ message: "Ticket supprimé et archivé avec succès !" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression du ticket :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
};

// ✅ Ajout d'une route pour récupérer les tickets supprimés
exports.getDeletedNotifs = async (req, res) => {
    try {
        const deletedNotifications = await DeletedNotif.find().sort({ deletedAt: -1 });
        res.status(200).json(deletedNotifications);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des notifications supprimées", error });
    }
};