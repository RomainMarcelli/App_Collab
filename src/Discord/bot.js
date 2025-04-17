// require("dotenv").config();
// const { Client, GatewayIntentBits } = require("discord.js");
// const mongoose = require("mongoose"); // ✅ Import de mongoose
// const { checkForAlerts } = require("../controllers/notifController"); // ✅ Import des alertes
// const Notif = require("../models/notifModel"); // ✅ Import du modèle des notifications
// const ticketBot = require("./ticketBot"); // ✅ Import du fichier ticketBot.js

// // ✅ Création du client Discord
// const client = new Client({
//     partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.GuildMessageReactions // ✅ Ajouté pour écouter les réactions
//     ]
// });

// // ✅ Connexion à MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log("✅ Connecté à MongoDB");
// }).catch(err => console.error("❌ Erreur MongoDB :", err));

// // ✅ Vérification de la connexion du bot
// client.once("ready", () => {
//     console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

//     const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

//     // cleanMessagesWithoutTicket(client);

//     if (!channel) {
//         console.error("❌ Impossible de trouver le canal Discord ! Vérifie l'ID.");
//     } else {
//         // channel.send("✅ Bot en ligne et prêt à envoyer des alertes !");
//     }

//     setInterval(async () => {
//         await checkForAlerts(client);
//     }, 10 * 1000); // ✅ Vérifie les alertes toutes les 10 secondes
//     // 🔁 Nettoyage toutes les heures
//     // setInterval(() => {
//     //     cleanMessagesWithoutTicket(client);
//     // }, 1000 * 60 * 60); // Toutes les heures

// });

// client.on("messageCreate", async (message) => {
//     if (message.author.bot) return; // Ignore les messages des bots

//     if (message.content === "!tickets") {
//         const tickets = await Notif.find({ alertSent: false }).sort({ deadline: 1 }); // ✅ Récupère les tickets triés par deadline

//         if (tickets.length === 0) {
//             return message.channel.send("📭 Aucun ticket actif pour le moment !");
//         }

//         let ticketList = "**📋 Liste des tickets actifs :**\n";
//         tickets.forEach((ticket, index) => {
//             ticketList += `\n**${index + 1}. Ticket :** ${ticket.ticketNumber}\n📌 **Priorité :** ${ticket.priority}\n⏳ **Deadline :** ${new Date(ticket.deadline).toLocaleString()}\n🔔 **Alerte prévue :** ${new Date(ticket.alertTime).toLocaleString()}\n---`;
//         });

//         message.channel.send(ticketList);
//     }
// });

// // ✅ Écoute les messages pour détecter `!delete`
// client.on("messageCreate", async (message) => {
//     if (message.author.bot) return; // Ignore les messages des bots

//     const args = message.content.split(" ");
//     const command = args[0];

//     if (command === "!delete") {
//         if (args.length < 2) {
//             return message.reply("❌ **Utilisation:** `!delete [ticketNumber]`");
//         }

//         const ticketNumber = args[1];

//         try {
//             const deletedTicket = await Notif.findOneAndDelete({ ticketNumber });

//             if (!deletedTicket) {
//                 return message.reply(`Ticket **${ticketNumber}** introuvable.`);
//             }

//             message.reply(`Ticket **${ticketNumber}** supprimé avec succès.`);
//             console.log(`Ticket supprimé: ${ticketNumber}`);
//         } catch (error) {
//             console.error("❌ Erreur lors de la suppression du ticket:", error);
//             message.reply("❌ Une erreur s'est produite lors de la suppression du ticket.");
//         }
//     }
// });

// client.on("messageReactionAdd", async (reaction, user) => {
//     if (user.bot) return;

//     if (reaction.emoji.name !== "👍") return;

//     console.log("📥 Réaction détectée !");
//     console.log(`✅ Réaction 👍 ajoutée par ${user.username}`);

