/**
 * @swagger
 * tags:
 *   name: Collaborateurs
 *   description: API pour la gestion des collaborateurs
 */

const express = require('express');
const router = express.Router();
const collaborateurController = require('../controllers/collabController');
const ticketController = require('../controllers/ticketController'); // Assurez-vous d'importer le contrôleur de tickets

/**
 * @swagger
 * /collaborateurs:
 *   get:
 *     summary: Récupérer tous les collaborateurs
 *     tags: [Collaborateurs]
 *     responses:
 *       200:
 *         description: Liste de tous les collaborateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID unique du collaborateur
 *                   nom:
 *                     type: string
 *                     description: Nom du collaborateur
 *                   email:
 *                     type: string
 *                     description: Adresse email du collaborateur
 */
router.get('/collaborateurs', collaborateurController.getAllCollaborateurs);

/**
 * @swagger
 * /collaborateurs:
 *   post:
 *     summary: Ajouter un nouveau collaborateur
 *     tags: [Collaborateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du collaborateur
 *               email:
 *                 type: string
 *                 description: Adresse email du collaborateur
 *     responses:
 *       201:
 *         description: Collaborateur ajouté avec succès
 *       400:
 *         description: Erreur de validation des données
 */
router.post('/collaborateurs', collaborateurController.addCollaborateur);

/**
 * @swagger
 * /collaborateurs/{id}:
 *   put:
 *     summary: Mettre à jour un collaborateur
 *     tags: [Collaborateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du collaborateur à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du collaborateur
 *               email:
 *                 type: string
 *                 description: Adresse email du collaborateur
 *     responses:
 *       200:
 *         description: Collaborateur mis à jour avec succès
 *       404:
 *         description: Collaborateur non trouvé
 */
router.put('/collaborateurs/:id', collaborateurController.updateCollaborateur);

/**
 * @swagger
 * /collaborateurs/{id}:
 *   delete:
 *     summary: Supprimer un collaborateur
 *     tags: [Collaborateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du collaborateur à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaborateur supprimé avec succès
 *       404:
 *         description: Collaborateur non trouvé
 */
router.delete('/collaborateurs/:id', collaborateurController.deleteCollaborateur);

/**
 * @swagger
 * /tickets/{ticketId}/affecter:
 *   put:
 *     summary: Affecter un ticket à un collaborateur
 *     tags: [Collaborateurs, Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
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
 *                 description: ID du collaborateur à affecter
 *     responses:
 *       200:
 *         description: Ticket affecté avec succès
 *       404:
 *         description: Ticket ou collaborateur non trouvé
 */
router.put('/tickets/:ticketId/affecter', ticketController.affecterTicket);

module.exports = router;
