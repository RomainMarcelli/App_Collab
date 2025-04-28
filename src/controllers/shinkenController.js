const { client } = require('../Discord/bot'); // ✅ Assure-toi que c'est bien `discord` et pas `Discord`

exports.handleShinken = async (req, res) => {
    try {
        const { tickets } = req.body;

        if (!tickets || tickets.length === 0) {
            return res.status(400).json({ message: "❌ Aucun ticket fourni." });
        }

        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Impossible de trouver le canal Discord !");
            return res.status(500).json({ message: "Erreur : Canal Discord introuvable." });
        }

        let message = "";
        if (tickets.length === 1) {
            message = `Le ticket Shinken **${tickets[0]}** est dans le backlog !`;
        } else {
            message = `Les tickets Shinken **${tickets.join(" / ")}** sont dans le backlog`;
        }

        await channel.send(message);
        console.log("Message Shinken envoyé sur Discord :", message);

        res.status(200).json({ message: "Notification Shinken envoyée sur Discord !" });

    } catch (error) {
        console.error("Erreur lors de l'envoi du message Shinken :", error);
        res.status(500).json({ message: "Erreur lors de l'envoi du message Shinken." });
    }
};
