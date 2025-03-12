const express = require('express');
const router = express.Router();
const { 
    createNotifFromRequest, 
    getAllNotifs, 
    getUpcomingNotifications, 
    deleteNotif, 
    updateNotifTime 
} = require('../controllers/notifController');

/**
 * @swagger
 * /notif:
 *   post:
 *     summary: Crée une nouvelle notification
 *     description: Ajoute une notification en base de données avec un numéro de ticket, une priorité et une date.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketNumber:
 *                 type: string
 *                 example: "TICKET123"
 *               priority:
 *                 type: string
 *                 example: "3"
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-28T12:00:00Z"
 *     responses:
 *       201:
 *         description: Notification créée avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/notif', createNotifFromRequest);

/**
 * @swagger
 * /notif:
 *   get:
 *     summary: Récupère toutes les notifications
 *     description: Retourne une liste de toutes les notifications stockées dans la base de données.
 *     responses:
 *       200:
 *         description: Liste des notifications
 *       500:
 *         description: Erreur serveur
 */
router.get('/notif', getAllNotifs);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupère les notifications à venir
 *     description: Retourne les notifications dont l'alerte est prévue dans le futur.
 *     responses:
 *       200:
 *         description: Liste des notifications à venir
 *       500:
 *         description: Erreur serveur
 */
router.get('/notifications', getUpcomingNotifications);

/**
 * @swagger
 * /notif/{id}:
 *   delete:
 *     summary: Supprime une notification
 *     description: Supprime une notification à partir de son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notification à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/notif/:id', deleteNotif);

/**
 * @swagger
 * /notif/{id}:
 *   put:
 *     summary: Met à jour la date de création d'une notification
 *     description: Met à jour la date de création d'une notification et recalcule les délais.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notification à modifier
 *         schema:
 *           type: string
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
 *                 example: "2025-03-01T10:30:00Z"
 *     responses:
 *       200:
 *         description: Notification mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/notif/:id', updateNotifTime);


module.exports = router;
