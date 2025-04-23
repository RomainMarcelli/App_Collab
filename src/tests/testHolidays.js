const { addBusinessHours, addBusinessDays } = require('../utils/timeUtils'); // adapte le chemin si besoin

const testCases = [
    {
        label: "📅 Ajout de 4h avant un jour férié (Ascension)",
        inputDate: new Date("2025-05-28T16:00:00"), // veille de l'Ascension (29 mai 2025)
        hoursToAdd: 4,
        daysToAdd: 2
    },
    {
        label: "🎄 Ajout de 8h autour de Noël (jour férié récurrent)",
        inputDate: new Date("2025-12-24T17:00:00"),
        hoursToAdd: 8,
        daysToAdd: 2
    },
    {
        label: "🕘 Ajout de 1 jour ouvré depuis vendredi (doit sauter le week-end)",
        inputDate: new Date("2025-04-18T10:00:00"), // Vendredi
        hoursToAdd: 0,
        daysToAdd: 1
    },
    {
        label: "🛑 Test sur 1er mai (jour férié récurrent)",
        inputDate: new Date("2025-04-30T17:30:00"),
        hoursToAdd: 2,
        daysToAdd: 1
    },
    {
        label: "🔁 Ajout de 16h réparties sur plusieurs jours (inclut férié et week-end)",
        inputDate: new Date("2025-05-07T16:00:00"),
        hoursToAdd: 16,
        daysToAdd: 4
    }
];

console.log("\n=== TESTS AVANCÉS addBusinessHours / addBusinessDays ===\n");

testCases.forEach(({ label, inputDate, hoursToAdd, daysToAdd }, index) => {
    console.log(`\n🧪 Cas #${index + 1} — ${label}`);
    console.log("🕒 Date de départ :", inputDate.toLocaleString());

    if (hoursToAdd) {
        const result = addBusinessHours(new Date(inputDate), hoursToAdd);
        console.log(`⏱️ ${hoursToAdd}h ouvrées ➡️ ${result.toLocaleString()}`);
    }

    if (daysToAdd) {
        const result = addBusinessDays(new Date(inputDate), daysToAdd);
        console.log(`📆 ${daysToAdd} jour(s) ouvré(s) ➡️ ${result.toLocaleString()}`);
    }
});

console.log("\n✅ Tous les cas ont été testés !");



// Changement de couleur quand un ticket est pris . quand un ticket est pris en compte avce un pouce 
// Donc enlever la focntion de supprimer l'historique des msg du bot