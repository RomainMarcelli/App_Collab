const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const collaborateurRoutes = require('./routes/collabRoute'); // Si les routes sont dans un fichier séparé
const Collaborateur = require('./models/collabModel'); // Importer le modèle ici
const Ticket = require('./models/ticketModel'); // Importer le modèle ici

// Initialiser l'application Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Pour permettre les requêtes cross-origin
app.use(bodyParser.json()); // Pour parser le JSON dans les requêtes

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/CDS', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connecté à MongoDB');
}).catch((error) => {
    console.error('Erreur de connexion à MongoDB:', error);
});

// Route pour récupérer les tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets', error });
    }
});

// Route pour ajouter un ticket
app.post('/api/tickets', async (req, res) => {
    const { numeroTicket, priorite, sujet, beneficiaire, description } = req.body;

    if (!numeroTicket || !priorite || !sujet || !beneficiaire || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    try {
        const newTicket = new Ticket({
            numeroTicket,
            priorite,
            sujet,
            beneficiaire,
            description,
            dateEmission: new Date(),
        });

        await newTicket.save();
        res.status(201).json({ message: 'Ticket ajouté avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du ticket', error });
    }
});

// Route pour mettre à jour un ticket
app.put('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    const { numeroTicket, priorite, sujet, beneficiaire, description } = req.body;

    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            { numeroTicket, priorite, sujet, beneficiaire, description },
            { new: true, runValidators: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        res.json({ message: 'Ticket mis à jour avec succès', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du ticket', error });
    }
});

// Route pour supprimer un ticket
app.delete('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const ticket = await Ticket.findByIdAndDelete(id);
        if (!ticket) {
            return res.status(404).send({ message: "Ticket non trouvé" });
        }
        res.send({ message: "Ticket supprimé avec succès" });
    } catch (error) {
        res.status(500).send({ message: "Erreur lors de la suppression du ticket" });
    }
});

// --- ROUTES API COLLABORATEURS ---

// Route pour récupérer les collaborateurs
app.get('/api/collaborateurs', async (req, res) => {
    try {
        const collaborateurs = await Collaborateur.find();
        res.json(collaborateurs);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des collaborateurs', error });
    }
});

// Route pour ajouter un collaborateur
app.post('/api/collaborateurs', async (req, res) => {
    const { nom, client } = req.body;

    if (!nom || !client) {
        return res.status(400).json({ message: 'Le nom et le client sont requis' });
    }

    try {
        const newCollaborateur = new Collaborateur({ nom, client });
        await newCollaborateur.save();
        res.status(201).json({ message: 'Collaborateur ajouté avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du collaborateur', error });
    }
});

// Route pour affecter un collaborateur à un ticket
app.put('/api/tickets/:id/affecter', async (req, res) => {
    const { id } = req.params;
    const { collaborateurId } = req.body;

    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            { 
                collaborateur: collaborateurId, // Associer le collaborateur
                estAffecte: true // Marquer le ticket comme affecté
            },
            { new: true, runValidators: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        res.json({ message: 'Ticket affecté avec succès', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'affectation du ticket', error });
    }
});

// Route pour récupérer les tickets affectés à un collaborateur
app.get('/api/tickets/affectes/:collaborateurId', async (req, res) => {
    const { collaborateurId } = req.params;

    try {
        const tickets = await Ticket.find({ collaborateur: collaborateurId });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tickets affectés', error });
    }
});


// Utilisation des routes des collaborateurs
app.use('/api', collaborateurRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
