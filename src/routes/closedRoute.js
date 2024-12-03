/**
 * @swagger
 * tags:
 *   name: TicketsFermes
 *   description: API pour la gestion des tickets fermés
 */

const express = require('express');
const {
    getAllClosedTickets,
    getClosedTicketById,
    deleteClosedTicket,
    reopenTicket,
} = require('../controllers/ClosedController'); // Assurez-vous que le chemin est correct
const router = express.Router();

/**
 * @swagger
 * /closed-tickets:
 *   get:
 *     summary: Récupérer tous les tickets fermés
 *     tags: [TicketsFermes]
 *     responses:
 *       200:
 *         description: Liste de tous les tickets fermés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID unique du ticket fermé
 *                   numeroTicket:
 *                     type: string
 *                     description: Numéro unique du ticket
 *                   priorite:
 *                     type: integer
 *                     description: Priorité du ticket
 *                   sujet:
 *                     type: string
 *                     description: Sujet du ticket
 *                   description:
 *                     type: string
 *                     description: Description détaillée
 *                   beneficiaire:
 *                     type: string
 *                     description: Nom du bénéficiaire
 *                   dateEmission:
 *                     type: string
 *                     format: date-time
 *                     description: Date d'émission du ticket
 *                   dateFermeture:
 *                     type: string
 *                     format: date-time
 *                     description: Date de fermeture du ticket
 */
router.get('/closed-tickets', getAllClosedTickets);

/**
 * @swagger
 * /closed-tickets/{id}/reopen:
 *   post:
 *     summary: Rouvrir un ticket fermé
 *     tags: [TicketsFermes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du ticket fermé à rouvrir
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket rouvert avec succès
 *       404:
 *         description: Ticket fermé non trouvé
 */
router.post('/closed-tickets/:id/reopen', reopenTicket);

/**
 * @swagger
 * /closed-tickets/{id}:
 *   get:
 *     summary: Récupérer un ticket fermé par ID
 *     tags: [TicketsFermes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du ticket fermé à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du ticket fermé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID unique du ticket fermé
 *                 numeroTicket:
 *                   type: string
 *                   description: Numéro unique du ticket
 *                 priorite:
 *                   type: integer
 *                   description: Priorité du ticket
 *                 sujet:
 *                   type: string
 *                   description: Sujet du ticket
 *                 description:
 *                   type: string
 *                   description: Description détaillée
 *                 beneficiaire:
 *                   type: string
 *                   description: Nom du bénéficiaire
 *                 dateEmission:
 *                   type: string
 *                   format: date-time
 *                   description: Date d'émission du ticket
 *                 dateFermeture:
 *                   type: string
 *                   format: date-time
 *                   description: Date de fermeture du ticket
 *       404:
 *         description: Ticket fermé non trouvé
 */
router.get('/closed-tickets/:id', getClosedTicketById);

/**
 * @swagger
 * /closed-tickets/{id}:
 *   delete:
 *     summary: Supprimer un ticket fermé
 *     tags: [TicketsFermes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du ticket fermé à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket fermé supprimé avec succès
 *       404:
 *         description: Ticket fermé non trouvé
 */
router.delete('/closed-tickets/:id', deleteClosedTicket);

module.exports = router;
