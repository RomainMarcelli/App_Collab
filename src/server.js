const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const collaborateurRoutes = require('./routes/collabRoute'); // Si les routes sont dans un fichier séparé
const Collaborateur = require('./models/collabModel'); // Importer le modèle ici
const Ticket = require('./models/ticketModel'); // Importer le modèle ici
const TicketRoute = require('./routes/ticketRoute');
const ClosedTicket = require('./models/ClosedTicket'); // Importez votre modèle de ticket fermé
const closedTicketRoutes = require('./routes/closedRoute'); // Ajoute cette ligne en haut


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

// --- ROUTES API TICKETS ---

// Route pour récupérer les tickets

// Utilisation des routes des collaborateurs
app.use('/api', TicketRoute);
app.use('/api', collaborateurRoutes);
app.use('/api', closedTicketRoutes); // Ajoute cette ligne avant de démarrer le serveur

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
