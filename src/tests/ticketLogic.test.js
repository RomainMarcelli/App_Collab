const { calculateDeadline, calculateAlertTime } = require('../controllers/ticketController');
const moment = require('moment-timezone');

describe("Gestion des jours fériés (09/06/2025 - Lundi de Pentecôte)", () => {

  test("P4 créé le 06/06/2025 à 10h00 → deadline au 11/06 à 10h00", () => {
    const priority = "4";
    const creationDate = moment.tz("06/06/2025 10:00:00", "DD/MM/YYYY HH:mm:ss", "Europe/Paris").toDate();

    const deadline = calculateDeadline(priority, creationDate);
    const alertTime = calculateAlertTime(priority, creationDate);

    expect(deadline.toISOString()).toBe(new Date("2025-06-11T10:00:00.000Z").toISOString());
    expect(alertTime.toISOString()).toBe(new Date("2025-06-11T07:00:00.000Z").toISOString()); // 3h avant
  });

  test("P3 créé le 06/06/2025 à 10h00 → deadline au 10/06 à 18h00", () => {
    const priority = "3";
    const creationDate = moment.tz("06/06/2025 10:00:00", "DD/MM/YYYY HH:mm:ss", "Europe/Paris").toDate();

    const deadline = calculateDeadline(priority, creationDate);
    const alertTime = calculateAlertTime(priority, creationDate);

    expect(deadline.toISOString()).toBe(new Date("2025-06-10T16:30:00.000Z").toISOString()); // 8h ouvrées (vendredi 10h–18h = 8h)
    expect(alertTime.toISOString()).toBe(new Date("2025-06-10T15:00:00.000Z").toISOString()); // 1.5h avant
  });

  test("P2 créé le 06/06/2025 à 10h00 → deadline au 06/06 à 12h00", () => {
    const priority = "2";
    const creationDate = moment.tz("06/06/2025 10:00:00", "DD/MM/YYYY HH:mm:ss", "Europe/Paris").toDate();

    const deadline = calculateDeadline(priority, creationDate);
    const alertTime = calculateAlertTime(priority, creationDate);

    expect(deadline.toISOString()).toBe(new Date("2025-06-06T12:00:00.000Z").toISOString());
    expect(alertTime.toISOString()).toBe(new Date("2025-06-06T11:00:00.000Z").toISOString()); // 1h avant
  });
});
