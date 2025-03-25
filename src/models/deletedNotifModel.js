const mongoose = require('mongoose');

const DeletedNotifSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true },
    priority: { type: String, required: true },
    createdAt: { type: Date, required: true },
    deadline: { type: Date, required: true },
    alertTime: { type: Date, required: true },
    alertSent: { type: Boolean, default: false },
    deletedAt: { type: Date, default: Date.now } // ✅ Date de suppression ajoutée
});

module.exports = mongoose.model('DeletedNotif', DeletedNotifSchema);