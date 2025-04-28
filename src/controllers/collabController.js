// controllers/collaborateurController.js

const Collaborateur = require('../models/collabModel');

// Récupérer tous les collaborateurs
exports.getAllCollaborateurs = async (req, res) => {
    try {
        const collaborateurs = await Collaborateur.find();
        res.json(collaborateurs);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des collaborateurs', error });
    }
};

// Ajouter un nouveau collaborateur
exports.addCollaborateur = async (req, res) => {
    const { nom, client } = req.body;

    if (!nom || !client) {
        return res.status(400).json({ message: 'Le nom et le client sont requis' });
    }

    try {
        const newCollaborateur = new Collaborateur({ nom, client });
        await newCollaborateur.save();
        res.status(201).json({ message: 'Collaborateur ajouté avec succès', collaborateur: newCollaborateur });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du collaborateur', error });
    }
};

// Mettre à jour un collaborateur
exports.updateCollaborateur = async (req, res) => {
    const { id } = req.params;
    const { nom, client } = req.body;

    try {
        const updatedCollaborateur = await Collaborateur.findByIdAndUpdate(
            id,
            { nom, client },
            { new: true, runValidators: true } // Retourne le collaborateur mis à jour
        );

        if (!updatedCollaborateur) {
            return res.status(404).json({ message: 'Collaborateur non trouvé' });
        }

        res.json({ message: 'Collaborateur mis à jour avec succès', collaborateur: updatedCollaborateur });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du collaborateur', error });
    }
};

// Supprimer un collaborateur
exports.deleteCollaborateur = async (req, res) => {
    const { id } = req.params;
    try {
        const collaborateur = await Collaborateur.findByIdAndDelete(id);
        if (!collaborateur) {
            return res.status(404).json({ message: 'Collaborateur non trouvé' });
        }
        res.json({ message: 'Collaborateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du collaborateur', error });
    }
};
