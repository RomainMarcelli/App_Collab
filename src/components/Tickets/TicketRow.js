import React from 'react';
import { getPriorityColor, formatSlaDuration } from '../../utils/ticketUtils';

const TicketRow = ({ ticket, collaborateurs, getPriorityColor, handleEdit, handleDelete, tooltip, handleMouseOver, handleMouseOut, formatTime, timers }) => {
    
    const slaDurations = {
        1: 1 * 60 * 60 * 1000,
        2: 2 * 60 * 60 * 1000,
        3: 8 * 60 * 60 * 1000,
        4: 2 * 24 * 60 * 60 * 1000,
        5: 5 * 24 * 60 * 60 * 1000,
    };

    return (
        <tr key={ticket._id} className="hover:bg-gray-50 mb-10">
            <td className="px-4 py-4 border text-center">{ticket.numeroTicket}</td>
            <td className="border px-4 py-2 text-center">
                {collaborateurs.find(collab => collab._id === ticket.collaborateur)?.nom || 'Non attribué'}
            </td>
            <td className={`px-4 py-4 border text-center ${getPriorityColor(ticket.priorite)}`}>
                {ticket.priorite}
            </td>
            <td className="px-4 py-4 border text-center">{ticket.sujet}</td>
            <td
                className="px-4 py-4 border text-center truncate max-w-xs cursor-pointer"
                onMouseOver={(e) => handleMouseOver(e, ticket.description)}
                onMouseOut={handleMouseOut}
            >
                {ticket.description}
            </td>
            <td className="px-4 py-4 border text-center">{ticket.beneficiaire}</td>
            <td className="px-4 py-4 border text-center">{new Date(ticket.dateEmission).toLocaleDateString()}</td>
            <td className="px-4 py-4 border text-center">
                {formatSlaDuration(slaDurations[ticket.priorite])}
            </td>
            <td className="px-4 py-4 border text-center">
                {timers[ticket._id] !== undefined ? formatTime(timers[ticket._id]) : 'En attente'}
            </td>
            <td className="px-4 py-4 border text-center flex flex-col items-center">
                <button
                    className="cursor-pointer transition-all mb-2 bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                    onClick={() => handleEdit(ticket)}
                >
                    Modifier
                </button>
                <button
                    className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                    onClick={() => handleDelete(ticket._id)}
                >
                    Supprimer
                </button>
            </td>
        </tr>
    );
};

export default TicketRow;
