const Ticket = require('../models/ticketModel');
const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils');
const moment = require("moment-timezone");
const { Client, GatewayIntentBits } = require("discord.js");
const { ticketClient, cleanMessagesWithoutTicket } = require("../Discord/ticketBot");


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
        if (adjustedDate.getHours() >= 18) {
            // Créé après 18h → passe au jour ouvré suivant à 9h
            adjustedDate = addBusinessDays(adjustedDate, 1);
            adjustedDate.setHours(9, 0, 0, 0);
        } else if (adjustedDate.getHours() < 9) {
            // Créé avant 9h → reste aujourd’hui, mais commence à 9h
            adjustedDate.setHours(9, 0, 0, 0);
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

const calculateAlertTime = (priority, lastUpdate) => {
    let adjustedDate = new Date(lastUpdate);

    if (priority === "4" || priority === "5") {
        if (adjustedDate.getHours() >= 18) {
            adjustedDate = addBusinessDays(adjustedDate, 1);
            adjustedDate.setHours(9, 0, 0, 0);
        } else if (adjustedDate.getHours() < 9) {
            adjustedDate.setHours(9, 0, 0, 0);
        }

        const deadline = calculateDeadline(priority, adjustedDate);
        return new Date(deadline.getTime() - 3 * 60 * 60 * 1000); // 3h avant
    }

    // 👇 Calcul spécifique pour P2 et P3 : à partir de la deadline !
    const deadline = calculateDeadline(priority, adjustedDate);

    switch (priority) {
        case "1":
            return addBusinessHours(adjustedDate, 10 / 3600); // 10s
        case "2":
            return new Date(deadline.getTime() - 1 * 60 * 60 * 1000); // 1h avant
        case "3":
            return new Date(deadline.getTime() - 1.5 * 60 * 60 * 1000); // 1h30 avant
        default:
            return adjustedDate;
    }
};


// ✅ Enregistre les tickets en supprimant les anciens avant
exports.saveExtractedTickets = async (req, res) => {
    try {
        console.log("📥 Tickets reçus pour enregistrement :", req.body);
        let tickets = req.body;

        if (!Array.isArray(tickets) || tickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket fourni." });
        }

        const importedTicketNumbers = tickets
            .filter(ticket => ticket.ticketNumber)
            .map(ticket => ticket.ticketNumber);

        await Ticket.deleteMany({
            ticketNumber: { $nin: importedTicketNumbers }
        });

        console.log("🧹 Tickets obsolètes supprimés !");

        const validTickets = tickets
            .filter(ticket => ticket.ticketNumber && ticket.priority && ticket.lastUpdate)
            .map(ticket => {
                const parsedLastUpdate = parseDate(ticket.lastUpdate);
                if (!parsedLastUpdate) {
                    return null;
                }

                const deadline = calculateDeadline(ticket.priority, parsedLastUpdate);
                const alertTime = calculateAlertTime(ticket.priority, parsedLastUpdate);
 
                return {
                    ...ticket,
                    createdAt: parsedLastUpdate,
                    lastUpdate: parsedLastUpdate,
                    deadline,
                    alertTime
                };
            })
            .filter(ticket => ticket !== null);

        if (validTickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket valide à enregistrer." });
        }

        for (const ticket of validTickets) {
            await Ticket.updateOne(
                { ticketNumber: ticket.ticketNumber },
                { $set: ticket },
                { upsert: true }
            );
        }
        await cleanMessagesWithoutTicket(ticketClient);
        res.status(201).json({ message: "Tickets enregistrés avec succès !" });

    } catch (error) {
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