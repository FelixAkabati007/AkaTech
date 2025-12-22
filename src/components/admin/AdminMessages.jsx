import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";

/**
 * AdminMessages Component
 *
 * Provides an email-like interface for managing inquiries and support messages.
 * Features:
 * - Inbox view with "All" and "Unread" filters
 * - Split-pane layout (List + Detail view)
 * - "Reply via Email" integration
 * - Delete and Mark as Read functionality
 * - Responsive design with mobile-friendly navigation
 */
export const AdminMessages = () => {
  // State for message data and UI interactions
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread

  useEffect(() => {
    loadMessages();
  }, []);

  /**
   * Fetches messages from the service
   */
  const loadMessages = () => {
    setMessages(mockService.getMessages());
  };

  /**
   * Deletes a message and updates local state
   * @param {Event} e - Click event
   * @param {number} id - Message ID
   */
  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this message?")) {
      mockService.deleteMessage(id);
      loadMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  /**
   * Selects a message for detailed view and marks it as read
   * @param {Object} message - The selected message object
   */
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      mockService.markMessageRead(message.id);
      loadMessages();
    }
  };

  // Filter messages based on current filter state
  const filteredMessages = messages.filter((msg) => {
    if (filter === "unread") return !msg.read;
    return true;
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 p-6">
      {/* Message List */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm ${
          selectedMessage ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icons.MessageSquare className="w-5 h-5 text-akatech-gold" />
            Inbox
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === "all"
                  ? "bg-akatech-gold text-white"
                  : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/20"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === "unread"
                  ? "bg-akatech-gold text-white"
                  : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/20"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No messages found.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative group ${
                    selectedMessage?.id === msg.id
                      ? "bg-akatech-gold/10 dark:bg-akatech-gold/5"
                      : ""
                  } ${
                    !msg.read ? "border-l-4 border-akatech-gold pl-3" : "pl-4"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`text-sm font-medium ${
                        !msg.read
                          ? "text-gray-900 dark:text-white font-bold"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {msg.name}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {format(new Date(msg.date), "MMM d")}
                    </span>
                  </div>
                  <div
                    className={`text-sm mb-1 ${
                      !msg.read
                        ? "text-gray-900 dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {msg.subject}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1 pr-8">
                    {msg.message}
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, msg.id)}
                    className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail View */}
      <AnimatePresence mode="wait">
        {selectedMessage ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-[2] bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                    {selectedMessage.name}
                  </span>
                  <span>&lt;{selectedMessage.email}&gt;</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 text-right">
                  {format(new Date(selectedMessage.date), "MMM d, yyyy")}
                  <br />
                  {format(new Date(selectedMessage.date), "h:mm a")}
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedMessage.message}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex gap-3">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark rounded-lg transition-colors flex items-center gap-2"
              >
                <Icons.MessageSquare className="w-4 h-4" /> Reply via Email
              </a>
              <button
                onClick={(e) => handleDelete(e, selectedMessage.id)}
                className="px-4 py-2 bg-white dark:bg-transparent border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 rounded-lg transition-all flex items-center gap-2"
              >
                <Icons.Trash className="w-4 h-4" /> Delete
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:flex flex-[2] bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 items-center justify-center text-gray-400 flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <Icons.MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p>Select a message to view details</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
