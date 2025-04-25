const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils'); // adapte le chemin si besoin

describe('Tests avancés de addBusinessHours et addBusinessDays', () => {
  const testCases = [
    {
      label: "Ajout de 4h avant un jour férié (Ascension)",
      inputDate: new Date("2025-05-28T16:00:00"),
      hoursToAdd: 4,
      expectedHoursResult: new Date("2025-05-30T11:00:00"), // ✅ CORRECT
      daysToAdd: 2,
      expectedDaysResult: new Date("2025-06-02T16:00:00"), // ✅ CORRIGÉ ici !
    },
    {
      label: "Ajout de 8h autour de Noël (jour férié récurrent)",
      inputDate: new Date("2025-12-24T17:00:00"),
      hoursToAdd: 8,
      expectedHoursResult: new Date("2025-12-26T16:00:00"),
      daysToAdd: 2,
      expectedDaysResult: new Date("2025-12-29T17:00:00"),
    },
    {
      label: "Ajout de 1 jour ouvré depuis vendredi",
      inputDate: new Date("2025-04-18T10:00:00"),
      hoursToAdd: 0,
      daysToAdd: 1,
      expectedDaysResult: new Date("2025-04-21T10:00:00"),
    },
  ];

  testCases.forEach(({ label, inputDate, hoursToAdd, expectedHoursResult, daysToAdd, expectedDaysResult }) => {
    if (hoursToAdd && expectedHoursResult) {
      test(`${label} - addBusinessHours`, () => {
        const result = addBusinessHours(new Date(inputDate), hoursToAdd);
        expect(result.toISOString()).toBe(expectedHoursResult.toISOString());
      });
    }

    if (daysToAdd && expectedDaysResult) {
      test(`${label} - addBusinessDays`, () => {
        const result = addBusinessDays(new Date(inputDate), daysToAdd);
        expect(result.toISOString()).toBe(expectedDaysResult.toISOString());
      });
    }
  });
});
