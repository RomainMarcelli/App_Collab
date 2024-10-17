import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-bold">Gestion des Tickets</Link>
                <div>
                    <Link to="/create-ticket" className="text-gray-300 hover:text-white mx-4">Créer un Ticket</Link>
                    <Link to="/view-tickets" className="text-gray-300 hover:text-white mx-4">Voir les Tickets</Link>
                    <Link to="/create-collab" className="text-gray-300 hover:text-white mx-4">Crée un Collab</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
