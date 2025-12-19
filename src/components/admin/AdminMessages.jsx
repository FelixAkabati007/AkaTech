import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Icons } from "@components/ui/Icons";
import { format } from "date-fns";
import { useToast } from "@components/ui/ToastProvider";

const socket = io("http://localhost:3001");

export const AdminMessages = () => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();

    socket.on("new_message", (msg) => {
      setMessages((prev) => [msg, ...prev]);
      addToast(`New message from ${msg.name}`, "info");
    });

    return () => {
      socket.off("new_message");
    };
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // In a real app, use the token from context or storage
      const loginRes = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      const loginData = await loginRes.json();
      const token = loginData.token;

      const res = await fetch(`http://localhost:3001/api/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updatedMsg = await res.json();

      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? updatedMsg : msg))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(updatedMsg);
      }
      addToast(`Message marked as ${newStatus}`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update status", "error");
    }
  };

  const handleExport = () => {
    try {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Subject",
        "Content",
        "Date",
        "Status",
      ];
      const csvContent = [
        headers.join(","),
        ...messages.map((msg) =>
          [
            msg.id,
            `"${msg.name}"`,
            `"${msg.email}"`,
            `"${msg.subject}"`,
            `"${msg.content.replace(/"/g, '""')}"`, // Basic CSV escaping
            msg.timestamp,
            msg.status,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `messages-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("Messages exported successfully", "success");
    } catch (err) {
      addToast("Failed to export messages", "error");
    }
  };

  const fetchMessages = async () => {
    try {
      const loginRes = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      const loginData = await loginRes.json();
      const token = loginData.token;

      const res = await fetch("http://localhost:3001/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.reverse()); // Show newest first
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === "all" || msg.status === filter;
    const matchesSearch =
      (msg.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (msg.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (msg.subject || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Messages
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage client inquiries and communications.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2"
            title="Export to CSV"
          >
            <Icons.Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <div className="relative flex-1 md:flex-none">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-akatech-gold text-gray-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-akatech-gold text-gray-900 dark:text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading messages...
        </div>
      ) : (
        <div className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">
                  Client
                </th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white hidden md:table-cell">
                  Subject
                </th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredMessages.map((msg) => (
                <tr
                  key={msg.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {msg.name}
                    </div>
                    <div className="text-gray-500 text-xs">{msg.email}</div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 hidden md:table-cell max-w-xs truncate">
                    {msg.subject}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                    {format(new Date(msg.timestamp), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        msg.status === "unread"
                          ? "bg-akatech-gold/10 text-akatech-gold"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="text-akatech-gold hover:underline text-xs font-bold uppercase tracking-wider"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMessages.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white dark:bg-akatech-card max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Message Details
              </h3>
              <button onClick={() => setSelectedMessage(null)}>
                <Icons.X className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                    From
                  </label>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {selectedMessage.name}
                  </p>
                  <p className="text-sm text-akatech-gold">
                    {selectedMessage.email}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                    Received
                  </label>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {format(new Date(selectedMessage.timestamp), "PPpp")}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                  Subject
                </label>
                <p className="font-medium text-gray-900 dark:text-white text-lg">
                  {selectedMessage.subject}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-lg border border-gray-200 dark:border-white/5">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-3">
                  Message Content
                </label>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                  {selectedMessage.content}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 text-[10px] text-gray-400 flex flex-wrap gap-4 font-mono">
                <span>IP: {selectedMessage.ip}</span>
                <span className="truncate max-w-xs">
                  UA: {selectedMessage.userAgent}
                </span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 flex-wrap">
              <button
                onClick={() =>
                  handleStatusUpdate(
                    selectedMessage.id,
                    selectedMessage.status === "read" ? "unread" : "read"
                  )
                }
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-akatech-gold border border-akatech-gold hover:bg-akatech-gold hover:text-black transition-colors"
              >
                Mark as {selectedMessage.status === "read" ? "Unread" : "Read"}
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="px-6 py-2 bg-akatech-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center"
              >
                Reply
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
