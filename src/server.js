const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

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

// Modèle Mongoose pour les tickets
const ticketSchema = new mongoose.Schema({
    numeroTicket: { type: String, required: true },
    priorite: { type: Number, required: true },
    sujet: { type: String, required: true },
    description: { type: String, required: true },
    beneficiaire: { type: String, required: true },
    dateEmission: { type: Date, required: true },
});
  
const Ticket = mongoose.model('Ticket', ticketSchema);

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
            { new: true, runValidators: true } // Retourne le ticket mis à jour
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        res.json({ message: 'Ticket mis à jour avec succès', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du ticket', error });
    }
});

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



// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
