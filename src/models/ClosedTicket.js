const mongoose = require('mongoose');

const closedTicketSchema = new mongoose.Schema({
    numeroTicket: {
        type: String,
        required: true,
    },
    priorite: {
        type: Number,
        required: true,
    },
    sujet: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    beneficiaire: {
        type: String,
        required: true,
    },
    dateEmission: {
        type: Date,
        required: true,
    },
    dateFermeture: {
        type: Date,
        default: Date.now, // Date à laquelle le ticket est fermé
    },
});

const ClosedTicket = mongoose.model('ClosedTicket', closedTicketSchema);

module.exports = ClosedTicket;
