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
    let remainingMinutes = hours * 60;
    let newDate = new Date(date);

    // 🕘 Forcer à commencer à 9h si avant, ou le lendemain à 9h si après 18h
    const hour = newDate.getHours();
    if (hour < 9) {
        newDate.setHours(9, 0, 0, 0);
    } else if (hour >= 18) {
        newDate.setDate(newDate.getDate() + 1);
        newDate.setHours(9, 0, 0, 0);
    }

    // 🧹 Sauter les jours non ouvrés si besoin
    while (!isBusinessDay(newDate)) {
        newDate.setDate(newDate.getDate() + 1);
        newDate.setHours(9, 0, 0, 0);
    }

    // ⏳ Ajout progressif des minutes dans le cadre ouvré
    while (remainingMinutes > 0) {
        newDate.setMinutes(newDate.getMinutes() + 1);

        if (newDate.getHours() >= 18) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 0, 0, 0);
        }

        while (!isBusinessDay(newDate)) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 0, 0, 0);
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

const subtractBusinessHours = (date, hours) => {
    let remainingMinutes = hours * 60;
    let newDate = new Date(date);

    while (remainingMinutes > 0) {
        newDate.setMinutes(newDate.getMinutes() - 1);

        // Si on passe avant 9h → revenir au jour ouvré précédent à 18h
        if (newDate.getHours() < 9) {
            newDate.setDate(newDate.getDate() - 1);
            newDate.setHours(18, 0, 0, 0);
        }

        // Si on tombe sur un jour non ouvré, recule jusqu’à un jour ouvré
        while (!isBusinessDay(newDate)) {
            newDate.setDate(newDate.getDate() - 1);
            newDate.setHours(18, 0, 0, 0);
        }

        remainingMinutes--;
    }

    return newDate;
};


module.exports = {
    isBusinessDay,
    addBusinessDays,
    addBusinessHours,
    subtractBusinessHours
};
