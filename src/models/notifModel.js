const mongoose = require('mongoose');

const NotifSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true },
    priority: { type: String, required: true },
    createdAt: { type: Date, required: true }, // ✅ Ajout explicit de createdAt
    deadline: { type: Date, required: true },
    alertTime: { type: Date, required: true },
    alertSent: { type: Boolean, default: false } // ✅ Ajout d'un champ pour éviter les doublons
}, { timestamps: true });

module.exports = mongoose.model('Notif', NotifSchema);
