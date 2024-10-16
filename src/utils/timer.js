// timer.js
import { useEffect, useState } from 'react';
import { slaDurations } from './ticketUtils'; // Importe tes SLA si nécessaire

export const TimerComponent = ({ ticket }) => {
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        const calculateRemainingTime = () => {
            const slaEndTime = new Date(ticket.dateEmission).getTime() + slaDurations[ticket.priorite];
            const now = Date.now();
            const timeLeft = slaEndTime - now;
            setTimeRemaining(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                notifySlaExpired(ticket.numeroTicket);
            }
        };

        const timerInterval = setInterval(calculateRemainingTime, 1000);

        return () => clearInterval(timerInterval);
    }, [ticket]);

    const notifySlaExpired = (ticketNumber) => {
        alert(`Le SLA pour le ticket numéro ${ticketNumber} est expiré !`);
    };

    const formatTimeRemaining = (timeInMilliseconds) => {
        if (timeInMilliseconds <= 0) {
            return 'SLA expiré';
        }

        const days = Math.floor(timeInMilliseconds / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeInMilliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timeInMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

        if (days > 0) {
            return `${days} jour${days > 1 ? 's' : ''} ${hours} heure${hours > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} heure${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
    };

    return (
        <td className="px-4 py-4 border text-center">
            {formatTimeRemaining(timeRemaining)}
        </td>
    );
};
