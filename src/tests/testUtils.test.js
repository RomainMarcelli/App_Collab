const { addBusinessHours, addBusinessDays } = require("../utils/timeUtils");

const formatDate = (date) =>
  date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

describe("Test addBusinessHours", () => {
  test("🕒 Heure avant 9h → commence à 9h", () => {
    const d1 = new Date("2025-04-28T07:00:00");
    const result = addBusinessHours(d1, 1.5);
    expect(formatDate(result)).toBe("28/04/2025 10:30:00");
  });

  test("🕒 Heure après 18h → commence lendemain à 9h", () => {
    const d2 = new Date("2025-04-28T19:00:00");
    const result = addBusinessHours(d2, 2);
    expect(formatDate(result)).toBe("29/04/2025 11:00:00");
  });

  test("🕒 Milieu de journée", () => {
    const d3 = new Date("2025-04-28T14:00:00");
    const result = addBusinessHours(d3, 3.5);
    expect(formatDate(result)).toBe("28/04/2025 17:30:00");
  });

  test("🕒 Fin de journée déborde sur lendemain", () => {
    const d4 = new Date("2025-04-28T16:30:00");
    const result = addBusinessHours(d4, 2);
    expect(formatDate(result)).toBe("29/04/2025 09:30:00");
  });
});

describe("Test addBusinessDays", () => {
  test("📅 Jour classique +3 jours ouvrés", () => {
    const d5 = new Date("2025-04-28T09:00:00");
    const result = addBusinessDays(d5, 3);
    // ⚠️ CORRECTION importante ici
    expect(formatDate(result)).toBe("02/05/2025 09:00:00");
  });

  test("📅 Vendredi +1 jour ouvré => lundi", () => {
    const d6 = new Date("2025-04-25T09:00:00");
    const result = addBusinessDays(d6, 1);
    expect(formatDate(result)).toBe("28/04/2025 09:00:00");
  });
});
