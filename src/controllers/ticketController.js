// controllers/ticketController.js
const Ticket = require('../models/ticketModel'); // Assurez-vous d'importer le modèle Ticket

exports.affecterTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { collaborateurId } = req.body;

        // Mettre à jour le ticket avec l'ID du collaborateur et marquer comme affecté
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                collaborateur: collaborateurId,
                estAffecte: true // Marquer le ticket comme affecté
            },
            { new: true, runValidators: true } // Options pour retourner le document mis à jour
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        res.status(200).json({ message: 'Ticket affecté avec succès', ticket });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'affectation du ticket', error });
    }
};
