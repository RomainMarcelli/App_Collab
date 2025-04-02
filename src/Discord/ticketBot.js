require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel");
const { EmbedBuilder } = require("discord.js");


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
    // console.log("🔍 Vérification des tickets en retard...");

    try {
        const now = new Date();
    
        const alertTickets = await Ticket.find({
            alertTime: { $lte: now },
            alertSent: false
        }).sort({ alertTime: 1 });
    
        if (alertTickets.length === 0) return;
    
        const channel = ticketClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Canal Discord introuvable. Vérifie l'ID.");
            return;
        }
    
        for (const ticket of alertTickets) {
            const result = await Ticket.updateOne(
                { _id: ticket._id, alertSent: false },
                { alertSent: true }
            );
    
            if (result.modifiedCount === 0) {
                console.log(`⏭️ Ticket ${ticket.ticketNumber} déjà traité. Ignoré.`);
                continue;
            }
    
            const deadlineDate = new Date(ticket.deadline);
    
            // 🧠 Calcul du temps restant en heures ouvrées (9h-18h)
            const WORK_START = 9;
            const WORK_END = 18;
            let tempDate = new Date(now);
            let timeRemainingHours = 0;
    
            while (tempDate < deadlineDate) {
                const day = tempDate.getDay();
                if (day !== 0 && day !== 6) { // Exclure week-end
                    const workDayStart = new Date(tempDate);
                    workDayStart.setHours(WORK_START, 0, 0, 0);
    
                    const workDayEnd = new Date(tempDate);
                    workDayEnd.setHours(WORK_END, 0, 0, 0);
    
                    if (tempDate < workDayEnd) {
                        const from = tempDate > workDayStart ? tempDate : workDayStart;
                        const to = deadlineDate < workDayEnd ? deadlineDate : workDayEnd;
    
                        if (to > from) {
                            timeRemainingHours += (to - from) / (1000 * 60 * 60);
                        }
                    }
                }
    
                // Passer au jour suivant
                tempDate.setDate(tempDate.getDate() + 1);
                tempDate.setHours(0, 0, 0, 0);
            }
    
            const timeRemaining =
                timeRemainingHours <= 0
                    ? " (⏰ dépassée)"
                    : ` (${Math.floor(timeRemainingHours)}h${Math.round((timeRemainingHours % 1) * 60)}min restantes)`;
    
            const type = ticket.ticketNumber?.startsWith("S")
                ? "Service"
                : ticket.ticketNumber?.startsWith("I")
                ? "Incident"
                : "Ticket";
    
            const deadlineFormatted = deadlineDate.toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
    
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("Client : Nhood")
                .setDescription(
                    `${type} P${ticket.priority}, merci de traiter le ticket "**${ticket.ticketNumber}**" svp - Deadline : **${deadlineFormatted}**${timeRemaining}`
                );
    
            await channel.send({ embeds: [embed] });
            console.log(`✅ Embed envoyé pour ${ticket.ticketNumber}`);
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