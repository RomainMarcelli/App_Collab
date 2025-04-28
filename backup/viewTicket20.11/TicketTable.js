import React from 'react';
import TicketRow from './TicketRow';

const TicketTable = ({ tickets, collaborateurs, getPriorityColor, handleEdit, handleDelete, tooltip, handleMouseOver, handleMouseOut, formatTime, timers, handleCloseTicket }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 table-auto">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-3 border text-center text-gray-600">Numéro</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Collaborateur</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Priorité</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Sujet</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Description</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Bénéficiaire</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Date d'émission</th>
                        <th className="px-4 py-3 border text-center text-gray-600">SLA</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Timer</th>
                        <th className="px-4 py-3 border text-center text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <TicketRow
                            key={ticket._id}
                            ticket={ticket}
                            collaborateurs={collaborateurs}
                            getPriorityColor={getPriorityColor}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            handleCloseTicket={handleCloseTicket}
                            tooltip={tooltip}
                            handleMouseOver={handleMouseOver}
                            handleMouseOut={handleMouseOut}
                            formatTime={formatTime}
                            timers={timers}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TicketTable;
