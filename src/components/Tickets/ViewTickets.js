import React, { useState, useEffect } from 'react';
import Navbar from '../navbar'; // Assurez-vous que le chemin est correct

const ViewTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [timers, setTimers] = useState({}); // Garde une trace des timers pour chaque ticket

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tickets');
            const data = await response.json();
            if (response.ok) {
                setTickets(data);
            } else {
                console.log('Erreur côté serveur :', data);
                alert('Erreur lors de la récupération des tickets : ' + data.message);
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
            alert('Erreur réseau : ' + error.message);
        }
    };

    // Calculer le temps restant en fonction de la priorité et de la date d'émission
    const calculateRemainingTime = (priority, dateEmission) => {
        // Durées en fonction des priorités
        const priorityDurations = {
            '1': 15 * 60 * 1000, // 15 minutes
            '2': 30 * 60 * 1000, // 30 minutes
            '3': 4 * 60 * 60 * 1000, // 4 heures
            '4': 35 * 60 * 60 * 1000, // 35 heures
            '5': 2 * 24 * 60 * 60 * 1000, // 2 jours
        };

        const now = new Date().getTime(); // Heure actuelle en millisecondes
        const emissionTime = new Date(dateEmission).getTime(); // Date d'émission en millisecondes
        const elapsedTime = now - emissionTime; // Temps écoulé depuis la date d'émission

        // Calculer le temps restant
        const remainingTime = priorityDurations[priority] - elapsedTime;
        return remainingTime > 0 ? remainingTime : 0; // Retourne 0 si le temps est écoulé
    };

    const startTimers = () => {
        const newTimers = {};
        tickets.forEach((ticket) => {
            const remainingTime = calculateRemainingTime(ticket.priorite, ticket.dateEmission);
            newTimers[ticket._id] = remainingTime;
        });
        setTimers(newTimers);

        // Mettre à jour les timers toutes les secondes
        const interval = setInterval(() => {
            setTimers((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                for (const id in updatedTimers) {
                    if (updatedTimers[id] > 0) {
                        updatedTimers[id] -= 1000; // Réduire 1 seconde
                    }
                }
                return updatedTimers;
            });
        }, 1000);

        return () => clearInterval(interval); // Nettoyer l'intervalle
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (tickets.length > 0) {
            startTimers();
        }
    }, [tickets]);

    // Formater une durée en hh:mm:ss
    const formatTime = (timeInMillis) => {
        const totalSeconds = Math.floor(timeInMillis / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}h:${minutes
            .toString()
            .padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`;
    };

    const handleDelete = async (ticketId) => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce ticket ?");
        if (confirmed) {
            await deleteTicket(ticketId);
            fetchTickets();
        }
    };

    const deleteTicket = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Erreur de suppression:', errorData);
                return;
            }

            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Erreur lors de la requête DELETE:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        console.log("Date reçue dans ViewTicket:", date);

        // Utilise Intl.DateTimeFormat pour forcer le fuseau horaire et formater la date
        const formatter = new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/Paris', // Assurez-vous d'indiquer le bon fuseau horaire
        });

        return formatter.format(date);
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center">Liste des Tickets</h1>
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {tickets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Numéro du Ticket</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Priorité</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Sujet</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Description</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Bénéficiaire</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Date d'émission</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Temps restant</th>
                                        <th className="py-2 px-4 border border-gray-300 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.numeroTicket}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.priorite}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.sujet}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.description}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{ticket.beneficiaire}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">{formatDate(ticket.dateEmission)}</td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                {timers[ticket._id] !== undefined
                                                    ? formatTime(timers[ticket._id])
                                                    : 'Calcul en cours...'}
                                            </td>
                                            <td className="py-2 px-4 border border-gray-300 text-center">
                                                <button
                                                    onClick={() => handleDelete(ticket._id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center">Aucun ticket disponible.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewTicket;
