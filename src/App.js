import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTicketForm from './components/Tickets/CreateTicketForm';
import ViewTickets from './components/Tickets/ViewTickets';
import CreateCollab from './components/Collab/CreateCollab';
import CollaborateursList from './components/Collab/CollaborateursList';
import AffecterTickets from './components/Tickets/AffecterTickets';
import ViewName from './components/Collab/viewName';


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
                    <Route path="/view-name" element={<ViewName />} />
                    {/* Route par défaut */}
                    <Route exact path="/" element={<CreateTicketForm />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
