const express = require('express');
const router = express.Router();
const { handleShinken } = require('../controllers/shinkenController'); // ✅ Créé un contrôleur

// 📌 Endpoint pour envoyer un message Shinken sur Discord
router.post('/', handleShinken);

module.exports = router;
