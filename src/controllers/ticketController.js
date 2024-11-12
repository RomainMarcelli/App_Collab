// controllers/ticketController.js
const Ticket = require('../models/ticketModel'); // Assurez-vous d'importer le modèle Ticket
const ClosedTicket = require('../models/ClosedTicket'); // Modèle pour les tickets fermés

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets', error });
    }
};

// Ajouter un ticket
exports.addTicket = async (req, res) => {
    const { numeroTicket, priorite, sujet, beneficiaire, description } = req.body;

    if (!numeroTicket || !priorite || !sujet || !beneficiaire || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    try {
        const newTicket = new Ticket({
            numeroTicket,
            priorite,
            sujet,
            beneficiaire,
            description,
            dateEmission: new Date(),
        });

        await newTicket.save();
        res.status(201).json({ message: 'Ticket ajouté avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du ticket', error });
    }
};

// Mettre à jour un ticket
exports.updateTicket = async (req, res) => {
    const { id } = req.params;
    const { numeroTicket, priorite, sujet, beneficiaire, description } = req.body;

    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            { numeroTicket, priorite, sujet, beneficiaire, description },
            { new: true, runValidators: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        res.json({ message: 'Ticket mis à jour avec succès', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du ticket', error });
    }
};

// Fermer un ticket
exports.closeTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).send('Ticket non trouvé');
        }

        const closedTicket = new ClosedTicket({
            numeroTicket: ticket.numeroTicket,
            priorite: ticket.priorite,
            sujet: ticket.sujet,
            description: ticket.description,
            beneficiaire: ticket.beneficiaire,
            dateEmission: ticket.dateEmission,
        });

        await closedTicket.save();
        await Ticket.findByIdAndDelete(req.params.ticketId);

        res.json({ message: 'Ticket fermé avec succès et déplacé dans la collection des tickets fermés' });
    } catch (error) {
        console.error('Erreur lors de la clôture du ticket:', error);
        res.status(500).send('Erreur lors de la clôture du ticket');
    }
};

// Supprimer un ticket
exports.deleteTicket = async (req, res) => {
    const { id } = req.params;
    try {
        const ticket = await Ticket.findByIdAndDelete(id);
        if (!ticket) {
            return res.status(404).send({ message: "Ticket non trouvé" });
        }
        res.send({ message: "Ticket supprimé avec succès" });
    } catch (error) {
        res.status(500).send({ message: "Erreur lors de la suppression du ticket" });
    }
};

// Affecter un collaborateur à un ticket
exports.assignCollaborator = async (req, res) => {
    const { id } = req.params;
    const { collaborateurId } = req.body;

    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            { 
                collaborateur: collaborateurId,
                estAffecte: true
            },
            { new: true, runValidators: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        res.json({ message: 'Ticket affecté avec succès', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'affectation du ticket', error });
    }
};

// Récupérer les tickets affectés à un collaborateur
exports.getAssignedTickets = async (req, res) => {
    const { collaborateurId } = req.params;

    try {
        const tickets = await Ticket.find({ collaborateur: collaborateurId });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets affectés', error });
    }
};



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