// routes/collaborateurRoutes.js

const express = require('express');
const router = express.Router();
const collaborateurController = require('../controllers/collabController');
const ticketController = require('../controllers/ticketController'); // Assurez-vous d'importer le contrôleur de tickets

// Route pour récupérer tous les collaborateurs
router.get('/collaborateurs', collaborateurController.getAllCollaborateurs);

// Route pour ajouter un collaborateur
router.post('/collaborateurs', collaborateurController.addCollaborateur);

// Route pour mettre à jour un collaborateur
router.put('/collaborateurs/:id', collaborateurController.updateCollaborateur);

// Route pour supprimer un collaborateur
router.delete('/collaborateurs/:id', collaborateurController.deleteCollaborateur);

// Route pour affecter un ticket à un collaborateur
router.put('/tickets/:ticketId/affecter', ticketController.affecterTicket); // Nouvelle route pour affecter un ticket

module.exports = router;
