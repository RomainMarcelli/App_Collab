import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import TicketTestPage from '../backup/test/TicketTestPage';
// import TicketsView from '../backup/view/viewTicket';
// import TimerManagerWithForm from '../backup/test/TimerManagerWithForm';
// import TicketsList from '../backup/test/TicketsList';
import TicketsList from "./components/Ticket/TicketsList";

// import Notif from './components/Notif/notif.js'

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    {/* <Route path="/notif" element={<Notif />} /> */}
                    <Route path="/ticketlist" element={<TicketsList />} />
                    {/* <Route path="/ticket-page" element={<TicketTestPage />} />
                    <Route path="/ticket-view" element={<TicketsView />} />
                    <Route path="/timer-view" element={<TimerManagerWithForm />} />
                    <Route path="/tickets" element={<TicketsList />} /> */}
                    {/* Route par défaut */}
                    <Route exact path="/" element={<TicketsList />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
