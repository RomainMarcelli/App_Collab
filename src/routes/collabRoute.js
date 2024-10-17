// routes/collaborateurRoutes.js

const express = require('express');
const router = express.Router();
const collaborateurController = require('../controllers/collabController');

// Route pour récupérer tous les collaborateurs
router.get('/collaborateurs', collaborateurController.getAllCollaborateurs);

// Route pour ajouter un collaborateur
router.post('/collaborateurs', collaborateurController.addCollaborateur);

// Route pour mettre à jour un collaborateur
router.put('/collaborateurs/:id', collaborateurController.updateCollaborateur);

// Route pour supprimer un collaborateur
router.delete('/collaborateurs/:id', collaborateurController.deleteCollaborateur);

module.exports = router;
