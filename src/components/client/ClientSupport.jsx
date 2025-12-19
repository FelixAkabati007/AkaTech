import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";

export const ClientSupport = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "Normal",
    message: "",
  });

  useEffect(() => {
    setTickets(mockService.getTickets(user.id));
  }, [user.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticket = {
      clientId: user.id,
      ...newTicket,
      status: "Open",
    };
    mockService.saveTicket(ticket);
    setTickets(mockService.getTickets(user.id));
    setIsModalOpen(false);
    setNewTicket({ subject: "", priority: "Normal", message: "" });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Urgent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          Support Tickets
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10 hover:border-akatech-gold/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {ticket.subject}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    #{ticket.id} • Created on {ticket.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {ticket.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                {ticket.message}
              </p>

              {ticket.replies && ticket.replies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <p className="text-xs text-gray-400 mb-2">Latest Reply:</p>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-akatech-gold flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      "{ticket.replies[ticket.replies.length - 1].message}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-akatech-card rounded-lg border border-dashed border-gray-200 dark:border-white/10">
            <Icons.LifeBuoy className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
            <p className="text-gray-500 dark:text-gray-400">
              No support tickets found.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-akatech-gold hover:underline text-sm font-bold"
            >
              Create your first ticket
            </button>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-akatech-card w-full max-w-lg rounded-lg shadow-xl p-6 border border-gray-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Ticket
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, priority: e.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none resize-none"
                  value={newTicket.message}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, message: e.target.value })
                  }
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
