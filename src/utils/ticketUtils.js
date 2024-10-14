// Durées SLA en fonction des priorités (en millisecondes)
export const slaDurations = {
    1: 2 * 60 * 60 * 1000,       // 1 heure pour P1
    2: 3 * 60 * 60 * 1000,       // 2 heures pour P2
    3: 9 * 60 * 60 * 1000,       // 8 heures pour P3
    4: 4 * 24 * 60 * 60 * 1000,  // 3 jours pour P4
    5: 6 * 24 * 60 * 60 * 1000   // 5 jours pour P5
};

// Fonction pour calculer l'heure de fin en fonction de la date d'émission et de la priorité du ticket
export const calculateSlaEndTime = (ticket) => {
    if (!ticket.dateEmission || !ticket.priorite) {
        console.error("Date d'émission ou priorité manquante pour le ticket:", ticket);
        return null;
    }

    const emissionDate = new Date(ticket.dateEmission).getTime();
    if (isNaN(emissionDate)) {
        console.error("Date d'émission invalide pour le ticket:", ticket);
        return null;
    }

    const slaDuration = slaDurations[ticket.priorite];
    if (slaDuration === undefined) {
        console.error("Durée SLA manquante pour la priorité:", ticket.priorite);
        return null;
    }

    // Calculer l'heure de fin SLA
    const endTime = emissionDate + slaDuration;
    return new Date(endTime);
};

// Fonction pour formater la durée SLA
export const formatSlaDuration = (duration) => {
    const msInHour = 60 * 60 * 1000;
    const msInDay = 24 * msInHour;

    if (duration >= msInDay) {
        const days = Math.floor(duration / msInDay);
        return days > 1 ? `${days} jours` : `${days} jour`;
    } else if (duration >= msInHour) {
        const hours = Math.floor(duration / msInHour);
        return hours > 1 ? `${hours} heures` : `${hours} heure`;
    } else {
        const minutes = Math.floor(duration / (60 * 1000));
        return minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;
    }
};

// Fonction pour obtenir la couleur de la priorité
export const getPriorityColor = (priorite) => {
    switch (priorite) {
        case 1: return 'bg-black text-white';
        case 2: return 'bg-red-500 text-white';
        case 3: return 'bg-yellow-500 text-black';
        case 4: return 'bg-blue-500 text-white';
        case 5: return 'bg-green-500 text-white';
        default: return '';
    }
};

// Fonction pour formater la date de fin SLA sous forme lisible
export const formatSlaEndTime = (endTime) => {
    if (!endTime) return "Non défini";
    return new Date(endTime).toLocaleString();
};
