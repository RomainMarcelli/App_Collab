// models/collabModel.js

const mongoose = require('mongoose');

// Modèle Mongoose pour les collaborateurs
const collaborateurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    client: { type: String, required: true },
    collaborateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur' },
});

const Collaborateur = mongoose.models.Collaborateur || mongoose.model('Collaborateur', collaborateurSchema);


module.exports = Collaborateur;
