const Notif = require('../../models/notifModel');
const chalk = require('chalk');
const boxen = require('boxen');

const checkForAlerts = async () => {
    const now = new Date();
    const notifications = await Notif.find({ alertTime: { $lte: now }, alertSent: { $ne: true } });

    notifications.forEach(async (notif) => {
        const message = `
        🚨 ${chalk.red.bold('ALERTE')} 🚨
        -----------------------------------
        📌 Ticket : ${chalk.yellow.bold(notif.ticketNumber)}
        ⏳ Priorité : ${chalk.green.bold(notif.priority)}
        🕒 Deadline Approche !
        -----------------------------------
        `;

        console.log(
            boxen(message, {
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'red'
            })
        );

        // 👉 Optionnel : Envoi d'une alerte supplémentaire (WebSocket, Email...)
        
        // Marquer la notification comme envoyée
        await Notif.updateOne({ _id: notif._id }, { $set: { alertSent: true } });
    });
};

// Vérifier toutes les minutes
setInterval(checkForAlerts, 60 * 1000);
