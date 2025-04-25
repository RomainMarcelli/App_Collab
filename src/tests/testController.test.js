// src/tests/testController.test.js

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Ticket = require('../models/ticketModel');

require('dotenv').config({ path: '.env.test' });

// ✅ Mock Discord.js pour éviter les appels réels
jest.mock('discord.js', () => ({
    Client: jest.fn(() => ({
        login: jest.fn(),
        on: jest.fn(),
        once: jest.fn()
    })),
    GatewayIntentBits: {},
}));

// ✅ Mock du ticketBot
jest.mock('../Discord/ticketBot', () => ({
    ticketClient: {
        channels: {
            cache: {
                get: jest.fn(() => ({
                    send: jest.fn()
                }))
            }
        },
        login: jest.fn()
    },
    cleanMessagesWithoutTicket: jest.fn()
}));

beforeAll(async () => {
    await mongoose.disconnect(); // 👈 important pour éviter les conflits de connexions
    await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterEach(async () => {
    await Ticket.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Ticket Controller', () => {
    let ticketId;

    it('should save extracted tickets', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .send([
                {
                    ticketNumber: 'I250425_001',
                    priority: '2',
                    lastUpdate: '25/04/2025 10:00:00'
                }
            ]);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Tickets enregistrés avec succès !');

        const ticket = await Ticket.findOne({ ticketNumber: 'I250425_001' });
        expect(ticket).not.toBeNull();
        ticketId = ticket._id;
    });

    it('should reject ticket with missing fields', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .send([
                {
                    ticketNumber: 'I999999_999'
                    // missing priority & lastUpdate
                }
            ]);

        expect(response.statusCode).toBe(400);
    });

    it('should retrieve extracted tickets', async () => {
        await Ticket.create({
            ticketNumber: 'I250425_001',
            priority: '2',
            lastUpdate: new Date(),
            deadline: new Date(),
            alertTime: new Date()
        });

        const response = await request(app).get('/api/tickets');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update a ticket', async () => {
        const ticket = await Ticket.create({
            ticketNumber: 'I250425_001',
            priority: '2',
            lastUpdate: new Date(),
            deadline: new Date(),
            alertTime: new Date()
        });
        ticketId = ticket._id;

        const response = await request(app)
            .put(`/api/tickets/${ticketId}`)
            .send({ createdAt: '26/04/2025 11:00:00' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Ticket mis à jour avec succès');
    });

    it('should delete a ticket', async () => {
        const ticket = await Ticket.create({
            ticketNumber: 'I250425_001',
            priority: '2',
            lastUpdate: new Date(),
            deadline: new Date(),
            alertTime: new Date()
        });

        const response = await request(app).delete(`/api/tickets/${ticket._id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Ticket supprimé avec succès !');
    });

    it('should handle missing ticket for deletion', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).delete(`/api/tickets/${fakeId}`);
        expect(response.statusCode).toBe(404);
    });
});
