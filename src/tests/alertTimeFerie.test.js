const moment = require('moment-timezone');
const { calculateDeadline, calculateAlertTime } = require('../utils/slaUtils');

describe("Vérification du calcul d'alertTime sur jour férié (Lundi de Pentecôte)", () => {
  test("Ticket P3 créé le lundi férié 09/06/2025 à 10h doit être traité comme créé le mardi 10/06 à 9h", () => {
    const priority = "3";
    const creationDate = moment.tz("09/06/2025 10:00:00", "DD/MM/YYYY HH:mm:ss", "Europe/Paris").toDate();

    // Attendus en heure de Paris (non convertis en UTC)
    const expectedDeadline = "2025-06-10 18:00";
    const expectedAlertTime = "2025-06-10 16:30";

    const deadline = calculateDeadline(priority, creationDate);
    const alertTime = calculateAlertTime(priority, creationDate);

    const deadlineParis = moment.tz(deadline, "Europe/Paris").format("YYYY-MM-DD HH:mm");
    const alertTimeParis = moment.tz(alertTime, "Europe/Paris").format("YYYY-MM-DD HH:mm");

    expect(deadlineParis).toBe(expectedDeadline);
    expect(alertTimeParis).toBe(expectedAlertTime);
  });
});
