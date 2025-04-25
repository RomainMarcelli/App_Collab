const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    ticketNumber: { 
        type: String, 
        required: true, 
        unique: true, 
        index: { unique: true, sparse: true }, // ✅ Empêche les doublons tout en autorisant `null`
        trim: true 
    },  
    priority: { 
        type: String, 
        required: true,
        enum: ["1", "2", "3", "4", "5"] // ✅ Assure que la priorité est valide
    },
    lastUpdate: { type: Date, required: true }, // ✅ Date extraite d'EasyVista
    createdAt: { type: Date, default: Date.now }, // ✅ Date d'ajout dans la BDD
    deadline: { type: Date, required: true }, // ✅ Date limite de traitement du ticket
    alertTime: { type: Date, required: true }, // ✅ Date de l'alerte
    alertSent: { type: Boolean, default: false }, // ✅ Indique si l'alerte a été envoyée
    lastHourAlertSent: { type: Boolean, default: false }, // ✅ Indique si l'alerte rouge a été envoyée
    frozen: { type: Boolean, default: false }  // ✅ Ajout pour figer un ticket suite à un 👍
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
