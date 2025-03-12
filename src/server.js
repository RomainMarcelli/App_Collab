const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { client } = require("./Discord/bot"); // ✅ Import du client Discord
const { checkForAlerts } = require('./controllers/notifController'); // ✅ Import de la vérification des alertes
const shinkenRoutes = require('./routes/shinkenRoute'); // ✅ Route Shinken
const notifRoutes = require('./routes/notifRoute');

const app = express();
const PORT = 5000;

// ✅ Configuration du fuseau horaire
process.env.TZ = "Europe/Paris"; 
console.log("🕒 Fuseau horaire du serveur :", process.env.TZ);

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/CDS', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {


    // 🔹 Vérification immédiate après connexion
    setTimeout(() => {
        checkForAlerts(client);
    }, 5000); 

    // 🔹 Vérification des alertes toutes les 15 minutes
    setInterval(() => {
        checkForAlerts(client);
    }, 900000);
}).catch((error) => {
    console.error('❌ Erreur de connexion à MongoDB:', error);
});

// ✅ Configuration de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Notifications',
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
    apis: ['./src/routes/notifRoute.js'], // ✅ Corrige le chemin des routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log(`📄 Documentation Swagger disponible sur : http://localhost:${PORT}/api-docs`);

// ✅ Déclaration des routes API
app.use('/api', notifRoutes);
app.use('/api/shinken', shinkenRoutes);

// ✅ Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: "❌ Route introuvable !" });
});

// ✅ Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ message: "❌ Erreur interne du serveur", error: err.message });
});

// ✅ Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
