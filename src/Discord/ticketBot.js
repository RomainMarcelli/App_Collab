require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel"); 

// ✅ Création du client Discord
const ticketClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// ✅ Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ TicketBot connecté à MongoDB");
}).catch(err => console.error("❌ Erreur MongoDB :", err));

// ✅ Vérification de la connexion du bot
ticketClient.once("ready", () => {
    console.log(`✅ TicketBot connecté en tant que ${ticketClient.user.tag}`);

    // 🔄 Vérification des alertes toutes les 10 secondes
    setInterval(() => {
        checkForAlerts();
    }, 10 * 1000);
});

// 🔍 **Vérifie si des tickets ont dépassé leur `alertTime` et envoie une alerte**
const checkForAlerts = async () => {
    console.log("🔍 Vérification des tickets en retard...");

    try {
        const now = new Date();

        // 🔎 Récupère les tickets dont l'alertTime est dépassé et qui n'ont pas encore été signalés
        const alertTickets = await Ticket.find({
            alertTime: { $lte: now },
            alertSent: false
        }).sort({ alertTime: 1 });

        if (alertTickets.length === 0) {
            console.log("✅ Aucun ticket à signaler.");
            return;
        }

        const channel = ticketClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Impossible de trouver le canal Discord ! Vérifie l'ID.");
            return;
        }

        for (const ticket of alertTickets) {
            console.log(`⚠️ Envoi d'une alerte pour le ticket ${ticket.ticketNumber}...`);

            // 🔥 Message personnalisé
            const alertMessage = `🚨 **Pouvez-vous traiter le ticket "${ticket.ticketNumber}" svp ? C'est une P${ticket.priority}** 🚨`;

            await channel.send(alertMessage);

            // ✅ Marque le ticket comme alerté pour éviter les doublons
            await Ticket.updateOne({ _id: ticket._id }, { alertSent: true });

            console.log(`✅ Alerte envoyée pour le ticket ${ticket.ticketNumber}`);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la vérification des alertes :", error);
    }
};

// ✅ Commande !alltickets pour voir tous les tickets
ticketClient.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "!alltickets") {
        console.log("📩 Commande !alltickets reçue");

        const tickets = await Ticket.find().sort({ deadline: 1 });

        if (tickets.length === 0) {
            return message.channel.send("📭 Aucun ticket en cours !");
        }

        let ticketList = "**📋 Tous les tickets :**\n";
        tickets.forEach((ticket, index) => {
            ticketList += `\n**${index + 1}. Ticket :** ${ticket.ticketNumber}\n📌 **Priorité :** ${ticket.priority}\n⏳ **Deadline :** ${new Date(ticket.deadline).toLocaleString()}\n🔔 **Alerte prévue :** ${new Date(ticket.alertTime).toLocaleString()}\n---`;
        });

        message.channel.send(ticketList);
    }
});

// ✅ Commande !deleteticket pour supprimer un ticket
ticketClient.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(" ");
    if (args[0] === "!deleteticket") {
        if (args.length < 2) {
            return message.reply("❌ **Utilisation:** `!deleteticket [ticketNumber]`");
        }

        const ticketNumber = args[1];

        try {
            const deletedTicket = await Ticket.findOneAndDelete({ ticketNumber });

            if (!deletedTicket) {
                return message.reply(`Ticket **${ticketNumber}** introuvable.`);
            }

            message.reply(`✅ Ticket **${ticketNumber}** supprimé avec succès.`);
            console.log(`✅ Ticket supprimé: ${ticketNumber}`);
        } catch (error) {
            console.error("❌ Erreur lors de la suppression du ticket:", error);
            message.reply("❌ Une erreur s'est produite lors de la suppression du ticket.");
        }
    }
});

// ✅ Connexion du bot avec son propre token
ticketClient.login(process.env.DISCORD_TICKET_BOT_TOKEN).catch(err => {
    console.error("❌ Erreur de connexion au TicketBot :", err);
});

module.exports = { ticketClient };
