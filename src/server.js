const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importation des routes et modèles
const collaborateurRoutes = require('./routes/collabRoute');
const ticketRoutes = require('./routes/ticketRoute');
const closedRoutes = require('./routes/closedRoute'); // Chemin vers les routes des tickets fermés

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

// --- ROUTES API ---
app.use('/api', ticketRoutes); // Toutes les routes liées aux tickets sous /api/tickets
app.use('/api', collaborateurRoutes); // Toutes les routes liées aux collaborateurs sous /api/collaborateurs
app.use('/api', closedRoutes); // Routes des tickets fermés sous /api/closed-tickets

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
