    const mongoose = require('mongoose');

    const ticketSchema = new mongoose.Schema({
        numeroTicket: {
            type: String,
            required: true,
            unique: true
        },
        priorite: {
            type: Number,
            required: true,
            enum: [1, 2, 3, 4, 5]
        },
        sujet: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        beneficiaire: {
            type: String,
            required: true
        },
        dateEmission: {
            type: String,
            required: true,
            // default: Date.now
        },
        collaborateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collaborateur',
            required: false
        },
        estAffecte: { // Ajout du champ pour suivre si le ticket est affecté
            type: Boolean,
            default: false // Par défaut, le ticket n'est pas affecté
        }
    });

    const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
    module.exports = Ticket;
