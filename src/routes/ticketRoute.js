const express = require('express');
const router = express.Router();
const { saveExtractedTickets, getExtractedTickets } = require('../controllers/ticketController');

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Enregistre les tickets extraits depuis EasyVista
 *     description: Reçoit une liste de tickets et les stocke dans MongoDB.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 ticketNumber:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 lastUpdate:
 *                   type: string
 *                   format: date-time
 *     responses:
 *       201:
 *         description: Tickets enregistrés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/tickets', saveExtractedTickets);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Récupère tous les tickets extraits
 *     description: Retourne une liste de tickets enregistrés en base de données.
 *     responses:
 *       200:
 *         description: Liste des tickets
 *       500:
 *         description: Erreur serveur
 */
router.get('/tickets', getExtractedTickets);

module.exports = router;