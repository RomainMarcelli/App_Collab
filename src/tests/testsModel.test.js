const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel"); // ← ajuste le chemin selon ton projet

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/ticketTestDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Champ frozen dans le modèle Ticket", () => {
    it("doit enregistrer un ticket avec frozen: true", async () => {
        const ticket = new Ticket({
            ticketNumber: "I654321_999",
            priority: "2",
            lastUpdate: new Date(),
            deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
            alertTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
            frozen: true
        });

        await ticket.save();

        const saved = await Ticket.findOne({ ticketNumber: "I654321_999" });

        expect(saved).not.toBeNull();
        expect(saved.frozen).toBe(true);
    });

    it("doit conserver frozen: true après une mise à jour", async () => {
        await Ticket.updateOne(
            { ticketNumber: "I654321_999" },
            { $set: { priority: "1" } }
        );

        const updated = await Ticket.findOne({ ticketNumber: "I654321_999" });

        expect(updated.priority).toBe("1");
        expect(updated.frozen).toBe(true); // frozen doit rester true
    });
});
