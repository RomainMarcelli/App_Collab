import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTicketForm from './components/CreateTicketForm';
import ViewTickets from './components/ViewTickets';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/create-ticket" element={<CreateTicketForm />} />
                    <Route path="/view-tickets" element={<ViewTickets />} />
                    {/* Route par défaut */}
                    <Route exact path="/" element={<CreateTicketForm />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
