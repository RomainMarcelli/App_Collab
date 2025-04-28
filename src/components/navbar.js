import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/notif" className="text-white text-xl font-bold">Gestion des Tickets</Link>
                <div>
                    <Link to="/notif" className="text-gray-300 hover:text-white mx-4">Autre</Link> 
                    <Link to="/create-ticket" className="text-gray-300 hover:text-white mx-4">Créer un Ticket</Link>
                    <Link to="/view-tickets" className="text-gray-300 hover:text-white mx-4">Voir les Tickets</Link>
                    {/* <Link to="/create-collab" className="text-gray-300 hover:text-white mx-4">Crée un Collab</Link> */}
                    <Link to="/view-collab" className="text-gray-300 hover:text-white mx-4">Liste des Collab</Link>
                    <Link to="/affecter-ticket" className="text-gray-300 hover:text-white mx-4">Affecter un ticket</Link>
                    <Link to="/ticket-close" className="text-gray-300 hover:text-white mx-4">Liste ticket close</Link>
                    {/* <Link to="/ticket-view" className="text-gray-300 hover:text-white mx-4">TEST PAGE</Link>
                    <Link to="/ticket-page" className="text-gray-300 hover:text-white mx-4">SEcond test PAGE</Link>
                    <Link to="/timer-view" className="text-gray-300 hover:text-white mx-4">Timer</Link> */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
