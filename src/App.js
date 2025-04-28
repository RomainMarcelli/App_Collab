import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTicketForm from './components/Tickets/CreateTicketForm';
import ViewTickets from './components/Tickets/ViewTickets';
import CreateCollab from './components/Collab/CreateCollab';
import CollaborateursList from './components/Collab/CollaborateursList';
import AffecterTickets from './components/Tickets/AffecterTickets';
import ViewName from './components/Collab/viewName';
import ListTicketClose from './components/Tickets/ListTicketClose';
// import TicketTestPage from '../backup/test/TicketTestPage';
// import TicketsView from '../backup/view/viewTicket';
// import TimerManagerWithForm from '../backup/test/TimerManagerWithForm';
// import TicketsList from '../backup/test/TicketsList';

import Notif from './components/Notif/notif.js'

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/notif" element={<Notif />} />
                    <Route path="/create-ticket" element={<CreateTicketForm />} />
                    <Route path="/view-tickets" element={<ViewTickets />} />
                    <Route path="/create-collab" element={<CreateCollab />} />
                    <Route path="/view-collab" element={<CollaborateursList />} />
                    <Route path="/affecter-ticket" element={<AffecterTickets />} />
                    <Route path="/view-name" element={<ViewName />} />
                    <Route path="/ticket-close" element={<ListTicketClose />} />
                    {/* <Route path="/ticket-page" element={<TicketTestPage />} />
                    <Route path="/ticket-view" element={<TicketsView />} />
                    <Route path="/timer-view" element={<TimerManagerWithForm />} />
                    <Route path="/tickets" element={<TicketsList />} /> */}
                    {/* Route par défaut */}
                    <Route exact path="/" element={<Notif />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
