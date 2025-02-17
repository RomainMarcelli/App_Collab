const mongoose = require('mongoose');

const NotifSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true },
    priority: { type: String, required: true },
    deadline: { type: Date, required: true },
    alertTime: { type: Date, required: true },
    alertSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notif', NotifSchema);
