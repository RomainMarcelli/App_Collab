const express = require('express');
const ClosedTicket = require('../models/ClosedTicket'); // Assurez-vous que le chemin est correct

const router = express.Router();

// Route pour récupérer tous les tickets fermés
router.get('/closed-tickets', async (req, res) => {
    try {
        const closedTickets = await ClosedTicket.find();
        res.json(closedTickets);
    } catch (error) {
        console.error('Erreur lors de la récupération des tickets fermés:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets fermés', error });
    }
});

// Route pour récupérer un ticket fermé par son ID
router.get('/closed-tickets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const closedTicket = await ClosedTicket.findById(id);
        if (!closedTicket) {
            return res.status(404).json({ message: 'Ticket fermé non trouvé' });
        }
        res.json(closedTicket);
    } catch (error) {
        console.error('Erreur lors de la récupération du ticket fermé:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du ticket fermé', error });
    }
});

module.exports = router;
