import React, { useEffect, useState } from 'react';
import { Icons } from '@components/ui/Icons';
import { mockService } from '@lib/mockData';

export const ClientDashboard = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    invoicesDue: 0,
    tickets: 0,
    status: 'Online'
  });

  useEffect(() => {
    // Simulate fetching data
    const projects = mockService.getProjects(user.id);
    const invoices = mockService.getInvoices(user.id);
    const tickets = mockService.getTickets(user.id);
    
    const activeProjectsCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Initiation').length;
    const dueAmount = invoices
      .filter(i => i.status === 'Sent' || i.status === 'Unpaid' || i.status === 'Overdue')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const activeTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

    setStats({
      activeProjects: activeProjectsCount,
      invoicesDue: dueAmount,
      tickets: activeTicketsCount,
      status: 'Online'
    });
  }, [user.id]);

  const statCards = [
    { label: "Active Projects", val: stats.activeProjects, icon: Icons.Code },
    { label: "Invoices Due", val: `GH₵ ${stats.invoicesDue.toFixed(2)}`, icon: Icons.Activity },
    { label: "Support Tickets", val: stats.tickets, icon: Icons.LifeBuoy },
    { label: "System Status", val: stats.status, icon: Icons.Server, textClass: "text-green-600 dark:text-akatech-goldLight" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-akatech-card p-6 border-l-2 border-akatech-gold shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-[10px] uppercase tracking-widest">{stat.label}</span>
              <stat.icon className="text-akatech-gold w-4 h-4" />
            </div>
            <div className={`text-2xl font-serif text-gray-900 dark:text-white ${stat.textClass || ""}`}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Timeline Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-akatech-card p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-500 overflow-hidden">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl md:text-2xl font-serif text-gray-900 dark:text-white transition-colors duration-500">Project Timeline</h2>
            <button onClick={() => setActiveTab('projects')} className="text-akatech-gold text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          {/* Simple Timeline for the first active project */}
          {mockService.getProjects(user.id)[0] ? (
            <div className="space-y-10 pl-4 border-l border-akatech-gold/20 relative ml-2">
              {mockService.getProjects(user.id)[0].phases.map((phase, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[21px] top-1 w-3 h-3 rotate-45 border border-white dark:border-akatech-dark ${
                    phase.status === 'Completed' || phase.status === 'In Progress' ? 'bg-akatech-gold' : 'bg-gray-300 dark:bg-gray-800'
                  }`}></div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg transition-colors duration-500">{phase.name}</h3>
                  <p className="text-gray-500 text-xs mb-2 font-mono">{phase.date}</p>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${
                    phase.status === 'In Progress' ? 'bg-akatech-gold text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {phase.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active projects found.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/5 p-6 md:p-8 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors duration-500">
          <div>
            <h2 className="text-xl font-serif text-gray-900 dark:text-white mb-6 transition-colors duration-500">Quick Actions</h2>
            <div className="space-y-4">
              <button onClick={() => setActiveTab('billing')} className="w-full group text-left p-4 bg-gray-50 dark:bg-[#1a1a1a] border-l-2 border-transparent hover:border-akatech-gold hover:bg-gray-100 dark:hover:bg-[#222] transition-all duration-300 flex items-center gap-4">
                <div className="bg-white dark:bg-akatech-dark p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icons.Plus className="w-5 h-5 text-akatech-gold" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">Create New Invoice</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Request invoice generation</span>
                </div>
              </button>
              
              <button onClick={() => setActiveTab('profile')} className="w-full group text-left p-4 bg-gray-50 dark:bg-[#1a1a1a] border-l-2 border-transparent hover:border-akatech-gold hover:bg-gray-100 dark:hover:bg-[#222] transition-all duration-300 flex items-center gap-4">
                <div className="bg-white dark:bg-akatech-dark p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icons.Settings className="w-5 h-5 text-akatech-gold" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">Update Profile</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Manage account details</span>
                </div>
              </button>
              
              <button onClick={() => setActiveTab('support')} className="w-full group text-left p-4 bg-gray-50 dark:bg-[#1a1a1a] border-l-2 border-transparent hover:border-akatech-gold hover:bg-gray-100 dark:hover:bg-[#222] transition-all duration-300 flex items-center gap-4">
                <div className="bg-white dark:bg-akatech-dark p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icons.LifeBuoy className="w-5 h-5 text-akatech-gold" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">Contact Support</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Get help with your project</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 transition-colors duration-500">
            <div className="flex items-center gap-2 justify-center opacity-50">
               <div className="flex items-center justify-center relative w-8 h-8 grayscale">
                   <img src="/logo.png" alt="AkaTech Logo" className="w-full h-full object-contain" />
               </div>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">AkaTech System v2.4.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
