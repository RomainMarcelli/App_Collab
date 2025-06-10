const moment = require('moment-timezone');
const { isBusinessDay, addBusinessHours, subtractBusinessHours } = require('./timeUtils');

const TIMEZONE = "Europe/Paris";

const calculateDeadline = (priority, lastUpdate) => {
    let date = moment.tz(lastUpdate, TIMEZONE);

    // Avancer au prochain jour ouvré à 9h si férié/weekend
    while (!isBusinessDay(date.toDate())) {
        date = date.add(1, 'day').hour(9).minute(0).second(0).millisecond(0);
    }

    // Forcer à 9h du matin
    date = date.hour(9).minute(0).second(0).millisecond(0);

    if (priority === "4" || priority === "5") {
        if (date.hour() >= 16) {
            date = date.add(1, 'day').hour(9);
            while (!isBusinessDay(date.toDate())) {
                date = date.add(1, 'day');
            }
        }
        return date.add(priority === "4" ? 3 : 5, 'days').toDate();
    }

    const hoursByPriority = { "1": 1, "2": 2, "3": 8 };
    const hours = hoursByPriority[priority] || 0;
    return addBusinessHours(date.toDate(), hours);
};

const calculateAlertTime = (priority, lastUpdate) => {
    let date = moment.tz(lastUpdate, TIMEZONE);

    while (!isBusinessDay(date.toDate())) {
        date = date.add(1, 'day').hour(9).minute(0).second(0).millisecond(0);
    }

    date = date.hour(9).minute(0).second(0).millisecond(0);

    const deadline = calculateDeadline(priority, date.toDate());

    switch (priority) {
        case "1": return addBusinessHours(date.toDate(), 10 / 60);
        case "2": return subtractBusinessHours(deadline, 1);
        case "3": return subtractBusinessHours(deadline, 1.5);
        case "4":
        case "5": return subtractBusinessHours(deadline, 3);
        default: return date.toDate();
    }
};

module.exports = {
    calculateDeadline,
    calculateAlertTime
};
