import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTicketForm from './components/CreateTicketForm';
import ViewTickets from './components/ViewTickets';
import CreateCollab from './components/CreateCollab';
import CollaborateursList from './components/CollaborateursList';
import AffecterTickets from './components/AffecterTickets';


const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/create-ticket" element={<CreateTicketForm />} />
                    <Route path="/view-tickets" element={<ViewTickets />} />
                    <Route path="/create-collab" element={<CreateCollab />} />
                    <Route path="/view-collab" element={<CollaborateursList />} />
                    <Route path="/affecter-ticket" element={<AffecterTickets />} />
                    {/* Route par défaut */}
                    <Route exact path="/" element={<CreateTicketForm />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
