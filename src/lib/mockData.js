import { Icons } from "@components/ui/Icons";

export const mockService = {
  getProjects: (clientId = null) => {
    const projects = [
      {
        id: 1,
        title: "E-Commerce Website Redesign",
        clientId: 1,
        status: "In Progress",
        description: "Complete overhaul of the online store with modern UI/UX.",
        currentPhase: "Development",
        phases: [
          { name: "Design", status: "Completed", date: "2023-10-15" },
          { name: "Development", status: "In Progress", date: "2023-11-20" },
          { name: "Testing", status: "Pending", date: "-" },
        ],
        files: [
          { name: "Design_Mockups.pdf", date: "2023-10-10", size: "2.5 MB" },
        ],
      },
      {
        id: 2,
        title: "Mobile App Development",
        clientId: 1,
        status: "Pending",
        description: "Native mobile application for iOS and Android.",
        currentPhase: "Discovery",
        phases: [
          { name: "Discovery", status: "In Progress", date: "2023-12-01" },
          { name: "Design", status: "Pending", date: "-" },
        ],
        files: [],
      },
      {
        id: 3,
        title: "Inventory Management System",
        clientId: 2,
        status: "Completed",
        description: "Custom inventory tracking for warehouse operations.",
        currentPhase: "Maintenance",
        phases: [
          { name: "Development", status: "Completed", date: "2023-09-01" },
          { name: "Deployment", status: "Completed", date: "2023-09-15" },
        ],
        files: [
          { name: "User_Manual.pdf", date: "2023-09-15", size: "1.2 MB" },
        ],
      },
    ];
    if (clientId) {
      return projects.filter((p) => p.clientId === clientId);
    }
    return projects;
  },
  getInvoices: (userId) => {
    return [
      {
        id: "INV-001",
        projectId: "E-Commerce Website Redesign",
        amount: 2500.0,
        status: "Paid",
        date: "2023-10-01",
        dueDate: "2023-10-15",
        description: "Initial deposit",
      },
      {
        id: "INV-002",
        projectId: "Mobile App Development",
        amount: 5000.0,
        status: "Pending",
        date: "2023-12-01",
        dueDate: "2023-12-15",
        description: "Milestone 1 payment",
      },
    ];
  },
  createTicket: (ticket) => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...ticket,
      messages: [
        { text: ticket.message, sender: ticket.sender, timestamp: new Date() },
      ],
      status: "Open",
      createdAt: new Date(),
    };
  },
  getTickets: (clientId) => {
    return [
      {
        id: "TCK-001",
        subject: "Login Issue",
        priority: "High",
        status: "Closed",
        createdAt: "2023-11-05T10:00:00Z",
        messages: [
          {
            text: "I cannot login to the admin panel.",
            sender: "Client",
            timestamp: "2023-11-05T10:00:00Z",
          },
        ],
      },
    ];
  },
  getMessages: () => {
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        subject: "Project Update",
        content: "Just wanted to check on the status of the design phase.",
        timestamp: new Date().toISOString(),
        status: "unread",
        direction: "inbound",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Invoice Question",
        content: "I have a question about the latest invoice INV-002.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "read",
        direction: "inbound",
      },
      {
        id: 3,
        name: "Admin User",
        email: "admin@akatech.com",
        subject: "Re: Project Update",
        content: "We are on track and will send updates by EOD.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "read",
        direction: "outbound",
      },
    ];
  },
};
