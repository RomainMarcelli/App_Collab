const ClosedTicket = require('../models/ClosedTicket'); // Assurez-vous que le chemin est correct
const Ticket = require('../models/ticketModel'); // Assurez-vous que le modèle Ticket est importé correctement


// Fonction pour récupérer tous les tickets fermés
const getAllClosedTickets = async (req, res) => {
    try {
        const closedTickets = await ClosedTicket.find();
        res.json(closedTickets);
    } catch (error) {
        console.error('Erreur lors de la récupération des tickets fermés:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets fermés' });
    }
};

// Fonction pour récupérer un ticket fermé par son ID
const getClosedTicketById = async (req, res) => {
    const { id } = req.params;
    try {
        const closedTicket = await ClosedTicket.findById(id);
        if (!closedTicket) {
            return res.status(404).json({ message: 'Ticket fermé non trouvé' });
        }
        res.json(closedTicket);
    } catch (error) {
        console.error('Erreur lors de la récupération du ticket fermé:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du ticket fermé' });
    }
};

// Fonction pour supprimer un ticket fermé
const deleteClosedTicket = async (req, res) => {
    const { id } = req.params;
    console.log('ID du ticket à supprimer:', id); // Ajout d'un log pour le débogage

    try {
        const closedTicket = await ClosedTicket.findByIdAndDelete(id);
        if (!closedTicket) {
            return res.status(404).json({ message: "Ticket fermé non trouvé" });
        }
        res.json({ message: "Ticket fermé supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du ticket fermé:', error);
        res.status(500).json({ message: "Erreur lors de la suppression du ticket fermé" });
    }
};

// Rouvrir un ticket fermé
const reopenTicket = async (req, res) => {
    const { id } = req.params; // Récupérer l'ID du ticket fermé
    console.log('Tentative de réouverture pour le ticket ID:', id); // Log pour débogage

    try {
        // Trouver le ticket fermé correspondant
        const closedTicket = await ClosedTicket.findById(id);
        console.log('Ticket fermé trouvé:', closedTicket); // Log pour vérifier les données trouvées

        if (!closedTicket) {
            return res.status(404).json({ message: 'Ticket fermé non trouvé' });
        }

        // Préparer les données pour réouvrir le ticket
        const reopenedTicketData = {
            numeroTicket: closedTicket.numeroTicket,
            priorite: closedTicket.priorite,
            sujet: closedTicket.sujet,
            description: closedTicket.description,
            beneficiaire: closedTicket.beneficiaire,
            dateEmission: closedTicket.dateEmission,
            collaborateur: null, // Collaborateur initialement non affecté
            estAffecte: false, // Indique que le ticket n'est pas affecté
        };

        // Utiliser try-catch pour gérer l'erreur MongoDB sur le doublon de `numeroTicket`
        try {
            const reopenedTicket = new Ticket(reopenedTicketData);
            await reopenedTicket.save(); // Sauvegarder dans la collection `Ticket`
            console.log('Ticket rouvert avec succès:', reopenedTicket);

            // Supprimer le ticket fermé de la collection `ClosedTicket`
            await ClosedTicket.findByIdAndDelete(id);

            res.status(200).json({ message: 'Ticket rouvert avec succès', ticket: reopenedTicket });
        } catch (error) {
            if (error.code === 11000) { // Code MongoDB pour erreur de doublon
                console.error('Erreur: Numéro de ticket déjà utilisé:', reopenedTicketData.numeroTicket);
                return res.status(400).json({ message: 'Numéro de ticket déjà utilisé' });
            }
            throw error; // Lancer l'erreur si ce n'est pas un problème de doublon
        }
    } catch (error) {
        console.error('Erreur lors de la réouverture du ticket fermé:', error);
        res.status(500).json({ message: 'Erreur lors de la réouverture du ticket fermé' });
    }
};



// Exportation des fonctions du contrôleur pour pouvoir les utiliser dans les routes
module.exports = {
    getAllClosedTickets,
    getClosedTicketById,
    deleteClosedTicket,
    reopenTicket,
};
