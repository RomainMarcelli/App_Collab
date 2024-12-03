const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Importation des routes
const collaborateurRoutes = require('./routes/collabRoute');
const ticketRoutes = require('./routes/ticketRoute');
const closedRoutes = require('./routes/closedRoute');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/CDS', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connecté à MongoDB');
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
                url: 'http://localhost:3000/api',
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

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
    console.log(`Documentation Swagger : http://localhost:${PORT}/api-docs`);
});
