// controllers/ticketController.js
const Ticket = require('../models/ticketModel'); // Assurez-vous d'importer le modèle Ticket
const ClosedTicket = require('../models/ClosedTicket'); // Modèle pour les tickets fermés


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


// Contrôleur pour fermer un ticket
exports.closeTicket = async (req, res) => {
    const { ticketId } = req.params; // Récupération de l'ID du ticket depuis les paramètres

    try {
        // Trouver le ticket à fermer
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        // Créer un nouvel enregistrement dans ClosedTicket
        const closedTicket = new ClosedTicket({
            numeroTicket: ticket.numeroTicket,
            priorite: ticket.priorite,
            sujet: ticket.sujet,
            description: ticket.description,
            beneficiaire: ticket.beneficiaire,
            dateEmission: ticket.dateEmission,
            dateFermeture: new Date(), // Ajoute la date de fermeture
        });

        // Sauvegarder le ticket fermé dans ClosedTicket
        await closedTicket.save();

        // Marquer le ticket comme fermé
        ticket.status = 'closed';
        await ticket.save();

        return res.status(200).json({ message: 'Ticket fermé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la clôture du ticket:', error);
        return res.status(500).json({ message: 'Erreur lors de la clôture du ticket' });
    }
};