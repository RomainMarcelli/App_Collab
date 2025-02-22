const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { sendDesktopNotification } = require('./utils/notification');
const { client } = require("./Discord/bot"); // ✅ Import du client Discord
const { checkForAlerts } = require('./controllers/notifController'); // ✅ Import de la vérification des alertes
const shinkenRoutes = require('./routes/shinkenRoute'); // ✅ Importe la route


// Importation des routes
const collaborateurRoutes = require('./routes/collabRoute');
const ticketRoutes = require('./routes/ticketRoute');
const closedRoutes = require('./routes/closedRoute');
const notifRoutes = require('./routes/notifRoute');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

process.env.TZ = "Europe/Paris"; // ✅ Force l'heure française pour tout le backend
console.log("🕒 Fuseau horaire du serveur :", process.env.TZ);


// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/CDS', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connecté à MongoDB');
    // 🔹 Vérifier les alertes immédiatement après la connexion
    setTimeout(() => {
        checkForAlerts(client);
    }, 5000); // ✅ Attendre 5 secondes pour s'assurer que le bot est bien connecté        
    // 🔹 Vérifier les alertes toutes les minutes
    // ✅ Vérification des alertes toutes les 15 minutes (900 000 ms)
    setInterval(() => {
        checkForAlerts(client);
    }, 900000);
}).catch((error) => {
    console.error('Erreur de connexion à MongoDB:', error);
});

// --- CONFIGURATION SWAGGER ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentation complète des endpoints de l\'API',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Serveur local',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Met à jour pour inclure le bon chemin
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- ROUTES API ---
app.use('/api', ticketRoutes); // Routes liées aux tickets
app.use('/api', collaborateurRoutes); // Routes liées aux collaborateurs
app.use('/api', closedRoutes); // Routes liées aux tickets fermés
app.use('/api', notifRoutes); // Nouvelle route pour les notifications
app.use('/api/shinken', shinkenRoutes); // ✅ Ajoute la route à l'API


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
    console.log(`Documentation Swagger : http://localhost:${PORT}/api-docs`);
});
