// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Route pour récupérer tous les tickets
router.get('/tickets', ticketController.getAllTickets);

// Route pour ajouter un ticket
router.post('/tickets', ticketController.addTicket);

// Route pour mettre à jour un ticket
router.put('/tickets/:id', ticketController.updateTicket);

// Route pour fermer un ticket
router.post('/tickets/:ticketId/close', ticketController.closeTicket);

// Route pour supprimer un ticket
router.delete('/tickets/:id', ticketController.deleteTicket);

// Route pour affecter un collaborateur à un ticket
router.put('/tickets/:id/affecter', ticketController.assignCollaborator);

// Route pour récupérer les tickets affectés à un collaborateur
router.get('/tickets/affectes/:collaborateurId', ticketController.getAssignedTickets);

module.exports = router;
