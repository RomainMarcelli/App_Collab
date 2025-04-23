// 📅 Jours fériés récurrents (peu importe l'année)
const holidaysRecurring = [
    "01-01", // Jour de l'an
    "05-01", // Fête du travail
    "05-08", // Victoire 1945
    "07-14", // Fête nationale
    "08-15", // Assomption
    "11-11", // Armistice
    "12-25", // Noël
];

// 📅 Jours fériés spécifiques à certaines années (à compléter si besoin)
const holidaysSpecific = [
    "2025-05-29", // Ascension
    "2025-06-09", // Lundi de Pentecôte
];

// ✅ Vérifie si une date donnée est un jour férié (récurrent ou spécifique)
const isHoliday = (date) => {
    const mmdd = date.toISOString().slice(5, 10); // ex: "05-01"
    const yyyymmdd = date.toISOString().slice(0, 10); // ex: "2025-05-29"
    
    return holidaysRecurring.includes(mmdd) || holidaysSpecific.includes(yyyymmdd);
};

// ✅ Vérifie si une date est un jour ouvré (pas week-end ni férié)
const isBusinessDay = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6 && !isHoliday(date); // 0 = dimanche, 6 = samedi
};

// ⏰ Ajoute un certain nombre d'heures ouvrées à une date donnée
const addBusinessHours = (date, hours) => {
    let remainingMinutes = hours * 60; // Convertit les heures en minutes pour plus de précision
    let newDate = new Date(date);

    while (remainingMinutes > 0) {
        newDate.setMinutes(newDate.getMinutes() + 1);

        // Si on dépasse 18h → passer au lendemain à 9h
        if (newDate.getHours() >= 18) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 0, 0, 0);
        }

        // Si on est sur un jour non ouvré (week-end ou férié), sauter au jour ouvré suivant
        while (!isBusinessDay(newDate)) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 0, 0, 0); // Commencer à 9h le jour ouvré suivant
        }

        remainingMinutes--;
    }

    return newDate;
};

// 📆 Ajoute un certain nombre de jours ouvrés à une date donnée
const addBusinessDays = (date, days) => {
    let remainingDays = days;
    let newDate = new Date(date);

    while (remainingDays > 0) {
        newDate.setDate(newDate.getDate() + 1); // Avance d'un jour

        // Saute les jours non ouvrés (week-ends + fériés)
        while (!isBusinessDay(newDate)) {
            newDate.setDate(newDate.getDate() + 1);
        }

        remainingDays--;
    }

    return newDate;
};

module.exports = { addBusinessHours, addBusinessDays };
