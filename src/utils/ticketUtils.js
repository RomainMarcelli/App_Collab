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

// Durées en fonction de chaque ticket (en millisecondes)
export const ticketDurations = {
    1 : 30 * 60 * 1000, // 30 minutes pour ticketId1
    2 : 1 * 60 * 60 * 1000, // 1 heure pour ticketId2
    3 : 2 * 60 * 60 * 1000,
    4 : 3 * 24 * 60 * 60 * 1000,
    5 : 4 * 24 * 60 * 60 * 1000,
    // Ajouter d'autres tickets selon vos besoins
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



// Fonction pour démarrer un timer pour un ticket donné
export const startTicketTimer = (ticketId) => {
    const duration = ticketDurations[ticketId];
    if (!duration) {
        console.error("Durée non définie pour le ticket:", ticketId);
        return;
    }

    let remainingTime = duration;
    const intervalId = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(intervalId);
            notifyUser(ticketId);
        } else {
            remainingTime -= 1000; // Décrémenter le temps restant chaque seconde
            updateTimerDisplay(ticketId, remainingTime);
        }
    }, 1000);
};

// Fonction pour notifier l'utilisateur lorsque le temps est écoulé
const notifyUser = (ticketId) => {
    alert(`Le temps pour le ticket ${ticketId} est écoulé !`);
};

// Fonction pour mettre à jour l'affichage du timer
const updateTimerDisplay = (ticketId, remainingTime) => {
    // Mettre à jour l'état ou le DOM pour refléter le temps restant
    const formattedTime = formatRemainingTime(remainingTime);
    document.getElementById(`timer-${ticketId}`).innerText = formattedTime; // Par exemple
};

// In your ticketUtils.js or relevant file
export const formatRemainingTime = (milliseconds) => {
    if (milliseconds <= 0) return "00:00:00"; // Return 0 if time is up
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

