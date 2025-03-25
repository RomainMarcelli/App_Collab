const express = require('express');
const router = express.Router();
const { getDeletedNotifs } = require('../controllers/notifController');

/**
 * @swagger
 * /deleted-notifs:
 *   get:
 *     summary: Récupère l'historique des tickets supprimés
 *     description: Retourne la liste des notifications qui ont été supprimées et archivées.
 *     responses:
 *       200:
 *         description: Liste des notifications supprimées
 *       500:
 *         description: Erreur serveur
 */
router.get('/deleted-notifs', getDeletedNotifs);

module.exports = router;
