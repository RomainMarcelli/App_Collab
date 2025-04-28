/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: API pour la gestion des tickets
 */

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Récupérer tous les tickets
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Liste de tous les tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID unique du ticket
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
 */
router.get('/tickets', ticketController.getAllTickets);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Ajouter un nouveau ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroTicket
 *               - priorite
 *               - sujet
 *               - description
 *               - beneficiaire
 *             properties:
 *               numeroTicket:
 *                 type: string
 *                 description: Numéro unique du ticket
 *               priorite:
 *                 type: integer
 *                 description: Priorité du ticket
 *               sujet:
 *                 type: string
 *                 description: Sujet du ticket
 *               description:
 *                 type: string
 *                 description: Description détaillée
 *               beneficiaire:
 *                 type: string
 *                 description: Nom du bénéficiaire
 *     responses:
 *       201:
 *         description: Ticket ajouté avec succès
 *       400:
 *         description: Erreur de validation des données
 */
router.post('/tickets', ticketController.addTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Mettre à jour un ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du ticket à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sujet:
 *                 type: string
 *                 description: Sujet mis à jour
 *               description:
 *                 type: string
 *                 description: Description mise à jour
 *               priorite:
 *                 type: integer
 *                 description: Nouvelle priorité
 *     responses:
 *       200:
 *         description: Ticket mis à jour avec succès
 *       404:
 *         description: Ticket non trouvé
 */
router.put('/tickets/:id', ticketController.updateTicket);

/**
 * @swagger
 * /tickets/{ticketId}/close:
 *   post:
 *     summary: Fermer un ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         description: ID du ticket à fermer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket fermé avec succès
 *       404:
 *         description: Ticket non trouvé
 */
router.post('/tickets/:ticketId/close', ticketController.closeTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Supprimer un ticket
 *     tags: [Tickets]
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
 */
router.delete('/tickets/:id', ticketController.deleteTicket);

/**
 * @swagger
 * /tickets/{id}/affecter:
 *   put:
 *     summary: Affecter un collaborateur à un ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du ticket à affecter
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collaborateurId
 *             properties:
 *               collaborateurId:
 *                 type: string
 *                 description: ID du collaborateur
 *     responses:
 *       200:
 *         description: Collaborateur affecté avec succès
 *       404:
 *         description: Ticket ou collaborateur non trouvé
 */
router.put('/tickets/:id/affecter', ticketController.assignCollaborator);

/**
 * @swagger
 * /tickets/affectes/{collaborateurId}:
 *   get:
 *     summary: Récupérer les tickets affectés à un collaborateur
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: collaborateurId
 *         required: true
 *         description: ID du collaborateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des tickets affectés au collaborateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID unique du ticket
 *                   numeroTicket:
 *                     type: string
 *                     description: Numéro unique du ticket
 *                   priorite:
 *                     type: integer
 *                     description: Priorité du ticket
 *                   sujet:
 *                     type: string
 *                     description: Sujet du ticket
 *                   collaborateur:
 *                     type: string
 *                     description: ID du collaborateur
 */
router.get('/tickets/affectes/:collaborateurId', ticketController.getAssignedTickets);



router.put('/tickets/:id/update-timer', ticketController.updateTimer);

router.put('/tickets/:id/remove-timer', (req, res, next) => {
    console.log(`Requête reçue pour supprimer le timer du ticket : ${req.params.id}`);
    next(); // Passe au contrôleur
}, ticketController.removeTimer);



module.exports = router;
