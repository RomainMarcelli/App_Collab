const express = require('express');
const {
    getAllClosedTickets,
    getClosedTicketById,
    deleteClosedTicket,
    reopenTicket,
} = require('../controllers/ClosedController'); // Assurez-vous que le chemin est correct
const router = express.Router();

// Route pour récupérer tous les tickets fermés
router.get('/closed-tickets', getAllClosedTickets);

router.post('/closed-tickets/:id/reopen', reopenTicket);

// Route pour récupérer un ticket fermé par son ID
router.get('/closed-tickets/:id', getClosedTicketById);

// Route pour supprimer un ticket fermé
router.delete('/closed-tickets/:id', deleteClosedTicket);

// Exportation des routes
module.exports = router;
