require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose"); // ✅ Import de mongoose
const { checkForAlerts } = require("../controllers/notifController"); // ✅ Import des alertes

// ✅ Création du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ✅ Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connecté à MongoDB");
}).catch(err => console.error("❌ Erreur MongoDB :", err));

// ✅ Vérification de la connexion du bot
client.once("ready", () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if (!channel) {
        console.error("❌ Impossible de trouver le canal Discord ! Vérifie l'ID.");
    } else {
        channel.send("✅ Bot en ligne et prêt à envoyer des alertes !");
    }

    console.log("🚀 Vérification des alertes activée !");
    setInterval(async () => {
        await checkForAlerts(client);
    }, 10 * 1000); // ✅ Vérifie les alertes toutes les 10 secondes
});

// ✅ Connexion du bot avec le token
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ Erreur de connexion au bot Discord :", err);
});


module.exports = { client }; // ✅ Export du client pour pouvoir l'utiliser dans d'autres fichiers
