const express = require('express');
const Ticket = require('../models/ticketModel');
const ClosedTicket = require('../models/ClosedTicket');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

// Route pour récupérer tous les tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets', error });
    }
});

// Route pour ajouter un ticket
router.post('/tickets', async (req, res) => {
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
});

// Route pour mettre à jour un ticket
router.put('/tickets/:id', async (req, res) => {
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
});

// Route pour fermer un ticket
router.post('/tickets/:ticketId/close', async (req, res) => {
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
});

// Route pour supprimer un ticket
router.delete('/tickets/:id', async (req, res) => {
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
});


// Route pour affecter un collaborateur à un ticket
router.put('/tickets/:id/affecter', async (req, res) => {
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
});

// Route pour récupérer les tickets affectés à un collaborateur
router.get('/tickets/affectes/:collaborateurId', async (req, res) => {
    const { collaborateurId } = req.params;

    try {
        const tickets = await Ticket.find({ collaborateur: collaborateurId });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets affectés', error });
    }
});

module.exports = router;
