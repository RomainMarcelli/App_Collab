import React, { useEffect, useState } from 'react';
import Navbar from '../navbar';
import { getPriorityColor } from '../../utils/ticketUtils'; // Import the utility functions
import TicketTable from './TicketTable';
import EditTicketForm from './EditTicketForm';
import Tooltip from './Tooltip';
import Popup from './Popup';

// const Collaborateur = require('../models/collabModel');


const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [collaborateurs, setCollaborateurs] = useState([]); // État pour les collaborateurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, description: '', x: 0, y: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [timers, setTimers] = useState({}); // Timer state
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [closedTickets, setClosedTickets] = useState([]); // Store closed ticket IDs
    const [isPopupDisplayed, setIsPopupDisplayed] = useState(false); // Nouveau drapeau


    // Define SLA and timer durations based on ticket priorities
    // const slaDurations = {
    //     1: 1 * 60 * 60 * 1000,
    //     2: 2 * 60 * 60 * 1000,
    //     3: 8 * 60 * 60 * 1000,
    //     4: 2 * 24 * 60 * 60 * 1000,
    //     5: 5 * 24 * 60 * 60 * 1000,
    // };

    const timerDurations = {
        1: 1 * 10 * 1000,         // 30 minutes for P1
        2: 1 * 60 * 60 * 1000,     // 1 hour for P2
        3: 4 * 60 * 60 * 1000,     // 4 hours for P3
        4: 35 * 60 * 60 * 1000,    // 35 hours for P4
        5: 72 * 60 * 60 * 1000, // 1 week in milliseconds
    };
    const [formData, setFormData] = useState({
        numeroTicket: '',
        priorite: '1',
        sujet: '',
        description: '',
        beneficiaire: '',
        dateEmission: '',
    });

    // Mise à jour des timers
    const updateTimers = () => {
        setTimers(prevTimers => {
            const newTimers = { ...prevTimers };
            tickets.forEach(ticket => {
                // Skip closed tickets
                if (closedTickets.includes(ticket._id)) return;

                const now = Date.now();
                const ticketStartTime = new Date(ticket.dateEmission).getTime();
                const elapsedTime = now - ticketStartTime;

                const totalDuration = timerDurations[ticket.priorite];
                const remainingTime = totalDuration - elapsedTime;

                // Met à jour les minuteries
                newTimers[ticket._id] = remainingTime <= 0 ? 0 : remainingTime;
            });
            return newTimers;
        });
    };

    const fetchCollaborateurs = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/collaborateurs');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des collaborateurs');
            }
            const data = await response.json();
            setCollaborateurs(data); // Stockage des collaborateurs
        } catch (error) {
            console.error(error);
        }
    };

    // Gérer l'affichage de la popup en fonction des timers
    const checkPopupDisplay = () => {
        tickets.forEach(ticket => {
            if (!closedTickets.includes(ticket._id)) {
                const now = Date.now();
                const ticketStartTime = new Date(ticket.dateEmission).getTime();
                const elapsedTime = now - ticketStartTime;

                const totalDuration = timerDurations[ticket.priorite];
                const remainingTime = totalDuration - elapsedTime;

                // Afficher la popup si le temps est écoulé
                if (remainingTime <= 0) {
                    setPopupMessage(`Il faut relancer le ticket ${ticket.numeroTicket} c'est une P${ticket.priorite}`);
                    setPopupVisible(true);
                }
            }
        });
    };

    const handleClosePopup = () => {
        console.log("Message popup:", popupMessage);

        // Extraction du numéro de ticket
        const ticketNumber = popupMessage.split(' ')[5]; // Vérifiez l'index en fonction du format
        console.log("Numéro de ticket extrait:", ticketNumber);

        // Recherche du ticket à fermer
        const ticketToClose = tickets.find(ticket => ticket.numeroTicket === ticketNumber);

        // Affichage des tickets disponibles et du ticket trouvé
        console.log("Tickets disponibles:", tickets);
        console.log("Ticket trouvé:", ticketToClose);

        if (ticketToClose) {
            setClosedTickets(prev => [...prev, ticketToClose._id]); // Ajout du ticket fermé
            setPopupVisible(false); // Fermeture de la popup
            console.log("Popup fermée.");
        } else {
            console.error("Ticket non trouvé pour le numéro:", ticketNumber);
        }
    };

    // useEffect pour récupérer les tickets
    useEffect(() => {
        fetchCollaborateurs(); // Récupération des collaborateurs
        fetchTickets();
    }, []);

    // useEffect pour mettre à jour les timers
    useEffect(() => {
        const interval = setInterval(() => {
            updateTimers();
        }, 1000); // Met à jour les timers toutes les secondes

        return () => clearInterval(interval);
    }, [tickets]);

    // useEffect pour vérifier l'affichage de la popup
    useEffect(() => {
        const interval = setInterval(() => {
            checkPopupDisplay();
        }, 10000); // Vérifie l'affichage de la popup toutes les secondes

        return () => clearInterval(interval);
    }, [tickets]);



    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tickets');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des tickets');
            }
            const data = await response.json();
            setTickets(data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleEdit = (ticket) => {
        if (editingTicket && editingTicket._id === ticket._id) {
            // Fermez le tooltip si c'est le même ticket
            setEditingTicket(null); // Assurez-vous de réinitialiser le ticket en cours d'édition
        } else {
            // Ouvrez le tooltip et définissez le ticket à éditer
            setEditingTicket(ticket);
            setTooltipVisible(true);
        }
    };
    const handleUpdateTicket = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${editingTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingTicket),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du ticket');
            }

            setEditingTicket(null);
            fetchTickets();
        } catch (error) {
            console.error('Erreur de mise à jour:', error);
        }
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

    const handleMouseOver = (e, description) => {
        setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            description: description,
        });
    };

    const handleMouseOut = () => {
        setTooltip({ visible: false, x: 0, y: 0, description: '' });
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    async function handleCloseTicket(ticketId) {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/close`, {
                method: 'POST',
            });
    
            if (!response.ok) {
                throw new Error(`Erreur lors de la clôture du ticket: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Ticket fermé avec succès:', data);
    
        } catch (error) {
            console.error('Erreur de clôture du ticket:', error); // Afficher l'erreur complète dans la console
            alert('Une erreur est survenue lors de la fermeture du ticket. Veuillez réessayer.');
        }
    }

    if (loading) {
        return <p className="text-center">Chargement des tickets...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Erreur : {error}</p>;
    }

    return (
        <div>
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">Gestion des Tickets</h1>

            <TicketTable
                tickets={tickets}
                collaborateurs={collaborateurs}
                getPriorityColor={getPriorityColor}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleCloseTicket={handleCloseTicket}
                tooltip={tooltip}
                handleMouseOver={handleMouseOver}
                handleMouseOut={handleMouseOut}
                formatTime={formatTime}
                timers={timers}
            />
            <Tooltip tooltip={tooltip} />
            <Popup
                popupVisible={popupVisible}
                popupMessage={popupMessage}
                handleClose={handleClosePopup}
            />

            {editingTicket && (
                <EditTicketForm
                    editingTicket={editingTicket}
                    setEditingTicket={setEditingTicket}
                    handleUpdateTicket={handleUpdateTicket}
                />
            )}
        </div>
    );
};

export default ViewTickets;