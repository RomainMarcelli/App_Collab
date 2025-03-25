const Ticket = require('../models/ticketModel');
const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils');
const moment = require("moment-timezone");
const { Client, GatewayIntentBits } = require("discord.js");


// ✅ Fonction pour parser une date au format "13/03/2025 17:00:00" en Date ISO
const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const parsedDate = moment.tz(dateStr, "DD/MM/YYYY HH:mm:ss", "Europe/Paris");

    if (!parsedDate.isValid()) {
        console.error(`⚠️ Erreur : Format de date invalide reçu : ${dateStr}`);
        return null;
    }

    return parsedDate.toDate();
};

// ✅ Calcul de la deadline en fonction de la priorité
const calculateDeadline = (priority, lastUpdate) => {
    const businessStartHour = 9;
    let adjustedDate = new Date(lastUpdate);

    if (priority === "4" || priority === "5") {
        if (adjustedDate.getHours() >= 18 || adjustedDate.getHours() < businessStartHour) {
            // Avancer au jour ouvré suivant à 9h
            adjustedDate = addBusinessDays(adjustedDate, 1);
            adjustedDate.setHours(businessStartHour, 0, 0, 0);
        }        
        return addBusinessDays(adjustedDate, priority === "4" ? 3 : 5);
    }

    switch (priority) {
        case "1": return new Date(adjustedDate.getTime() + 1 * 60 * 60 * 1000);
        case "2": return new Date(adjustedDate.getTime() + 2 * 60 * 60 * 1000);
        case "3": return addBusinessHours(adjustedDate, 8);
        default: return adjustedDate;
    }
};

// ✅ Calcul de l'alerte en fonction de la priorité
const calculateAlertTime = (priority, lastUpdate) => {
    const businessStartHour = 9;
    let alertOffset;
    let adjustedDate = new Date(lastUpdate);

    if (priority === "4" || priority === "5") {
        if (adjustedDate.getHours() >= 18 || adjustedDate.getHours() < businessStartHour) {
            // Avancer au jour ouvré suivant à 9h
            adjustedDate = addBusinessDays(adjustedDate, 1);
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
    return addBusinessHours(adjustedDate, alertOffset);
};

// ✅ Enregistre les tickets en supprimant les anciens avant
exports.saveExtractedTickets = async (req, res) => {
    try {
        console.log("📥 Tickets reçus pour enregistrement :", req.body);
        let tickets = req.body;

        if (!Array.isArray(tickets) || tickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket fourni." });
        }

        // 🔥 Supprime tous les anciens tickets avant d'insérer les nouveaux
        await Ticket.deleteMany({});
        console.log("🗑️ Anciennes données supprimées !");

        // ✅ Transformation et conversion des dates
        const validTickets = tickets
            .filter(ticket => ticket.ticketNumber && ticket.priority && ticket.lastUpdate)
            .map(ticket => {
                const parsedLastUpdate = parseDate(ticket.lastUpdate);
                if (!parsedLastUpdate) {
                    console.warn(`⚠️ Ticket ignoré : Date invalide pour ${ticket.ticketNumber}`);
                    return null;
                }

                return {
                    ...ticket,
                    createdAt: parsedLastUpdate,
                    lastUpdate: parsedLastUpdate,
                    deadline: calculateDeadline(ticket.priority, parsedLastUpdate),
                    alertTime: calculateAlertTime(ticket.priority, parsedLastUpdate)
                };
            })
            .filter(ticket => ticket !== null);

        if (validTickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket valide à enregistrer." });
        }

        // ✅ Insertion des nouveaux tickets
        await Ticket.insertMany(validTickets);
        // console.log("✅ Tickets enregistrés avec succès !");
        res.status(201).json({ message: "Tickets enregistrés avec succès !" });

    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des tickets :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 📌 Récupère tous les tickets enregistrés, triés par alerte time croissant
exports.getExtractedTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ alertTime: 1 }); // 🔥 Trie par alerte la plus proche
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des tickets", error });
    }
};

// 📌 Supprime un ticket par ID
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTicket = await Ticket.findByIdAndDelete(id);

        if (!deletedTicket) {
            return res.status(404).json({ message: "Ticket non trouvé" });
        }

        res.status(200).json({ message: "Ticket supprimé avec succès !" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression du ticket :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
};

// 📌 Met à jour un ticket et recalcule la deadline et l'alerte
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { createdAt } = req.body;

        if (!createdAt) {
            return res.status(400).json({ message: "La date de création est requise !" });
        }

        const parsedCreatedAt = parseDate(createdAt);
        if (!parsedCreatedAt) {
            return res.status(400).json({ message: "Format de date invalide !" });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket non trouvé" });
        }

        // ✅ Mise à jour de la date, deadline et alerte
        ticket.createdAt = parsedCreatedAt;
        ticket.deadline = calculateDeadline(ticket.priority, parsedCreatedAt);
        ticket.alertTime = calculateAlertTime(ticket.priority, parsedCreatedAt);

        const updatedTicket = await ticket.save();

        res.status(200).json({ message: "Ticket mis à jour avec succès", updatedTicket });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du ticket :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
};


exports.checkForAlerts = async (client) => {
    // console.log("Vérification des alertes en cours...");

    try {
        const now = new Date();

        // 🔎 Récupère les tickets dont l'alertTime est dépassé et qui n'ont pas encore été signalés
        const alertTickets = await Ticket.find({
            alertTime: { $lte: now },
            alertSent: false
        }).sort({ alertTime: 1 });

        if (alertTickets.length === 0) {
            // console.log("✅ Aucune alerte à envoyer.");
            return;
        }

        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Impossible de trouver le canal Discord ! Vérifie l'ID.");
            return;
        }

        for (const ticket of alertTickets) {
            // console.log(`⚠️ Envoi d'une alerte pour le ticket ${ticket.ticketNumber}...`);

            // 🔥 Message personnalisé
            const alertMessage = `Pouvez-vous traiter le ticket **"${ticket.ticketNumber}"** svp ? C'est une **P${ticket.priority}**`;

            await channel.send(alertMessage);

            // ✅ Marque le ticket comme alerté
            await Ticket.updateOne({ _id: ticket._id }, { alertSent: true });

            // console.log(`✅ Alerte envoyée pour le ticket ${ticket.ticketNumber}`);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la vérification des alertes :", error);
    }
};