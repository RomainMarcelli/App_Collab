import React, { useState, useEffect } from 'react';
import { getPriorityColor, formatSlaDuration } from '../../utils/ticketUtils';

const slaDurations = {
    1: 30 * 60 * 1000, // 30 minutes
    2: 1 * 60 * 60 * 1000, // 1 heure
    3: 4 * 60 * 60 * 1000, // 4 heures
    4: 35 * 60 * 60 * 1000, // 35 heures
    5: 72 * 60 * 60 * 1000, // 72 heures
};

const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TicketRow = ({ ticket, collaborateurs, getPriorityColor, handleEdit, handleDelete, tooltip, handleMouseOver, handleMouseOut, handleCloseTicket }) => {

    const [tickets, setTickets] = useState([]);
    const [timers, setTimers] = useState({});

    useEffect(() => {
        // Calculer le temps restant pour chaque ticket
        const interval = setInterval(() => {
            const updatedTimers = {};
            tickets.forEach((ticket) => {
                const emissionTime = new Date(ticket.dateEmission).getTime();
                const slaDuration = slaDurations[ticket.priorite];
                const currentTime = Date.now();
                const remainingTime = slaDuration - (currentTime - emissionTime);

                updatedTimers[ticket._id] = remainingTime > 0 ? remainingTime : 0;
            });
            setTimers(updatedTimers);
        }, 1000);

        return () => clearInterval(interval); // Nettoyer l'intervalle
    }, [tickets]);

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
            <td className="px-4 py-4 border text-center">
                {new Date(ticket.dateEmission).toLocaleString()}
            </td>
            <td className="px-4 py-4 border text-center">
                {formatSlaDuration(slaDurations[ticket.priorite])}
            </td>
            <td className="px-4 py-4 border text-center">
                {' '}
                {timers[ticket._id] !== undefined
                    ? formatTime(timers[ticket._id])
                    : 'Calcul en cours...'}
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
                <button
                    className="cursor-pointer transition-all mt-2 bg-green-500 text-white px-6 py-2 rounded-lg border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                    onClick={() => handleCloseTicket(ticket._id)}
                >
                    Fermer le Ticket
                </button>
            </td>
        </tr>
    );
};

export default TicketRow;