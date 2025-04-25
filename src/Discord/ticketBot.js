require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel");
const { EmbedBuilder } = require("discord.js");
const { isBusinessDay } = require("../utils/timeUtils");


// Changement de couleur quand un ticket est pris . quand un ticket est pris en compte avce un pouce 
// Donc enlever la focntion de supprimer l'historique des msg du bot

// ✅ Création du client Discord
const ticketClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
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

    setInterval(() => {
        const now = new Date();
        const isMonday = now.getDay() === 1; // Lundi = 1
        const isNineAM = now.getHours() === 9 && now.getMinutes() === 0;

        if (isMonday && isNineAM) {
            console.log("🧼 Lancement du nettoyage hebdomadaire du canal Discord...");
            cleanMessagesWithoutTicket(ticketClient);
        }
    }, 60 * 1000); // vérifie chaque minute    
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
            // ✅ Ignorer les tickets qui ne commencent pas par "I"
            if (!ticket.ticketNumber.startsWith("I")) continue;

            const deadline = new Date(ticket.deadline);
            const deadlineTimestamp = Math.floor(deadline.getTime() / 1000); // UNIX
            let timeRemainingHours = 0;
            let tempDate = new Date(now);
            const WORK_START = 9;
            const WORK_END = 18;

            // 🔁 Calcul du temps ouvré restant
            while (tempDate < deadline) {
                if (isBusinessDay(tempDate)) {
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
                    : fullHours > 0 && remainingMinutes > 0
                        ? ` (${fullHours}h ${remainingMinutes}min restantes)`
                        : fullHours > 0
                            ? ` (${fullHours}h restantes)`
                            : ` (${remainingMinutes}min restantes)`;

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
                        `Incident P${ticket.priority}, merci de traiter le ticket "**${ticket.ticketNumber}**" svp - Deadline : **${deadlineFormatted}**${timeRemaining}`
                    );
                await channel.send({ embeds: [greenEmbed] });
                console.log(`✅ Message VERT envoyé pour ${ticket.ticketNumber}`);

                await Ticket.updateOne({ _id: ticket._id }, { alertSent: true });
            }

            // ✅ Alerte ROUGE si ≤ 2h avant la deadline (une seule fois)
            if (
                !ticket.lastHourAlertSent &&
                ticket.ticketNumber.startsWith("I") &&
                timeRemainingHours <= 0.5
            ) {
                const redEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle("Client : Nhood")
                    .setDescription(
                        `Incident P${ticket.priority}. Il reste **moins de 30 minutes** au ticket: **${ticket.ticketNumber}**  - Deadline : **${deadlineFormatted}**${timeRemaining}`
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

    // ✅ Commande pour lancer manuellement le nettoyage
    if (args[0] === "!cleanmessages") {
        try {
            await cleanMessagesWithoutTicket(ticketClient);
            await message.delete(); // 🔥 Supprime le message "!cleanmessages"
        } catch (err) {
            console.error("❌ Erreur pendant le nettoyage manuel :", err);
            message.reply("❌ Une erreur est survenue pendant le nettoyage.");
        }
    }

});


// ✅ Réaction 👍 : fige le ticket en BDD pour ne plus recevoir d’alerte
ticketClient.on("messageReactionAdd", async (reaction, user) => {
    console.log("👍 Réaction détectée !");
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error("❌ Erreur en récupérant la réaction :", error);
            return;
        }
    }

    if (reaction.emoji.name === "👍") {
        try {
            const message = reaction.message;
            let text = message.content || "";

            if (!text && message.embeds.length > 0) {
                const embed = message.embeds[0];
                if (embed.description) {
                    text = embed.description;
                } else if (embed.fields?.length) {
                    text = embed.fields.map(f => `${f.name} ${f.value}`).join(" ");
                }
            }

            const match = text.match(/(?:\*\*)?([A-Z]?\d{6}_\d{3})(?:\*\*)?/);
            if (match) {
                const ticketNumber = match[1];
                const ticket = await Ticket.findOne({ ticketNumber });

                if (ticket) {
                    // ✅ On fige le ticket en mettant les alertes comme déjà envoyées
                    ticket.alertSent = true;
                    ticket.lastHourAlertSent = true;
                    await ticket.save();

                    console.log(`⛔ Ticket ${ticketNumber} figé suite à une réaction 👍 (plus d'alertes)`);
                } else {
                    console.warn(`⚠️ Ticket ${ticketNumber} non trouvé pour mise à jour.`);
                }
            } else {
                console.warn("⚠️ Aucun ticketNumber trouvé dans le message !");
            }
        } catch (err) {
            console.error("❌ Erreur pendant la mise à jour du ticket via 👍 :", err);
        }
    }
});

const cleanMessagesWithoutTicket = async (client) => {
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if (!channel) return console.error("❌ Canal non trouvé pour le nettoyage.");

    let deletedCount = 0;
    let lastMessageId = null;
    let keepGoing = true;

    try {
        while (keepGoing) {
            const options = { limit: 100 };
            if (lastMessageId) options.before = lastMessageId;

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) break;

            for (const [, message] of messages) {
                lastMessageId = message.id;

                let text = message.content || "";

                if (!text && message.embeds.length > 0) {
                    const embed = message.embeds[0];
                    if (embed.description) {
                        text = embed.description;
                    } else if (embed.fields?.length) {
                        text = embed.fields.map(f => `${f.name} ${f.value}`).join(" ");
                    }
                }

                const match = text.match(/(?:\*\*)?([A-Z]?\d{6}_\d{3})(?:\*\*)?/);
                if (!match) continue;

                const ticketNumber = match[1];
                const ticket = await Ticket.findOne({ ticketNumber });

                if (!ticket) {
                    await message.delete();
                    console.log(`🗑️ Message supprimé de Discord. ❌ Ticket ${ticketNumber} introuvable en BDD.`);
                    deletedCount++;
                    continue;
                }

                // ✅ NE PAS supprimer si le ticket est figé (👍)
                if (ticket.alertSent && ticket.lastHourAlertSent) {
                    console.log(`⏸️ Message conservé : Ticket ${ticketNumber} figé (👍).`);
                    continue;
                }

                await message.delete();
                console.log(`🗑️ Message supprimé de Discord. ⏱️ Ticket ${ticketNumber} non figé.`);
                deletedCount++;
            }

            if (messages.size < 100) keepGoing = false;
        }
    } catch (err) {
        console.error("❌ Erreur pendant le nettoyage :", err);
    }

    if (deletedCount > 0) {
        console.log(`✅ Nettoyage terminé : ${deletedCount} message(s) supprimé(s).`);
    } else {
        console.log("✅ Nettoyage terminé : aucun message à supprimer.");
    }
};

// ✅ Connexion du bot avec son propre token
ticketClient.login(process.env.DISCORD_TICKET_BOT_TOKEN).catch(err => {
    console.error("❌ Erreur de connexion au TicketBot :", err);
});

module.exports = { ticketClient };
