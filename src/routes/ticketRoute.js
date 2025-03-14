const express = require('express');
const router = express.Router();
const { 
    saveExtractedTickets, 
    getExtractedTickets, 
    deleteTicket, 
    updateTicket 
} = require('../controllers/ticketController');

const { checkForAlerts } = require("../controllers/notifController"); // ✅ Import du contrôleur des alertes


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
 *                   example: "S250313_053"
 *                 priority:
 *                   type: string
 *                   example: "4"
 *                 lastUpdate:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-13T16:00:00.000Z"
 *     responses:
 *       201:
 *         description: Tickets enregistrés avec succès
 *       400:
 *         description: Données invalides ou tickets déjà existants
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

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Supprime un ticket spécifique
 *     description: Supprime un ticket en fonction de son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du ticket à supprimer
 *     responses:
 *       200:
 *         description: Ticket supprimé avec succès
 *       404:
 *         description: Ticket non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/tickets/:id', deleteTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Met à jour la date de création d'un ticket
 *     description: Met à jour la date de création et recalcule les délais et alertes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du ticket à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newCreatedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-03-14T10:30:00Z"
 *     responses:
 *       200:
 *         description: Ticket mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Ticket non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/tickets/:id', updateTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Supprime un ticket
 *     description: Supprime un ticket à partir de son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du ticket à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket supprimé avec succès
 *       404:
 *         description: Ticket non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/tickets/:id', deleteTicket);

router.get("/check-alerts", async (req, res) => {
    try {
        await checkForAlerts(req.app.locals.client); // ✅ Vérifie les alertes et envoie sur Discord
        res.status(200).json({ message: "Vérification des alertes effectuée." });
    } catch (error) {
        console.error("❌ Erreur lors de la vérification des alertes :", error);
        res.status(500).json({ message: "Erreur lors de la vérification des alertes." });
    }
});

module.exports = router;
