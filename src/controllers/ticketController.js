// controllers/ticketController.js
const Ticket = require('../models/ticketModel'); // Assurez-vous d'importer le modèle Ticket
const ClosedTicket = require('../models/ClosedTicket'); // Modèle pour les tickets fermés

exports.getAllTickets = async (req, res) => {
    const { status } = req.query;

    try {
        const query = status ? { status } : {};
        const tickets = await Ticket.find(query);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Erreur lors de la récupération des tickets :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
    }
};

// const getTickets = async (req, res) => {
//     const { status } = req.query;

//     try {
//         const query = status ? { status } : {};
//         const tickets = await Ticket.find(query);
//         res.status(200).json(tickets);
//     } catch (error) {
//         console.error('Erreur lors de la récupération des tickets :', error);
//         res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
//     }
// };


// Ajouter un ticket
exports.addTicket = async (req, res) => {
    try {
        const { numeroTicket, priorite, sujet, beneficiaire, description, dateEmission } = req.body;

        console.log('Données reçues du frontend :', req.body); // Log des données reçues pour le débogage

        // Vérification des champs requis
        if (!numeroTicket || !priorite || !sujet || !beneficiaire || !description || !dateEmission) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        // Conversion sécurisée de la date
        const parsedDate = new Date(dateEmission); // Convertit la chaîne en objet Date
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: 'La date fournie est invalide.' });
        }

        // Création du ticket avec les données reçues
        const newTicket = new Ticket({
            numeroTicket,
            priorite,
            sujet,
            beneficiaire,
            description,
            dateEmission: parsedDate, // Stocke la date telle quelle (UTC si déjà convertie en amont)
        });

        // Sauvegarde dans la base de données
        await newTicket.save();

        // Retourne une réponse avec un message de succès et les données du ticket créé
        return res.status(201).json({
            message: 'Ticket ajouté avec succès',
            ticket: newTicket,
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du ticket:', error); // Log de l'erreur pour le serveur
        return res.status(500).json({ message: 'Erreur lors de l\'ajout du ticket', error });
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


exports.closeTicket = async (req, res) => {
    const { ticketId } = req.params;

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
            dateFermeture: new Date(),
        });

        // Sauvegarder le ticket fermé dans ClosedTicket
        await closedTicket.save();

        // Supprimer le ticket de la collection Ticket
        await Ticket.findByIdAndDelete(ticketId);

        return res.status(200).json({ message: 'Ticket fermé avec succès et déplacé dans la collection des tickets fermés' });
    } catch (error) {
        console.error('Erreur lors de la clôture du ticket:', error);
        return res.status(500).json({ message: 'Erreur lors de la clôture du ticket' });
    }
};


exports.updateTimer = async (req, res) => {
    try {
        const { additionalTime } = req.body; // Temps supplémentaire en millisecondes
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        // Ajoutez le temps supplémentaire
        ticket.timerRemaining = (ticket.timerRemaining || 0) + additionalTime;

        await ticket.save();

        res.status(200).json({ 
            message: 'Minuteur mis à jour avec succès', 
            timerRemaining: ticket.timerRemaining 
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du minuteur:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};


