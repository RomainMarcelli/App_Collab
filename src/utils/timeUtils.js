const addBusinessHours = (date, hours) => {
    let remainingMinutes = hours * 60; // ✅ Convertir en minutes pour éviter les arrondis
    let newDate = new Date(date);

    while (remainingMinutes > 0) {
        newDate.setMinutes(newDate.getMinutes() + 1);

        // ✅ Vérifier si on est hors des heures de travail (9h-18h)
        if (newDate.getHours() >= 18) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 0, 0, 0);
        }

        // ✅ Ignorer les week-ends (Samedi → Lundi, Dimanche → Lundi)
        if (newDate.getDay() === 6) newDate.setDate(newDate.getDate() + 2);
        if (newDate.getDay() === 0) newDate.setDate(newDate.getDate() + 1);

        remainingMinutes--;
    }

    return newDate;
};


module.exports = { addBusinessHours };
