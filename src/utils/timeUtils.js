const addBusinessHours = (date, hours) => {
    let remainingHours = hours;
    let newDate = new Date(date);

    while (remainingHours > 0) {
        newDate.setHours(newDate.getHours() + 1);

        // Vérifier si on est hors des heures de travail
        if (newDate.getHours() >= 18) {
            // Aller au jour suivant à 9h du matin
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 0, 0, 0);
        }

        // Ignorer les week-ends (optionnel)
        if (newDate.getDay() === 6) newDate.setDate(newDate.getDate() + 2); // Samedi → Lundi
        if (newDate.getDay() === 0) newDate.setDate(newDate.getDate() + 1); // Dimanche → Lundi

        remainingHours--;
    }
    return newDate;
};

module.exports = { addBusinessHours };
