import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterPriority, setFilterPriority] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const alertIntervalRef = useRef(null);
  const originalTitle = document.title;

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000); // 🔄 Rafraîchissement auto
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tickets");
      const data = await response.json();
      setTickets(data);
      checkAlerts(data);
      handleFilter(data); // 🔄 Applique immédiatement les filtres
    } catch (error) {
      toast.error("Erreur lors du chargement des tickets !");
    }
  };

  const checkAlerts = (tickets) => {
    const now = new Date();
    const ticketsToAlert = tickets.filter(ticket => new Date(ticket.alertTime) <= now);

    if (ticketsToAlert.length > 0) {
      startBlinking("⚠️ ALERTE TICKET ⚠️");
      ticketsToAlert.forEach(ticket => {
        toast.warning(`🚨 Alerte ! Ticket ${ticket.ticketNumber} (Priorité ${ticket.priority}) approche de la deadline.`);
      });
    }
  };

  const startBlinking = (message) => {
    if (alertIntervalRef.current) return;
    let isOriginalTitle = true;

    alertIntervalRef.current = setInterval(() => {
      document.title = isOriginalTitle ? message : originalTitle;
      isOriginalTitle = !isOriginalTitle;
    }, 1000);
  };

  const handleFilter = (data = tickets) => {
    let filtered = [...data]; // 🏷 Copie des tickets

    if (filterPriority) filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    if (filterType) filtered = filtered.filter(ticket => ticket.ticketNumber.startsWith(filterType));
    if (searchTerm) filtered = filtered.filter(ticket => ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // ✅ Trie les tickets par ordre croissant d'alertTime
    filtered.sort((a, b) => new Date(a.alertTime) - new Date(b.alertTime));

    setFilteredTickets(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [filterPriority, searchTerm, filterType, tickets]);

  return (
    <>
      <ToastContainer />
      
      {/* Boutons de navigation haut/bas */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-110"
        >
          <FaArrowUp size={20} />
        </button>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
          className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-110"
        >
          <FaArrowDown size={20} />
        </button>
      </div>

      {/* Section des filtres */}
      <div className="max-w-2xl mx-auto bg-white p-4 border-b border-gray-200 shadow-md rounded-lg mt-5">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="flex gap-4">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="p-2 border rounded-lg w-1/3">
            <option value="">Toutes priorités</option>
            {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
          </select>
          <input type="text" placeholder="Rechercher un ticket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border rounded-lg w-1/3" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 border rounded-lg w-1/3">
            <option value="">Tous types</option>
            <option value="I">Commence par I</option>
            <option value="S">Commence par S</option>
          </select>
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📋 Liste des Tickets ({filteredTickets.length})
        </h2>

        {filteredTickets.length === 0 ? (
          <p className="text-gray-500 text-center">Aucun ticket enregistré.</p>
        ) : (
          <ul className="space-y-4">
            {filteredTickets.map((ticket) => (
              <li key={ticket._id} className={`p-4 rounded-lg shadow-md border-l-4 transition transform hover:scale-105
                ${ticket.priority === "1" ? "border-red-500 bg-red-50" : ""}
                ${ticket.priority === "2" ? "border-orange-500 bg-orange-50" : ""}
                ${ticket.priority === "3" ? "border-yellow-500 bg-yellow-50" : ""}
                ${ticket.priority === "4" ? "border-blue-500 bg-blue-50" : ""}
                ${ticket.priority === "5" ? "border-green-500 bg-green-50" : ""}
              `}>
                <p className="text-lg font-semibold">🏷️ {ticket.ticketNumber}</p>
                <p className="text-gray-600"><strong>📌 Priorité :</strong> {ticket.priority}</p>
                <p className="text-gray-600"><strong>📅 Créé :</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="text-gray-700 font-semibold"><strong>⏳ Deadline :</strong> {new Date(ticket.deadline).toLocaleString()}</p>
                <p className="text-gray-700"><strong>🔔 Alerte prévue :</strong> {new Date(ticket.alertTime).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default TicketsList;
