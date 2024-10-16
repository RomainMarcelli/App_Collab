// Durées Timer en fonction des priorités (en millisecondes)
export const timerDurations = {
    1: 30 * 60 * 1000,         // 30 minutes pour P1
    2: 1 * 60 * 60 * 1000,     // 1 heure pour P2
    3: 4 * 60 * 60 * 1000,     // 4 heures pour P3
    4: 35 * 60 * 60 * 1000,    // 35 heures pour P4
    5: 72 * 60 * 60 * 1000     // 72 heures pour P5
};

// Durées SLA en fonction des priorités (en millisecondes)
export const slaDurations = {
    1: 1 * 60 * 60 * 1000,     // 1 heure pour P1
    2: 2 * 60 * 60 * 1000,     // 2 heures pour P2
    3: 8 * 60 * 60 * 1000,     // 8 heures pour P3
    4: 2 * 24 * 60 * 60 * 1000, // 2 jours pour P4
    5: 5 * 24 * 60 * 60 * 1000  // 5 jours pour P5
};

// Fonction pour formater la durée (Générique)
export const formatDuration = (duration) => {
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

// Vous pouvez également mettre à jour vos fonctions de formatage pour utiliser formatDuration
export const formatSlaDuration = (duration) => formatDuration(duration);
