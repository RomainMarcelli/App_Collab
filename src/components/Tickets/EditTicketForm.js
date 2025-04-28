import React from 'react';

const EditTicketForm = ({ editingTicket, setEditingTicket, handleUpdateTicket }) => {
    return (
        <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Modifier le Ticket</h3>
            <form onSubmit={handleUpdateTicket} className="flex flex-col">
                <input
                    type="text"
                    value={editingTicket.numeroTicket}
                    onChange={(e) => setEditingTicket({ ...editingTicket, numeroTicket: e.target.value })}
                    placeholder="Numéro"
                    className="border rounded-md p-2 mb-2"
                />
                <select
                    value={editingTicket.priorite}
                    onChange={(e) => setEditingTicket({ ...editingTicket, priorite: e.target.value })}
                    className="w-full px-3 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                <input
                    type="text"
                    value={editingTicket.sujet}
                    onChange={(e) => setEditingTicket({ ...editingTicket, sujet: e.target.value })}
                    placeholder="Sujet"
                    className="border rounded-md p-2 mb-2"
                />
                <input
                    type="text"
                    value={editingTicket.description}
                    onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                    placeholder="Description"
                    className="border rounded-md p-2 mb-2"
                />
                <input
                    type="text"
                    value={editingTicket.beneficiaire}
                    onChange={(e) => setEditingTicket({ ...editingTicket, beneficiaire: e.target.value })}
                    placeholder="Bénéficiaire"
                    className="border rounded-md p-2 mb-2"
                />
                <input
                    type="datetime-local"
                    value={new Date(editingTicket.dateEmission).toISOString().slice(0, 16)}
                    onChange={(e) => setEditingTicket({ ...editingTicket, dateEmission: e.target.value })}
                    placeholder="Date d'émission"
                    className="border rounded-md p-2 mb-2"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded-md"
                >
                    Enregistrer
                </button>
                <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="bg-gray-500 text-white p-2 rounded-md mt-2"
                >
                    Annuler
                </button>
            </form>
        </div>
    );
};

export default EditTicketForm;
