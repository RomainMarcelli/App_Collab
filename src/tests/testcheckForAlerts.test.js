const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel");
const { checkForAlerts } = require("../controllers/ticketController");

// ✅ Mock du channel Discord
const sendMock = jest.fn();

const mockClient = {
    channels: {
        cache: {
            get: jest.fn(() => ({
                send: sendMock
            }))
        }
    }
};

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/ticketAlertTest", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterEach(async () => {
    await Ticket.deleteMany();
    sendMock.mockClear();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("checkForAlerts - Ignorer les tickets figés", () => {
    it("ne doit pas envoyer d'alerte pour un ticket frozen=true", async () => {
        await Ticket.create({
            ticketNumber: "I777777_001",
            priority: "2",
            lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
            alertTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // Alerte déjà passée
            alertSent: false,
            frozen: true
        });

        await checkForAlerts(mockClient);

        expect(sendMock).not.toHaveBeenCalled(); // ✅ Le ticket figé est ignoré
    });

    it("doit envoyer une alerte si frozen est false", async () => {
        await Ticket.create({
            ticketNumber: "I777777_002",
            priority: "2",
            lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
            alertTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            alertSent: false,
            frozen: false
        });

        await checkForAlerts(mockClient);

        expect(sendMock).toHaveBeenCalledTimes(1); // ✅ Ticket non figé → alerte envoyée
    });
});
