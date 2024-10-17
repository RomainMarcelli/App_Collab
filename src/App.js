import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTicketForm from './components/CreateTicketForm';
import ViewTickets from './components/ViewTickets';
import CreateCollab from './components/CreateCollab';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/create-ticket" element={<CreateTicketForm />} />
                    <Route path="/view-tickets" element={<ViewTickets />} />
                    <Route path="/create-collab" element={<CreateCollab />} />
                    {/* Route par défaut */}
                    <Route exact path="/" element={<CreateTicketForm />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
