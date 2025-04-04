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
    try {
        const now = new Date();

        const tickets = await Ticket.find().sort({ alertTime: 1 });

        const channel = ticketClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Canal Discord introuvable. Vérifie l'ID.");
            return;
        }

        for (const ticket of tickets) {
            const deadline = new Date(ticket.deadline);
            let timeRemainingHours = 0;
            let tempDate = new Date(now);
            const WORK_START = 9;
            const WORK_END = 18;

            // 🔁 Calcul du temps ouvré restant
            while (tempDate < deadline) {
                const day = tempDate.getDay();
                if (day !== 0 && day !== 6) {
                    const workStart = new Date(tempDate);
                    workStart.setHours(WORK_START, 0, 0, 0);
                    const workEnd = new Date(tempDate);
                    workEnd.setHours(WORK_END, 0, 0, 0);

                    if (tempDate < workEnd) {
                        const from = tempDate > workStart ? tempDate : workStart;
                        const to = deadline < workEnd ? deadline : workEnd;

                        if (to > from) {
                            timeRemainingHours += (to - from) / (1000 * 60 * 60);
                        }
                    }
                }
                tempDate.setDate(tempDate.getDate() + 1);
                tempDate.setHours(0, 0, 0, 0);
            }

            let fullHours = Math.floor(timeRemainingHours);
            let remainingMinutes = Math.round((timeRemainingHours % 1) * 60);
            if (remainingMinutes === 60) {
                fullHours += 1;
                remainingMinutes = 0;
            }

            const timeRemaining =
                timeRemainingHours <= 0
                    ? " (dépassée)"
                    : remainingMinutes === 0
                        ? ` (${fullHours}h restantes)`
                        : ` (${fullHours}h${remainingMinutes}min restantes)`;

            const type = ticket.ticketNumber?.startsWith("S")
                ? "Service"
                : ticket.ticketNumber?.startsWith("I")
                    ? "Incident"
                    : "Ticket";

            const deadlineFormatted = deadline.toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

            // ✅ Alerte VERT classique (une seule fois)
            if (!ticket.alertSent && new Date(ticket.alertTime) <= now) {
                const greenEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle("Client : Nhood")
                    .setDescription(
                        `${type} P${ticket.priority}, merci de traiter le ticket "**${ticket.ticketNumber}**" svp - Deadline : **${deadlineFormatted}**${timeRemaining}`
                    );
                await channel.send({ embeds: [greenEmbed] });
                console.log(`✅ Message VERT envoyé pour ${ticket.ticketNumber}`);

                await Ticket.updateOne({ _id: ticket._id }, { alertSent: true });
            }

            // ✅ Alerte ROUGE si ≤ 2h avant la deadline (une seule fois)
            if (!ticket.lastHourAlertSent && timeRemainingHours <= 2) {
                const redEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle("Client : Nhood")
                    .setDescription(
                        `${type} P${ticket.priority}, le ticket "**${ticket.ticketNumber}**" arrive à échéance dans moins de 2h !\nDeadline : **${deadlineFormatted}**${timeRemaining}`
                    );
                await channel.send({ embeds: [redEmbed] });
                console.log(`🔴 Message ROUGE envoyé pour ${ticket.ticketNumber}`);

                await Ticket.updateOne({ _id: ticket._id }, { lastHourAlertSent: true });
            }
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