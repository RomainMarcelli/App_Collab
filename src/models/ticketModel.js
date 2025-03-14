const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true, unique: true, index: true },  
    priority: { type: String, required: true },
    lastUpdate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