//     try {
//         // Assure-toi que tout est bien chargé
//         if (reaction.partial) await reaction.fetch();
//         if (reaction.message.partial) await reaction.message.fetch();

//         // 💣 Supprime le message Discord en premier
//         try {
//             await reaction.message.delete();
//             console.log("🗑️ Message supprimé de Discord.");
//         } catch (err) {
//             console.error("❌ Erreur lors de la suppression du message :", err);
//         }

//         // 📦 Optionnel : suppression du ticket en base s'il existe
//         let messageContent = reaction.message.content || "";
//         if (!messageContent && reaction.message.embeds.length > 0) {
//             const embed = reaction.message.embeds[0];
//             if (embed.description) {
//                 messageContent = embed.description;
//             } else if (embed.fields?.length) {
//                 messageContent = embed.fields.map(f => `${f.name} ${f.value}`).join(" ");
//             }
//         }

//         console.log("📝 Contenu du message :", messageContent);

//         const match = messageContent.match(/(?:\*\*)?([A-Z]?\d{6}_\d{3})(?:\*\*)?/);
//         if (!match) {
//             console.log("ℹ️ Aucun numéro de ticket trouvé — pas grave.");
//             return;
//         }

//         const ticketNumber = match[1];
//         console.log(`⚡ Tentative de suppression du ticket : ${ticketNumber}`);

//         const deletedTicket = await Notif.findOneAndDelete({ ticketNumber });

//         if (deletedTicket) {
//             console.log(`✅ Ticket ${ticketNumber} supprimé de la base de données.`);
//         } else {
//             console.log(`ℹ️ Ticket ${ticketNumber} introuvable dans la base de données (déjà supprimé ?).`);
//         }

//     } catch (error) {
//         console.error("❌ Erreur générale lors du traitement de la réaction :", error);
//     }
// });

// // const cleanMessagesWithoutTicket = async (client) => {
// //     const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
// //     if (!channel) return console.error("❌ Canal non trouvé pour le nettoyage.");

// //     const now = Date.now();
// //     const eightHours = 8 * 60 * 60 * 1000;
// //     let deletedCount = 0;

// //     try {
// //         const messages = await channel.messages.fetch({ limit: 100 });

// //         for (const [, message] of messages) {
// //             const age = now - message.createdTimestamp;
// //             if (age < eightHours) continue;

// //             // 🧠 Cherche le contenu dans content OU embed
// //             let text = message.content || "";

// //             if (!text && message.embeds.length > 0) {
// //                 const embed = message.embeds[0];
// //                 if (embed.description) {
// //                     text = embed.description;
// //                 } else if (embed.fields?.length) {
// //                     text = embed.fields.map(f => `${f.name} ${f.value}`).join(" ");
// //                 }
// //             }

// //             // 🧪 Extraction du numéro de ticket
// //             const match = text.match(/(?:\*\*)?([A-Z]?\d{6}_\d{3})(?:\*\*)?/);
// //             if (!match) continue;

// //             const ticketNumber = match[1];

// //             const ticketExists = await Notif.exists({ ticketNumber });

// //             if (!ticketExists) {
// //                 await message.delete();
// //                 console.log(`🧹 Message supprimé pour ticket inexistant : ${ticketNumber}`);
// //                 deletedCount++;
// //             }
// //         }

// //     } catch (err) {
// //         console.error("❌ Erreur pendant le nettoyage automatique :", err);
// //     }

// //     if (deletedCount > 0) {
// //         console.log(`✅ Nettoyage terminé : ${deletedCount} message(s) supprimé(s).`);
// //     } else {
// //         console.log("✅ Nettoyage terminé : aucun message à supprimer.");
// //     }
// // };


// // ✅ Connexion du bot avec le token
// client.login(process.env.DISCORD_TOKEN).catch(err => {
//     console.error("❌ Erreur de connexion au bot Discord :", err);
// });


// module.exports = { client }; // ✅ Export du client pour pouvoir l'utiliser dans d'autres fichiers
