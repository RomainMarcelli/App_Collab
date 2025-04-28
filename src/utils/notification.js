const notifier = require('node-notifier');
const path = require('path');

const sendDesktopNotification = (title, message) => {
    if (!title || !message) {
        console.error("❌ ERREUR : Impossible d'envoyer une notification sans titre ni message.");
        return;
    }

    try {
        notifier.notify({
            title: title,
            message: message,
            icon: path.join(__dirname, 'alert-icon.png'), // ✅ Icône personnalisée (mets une image ici)
            sound: true, // ✅ Joue un son
            wait: false // ✅ N'attend pas l'interaction de l'utilisateur
        });

        console.log(`🔔 Notification envoyée : ${title} - ${message}`);
    } catch (error) {
        console.error("❌ ERREUR : Échec de l'envoi de la notification :", error);
    }
};

module.exports = { sendDesktopNotification };
