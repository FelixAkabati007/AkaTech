import React, { useState } from "react";
import { Icons } from "@components/ui/Icons";
import { Logo } from "@components/ui/Logo";
import { Modal } from "@components/ui/Modal";
import { useToast } from "@components/ui/ToastProvider";

export const Dashboard = ({ user, onLogout }) => {
  const isAdmin = user.isAdmin || user.email.includes("admin");
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleQuickAction = (actionLabel) => {
    switch (actionLabel) {
      case "Create New Invoice":
        setActiveModal("invoice");
        break;
      case "Update Profile Settings":
        setActiveModal("profile");
        break;
      case "Contact Support":
        setActiveModal("support");
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e, type) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      addToast(`${type} successful!`, "success");
      setIsSubmitting(false);
      setActiveModal(null);
    }, 1000); // Simulate API call
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-akatech-dark pt-28 px-4 pb-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-gray-200 dark:border-white/10 pb-8 transition-colors duration-500">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-2 transition-colors duration-500">
              {isAdmin ? "Admin Console" : "Client Portal"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Logged in as{" "}
              <span className="text-akatech-gold font-bold">{user.name}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition px-4 py-2 border border-gray-300 dark:border-white/10 hover:border-akatech-gold"
          >
            <Icons.LogOut className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Sign Out</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: isAdmin ? "Total Inquiries" : "Active Projects",
              val: isAdmin ? "124" : "1",
              icon: Icons.Mail,
            },
            {
              label: isAdmin ? "Revenue (MTD)" : "Invoices Due",
              val: isAdmin ? "GH₵ 14.2k" : "GH₵ 0.00",
              icon: Icons.Activity,
            },
            {
              label: isAdmin ? "Active Users" : "Support Tickets",
              val: isAdmin ? "450" : "0",
              icon: Icons.Users,
            },
            {
              label: "System Status",
              val: "Online",
              icon: Icons.Server,
              textClass: "text-green-600 dark:text-akatech-goldLight",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-akatech-card p-6 border-l-2 border-akatech-gold shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest">
                  {stat.label}
                </span>
                <stat.icon className="text-akatech-gold w-4 h-4" />
              </div>
              <div
                className={`text-2xl font-serif text-gray-900 dark:text-white ${
                  stat.textClass || ""
                }`}
              >
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Main) */}
          <div className="lg:col-span-2 bg-white dark:bg-akatech-card p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-500 overflow-hidden">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-xl md:text-2xl font-serif text-gray-900 dark:text-white transition-colors duration-500">
                {isAdmin ? "Recent Communications" : "Project Timeline"}
              </h2>
              <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/10 ml-8 mb-2"></div>
            </div>

            {isAdmin ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="pb-4 font-normal text-xs uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="pb-4 font-normal text-xs uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="pb-4 font-normal text-xs uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {[
                      {
                        from: "client@gmail.com",
                        sub: "Quote for POS System",
                        status: "New",
                      },
                      {
                        from: "biz@yahoo.com",
                        sub: "Website Redesign",
                        status: "Read",
                      },
                      {
                        from: "shop@gmail.com",
                        sub: "Maintenance Request",
                        status: "Pending",
                      },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition"
                      >
                        <td className="py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap pr-4">
                          {row.from}
                        </td>
                        <td className="py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap pr-4">
                          {row.sub}
                        </td>
                        <td className="py-4">
                          <span className="text-[10px] uppercase font-bold bg-akatech-gold/10 text-akatech-gold px-2 py-1 rounded-sm border border-akatech-gold/20">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-10 pl-4 border-l border-akatech-gold/20 relative ml-2">
                {[
                  {
                    title: "Project Initiation",
                    date: "Oct 12, 2023",
                    status: "Completed",
                  },
                  {
                    title: "Design Phase",
                    date: "Nov 01, 2023",
                    status: "In Progress",
                  },
                  {
                    title: "Development",
                    date: "Pending",
                    status: "Pending",
                  },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-[21px] top-1 w-3 h-3 rotate-45 border border-white dark:border-akatech-dark ${
                        item.status === "Completed" ||
                        item.status === "In Progress"
                          ? "bg-akatech-gold"
                          : "bg-gray-300 dark:bg-gray-800"
                      }`}
                    ></div>
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs mb-2 font-mono">
                      {item.date}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                        item.status === "In Progress"
                          ? "bg-akatech-gold text-black"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (Side) */}
          <div className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/5 p-6 md:p-8 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors duration-500">
            <div>
              <h2 className="text-xl font-serif text-gray-900 dark:text-white mb-6 transition-colors duration-500">
                Quick Actions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Icons.Plus,
                    label: "Create New Invoice",
                    desc: "Generate and send invoices",
                  },
                  {
                    icon: Icons.Settings,
                    label: "Update Profile Settings",
                    desc: "Manage account details",
                  },
                  {
                    icon: Icons.LifeBuoy,
                    label: "Contact Support",
                    desc: "Get help with your project",
                  },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.label)}
                    className="w-full group text-left p-4 bg-gray-50 dark:bg-[#1a1a1a] border-l-2 border-transparent hover:border-akatech-gold hover:bg-gray-100 dark:hover:bg-[#222] transition-all duration-300 flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-akatech-gold/50"
                  >
                    <div className="bg-white dark:bg-akatech-dark p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="w-5 h-5 text-akatech-gold" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {action.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 transition-colors duration-500">
              <div className="flex items-center gap-2 justify-center opacity-50">
                <Logo className="w-8 h-8 grayscale" />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  AkaTech System v2.4.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === "invoice"}
        onClose={() => setActiveModal(null)}
        title="Create New Invoice"
      >
        <form
          onSubmit={(e) => handleSubmit(e, "Invoice Creation")}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Client Name
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white"
              placeholder="e.g. Acme Corp"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Amount (GH₵)
              </label>
              <input
                type="number"
                className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white h-24 resize-none"
              placeholder="Invoice details..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-akatech-gold text-black font-bold uppercase tracking-widest py-3 hover:bg-white hover:text-akatech-gold border border-transparent hover:border-akatech-gold transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Processing..." : "Create Invoice"}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === "profile"}
        onClose={() => setActiveModal(null)}
        title="Profile Settings"
      >
        <form
          onSubmit={(e) => handleSubmit(e, "Profile Update")}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <img
                src={user.avatar || "https://via.placeholder.com/64"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              className="text-sm text-akatech-gold font-bold hover:underline"
            >
              Change Avatar
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user.name}
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-akatech-gold text-black font-bold uppercase tracking-widest py-3 hover:bg-white hover:text-akatech-gold border border-transparent hover:border-akatech-gold transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === "support"}
        onClose={() => setActiveModal(null)}
        title="Contact Support"
      >
        <form
          onSubmit={(e) => handleSubmit(e, "Support Request")}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Subject
            </label>
            <div className="relative">
              <select className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white appearance-none">
                <option>Technical Issue</option>
                <option>Billing Question</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Menu className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 rounded text-sm focus:border-akatech-gold outline-none transition-colors dark:text-white h-32 resize-none"
              placeholder="How can we help you?"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-akatech-gold text-black font-bold uppercase tracking-widest py-3 hover:bg-white hover:text-akatech-gold border border-transparent hover:border-akatech-gold transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
