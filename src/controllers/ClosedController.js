const ClosedTicket = require('../models/ClosedTicket'); // Assurez-vous que le chemin est correct

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

// Exportation des fonctions du contrôleur pour pouvoir les utiliser dans les routes
module.exports = {
    getAllClosedTickets,
    getClosedTicketById,
    deleteClosedTicket,
};
