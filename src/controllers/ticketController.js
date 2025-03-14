const Ticket = require('../models/ticketModel');
const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils');
const moment = require("moment-timezone");

const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // ✅ Conversion du format "13/03/2025 17:00:00" en Date ISO
    const parsedDate = moment.tz(dateStr, "DD/MM/YYYY HH:mm:ss", "Europe/Paris");

    if (!parsedDate.isValid()) {
        console.error(`⚠️ Erreur : Format de date invalide reçu : ${dateStr}`);
        return null;
    }

    return parsedDate.toDate(); // ✅ Retourne un objet `Date`
};

const calculateDeadline = (priority, lastUpdate) => {
    const businessStartHour = 9;
    let adjustedDate = new Date(lastUpdate);

    if (priority === "4" || priority === "5") {
        if (adjustedDate.getHours() >= 18 || adjustedDate.getHours() < businessStartHour) {
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

const calculateAlertTime = (priority, lastUpdate) => {
    const businessStartHour = 9;
    let alertOffset;

    let adjustedDate = new Date(lastUpdate);
    if (priority === "4" || priority === "5") {
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
    return addBusinessHours(adjustedDate, alertOffset);
};

exports.saveExtractedTickets = async (req, res) => {
    try {
        console.log("📥 Tickets reçus pour enregistrement :", req.body);
        let tickets = req.body;

        if (!Array.isArray(tickets) || tickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket fourni." });
        }

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
                    createdAt: parsedLastUpdate, // ✅ Utilisation de lastUpdate comme createdAt
                    lastUpdate: parsedLastUpdate, // ✅ Assure que lastUpdate est bien stocké au bon format
                    deadline: calculateDeadline(ticket.priority, parsedLastUpdate),
                    alertTime: calculateAlertTime(ticket.priority, parsedLastUpdate)
                };
            })
            .filter(ticket => ticket !== null); // ✅ Élimine les tickets avec des dates invalides

        if (validTickets.length === 0) {
            return res.status(400).json({ message: "Aucun ticket valide à enregistrer." });
        }

        // ✅ Vérification : Exclure les tickets déjà existants
        const existingTickets = await Ticket.find({
            ticketNumber: { $in: validTickets.map(t => t.ticketNumber) }
        });

        const existingNumbers = new Set(existingTickets.map(t => t.ticketNumber));

        const newTickets = validTickets.filter(ticket => !existingNumbers.has(ticket.ticketNumber));

        if (newTickets.length === 0) {
            console.warn("⚠️ Aucun nouveau ticket à enregistrer, tous existent déjà.");
            return res.status(400).json({
                message: "Tous les tickets existent déjà.",
                existingTickets: [...existingNumbers]
            });
        }

        // ✅ Insertion uniquement des nouveaux tickets
        await Ticket.insertMany(newTickets);
        console.log("✅ Tickets enregistrés avec succès !");
        res.status(201).json({ message: "Tickets enregistrés avec succès !" });

    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des tickets :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
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


// 📌 Récupère tous les tickets enregistrés
exports.getExtractedTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des tickets", error });
    }
};


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


exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { createdAt } = req.body;

        if (!createdAt) {
            return res.status(400).json({ message: "La date de création est requise !" });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(id, { createdAt }, { new: true });

        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket non trouvé" });
        }

        res.status(200).json({ message: "Ticket mis à jour avec succès", updatedTicket });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du ticket :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
};
