import { mockService } from "./mockData";

export const localDataService = {
  getProjects: () => {
    return mockService.getProjects();
  },
  getUsers: () => {
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "Client",
        company: "Acme Corp",
        avatar: null,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Client",
        company: "Global Tech",
        avatar: null,
      },
      {
        id: 3,
        name: "Admin User",
        email: "admin@akatech.com",
        role: "Admin",
        company: "AkaTech",
      },
    ];
  },
  getInvoices: () => {
    return mockService.getInvoices();
  },
  getTickets: () => {
    return mockService.getTickets();
  },
  getMessages: () => {
    return mockService.getMessages();
  },
  getSubscriptions: () => {
    return [
      {
        id: 1,
        plan: "Enterprise Growth",
        amount: "6,500",
        status: "Active",
        client: "John Doe",
      },
      {
        id: 2,
        plan: "Startup Identity",
        amount: "2,500",
        status: "Active",
        client: "Jane Smith",
      },
    ];
  },
  saveProject: (project) => {
    console.log("Saving project locally:", project);
    return project;
  },
  deleteProject: (id) => {
    console.log("Deleting project locally:", id);
  },
  updateProject: (project) => {
    console.log("Updating project locally:", project);
    return project;
  },
  updateUser: (user) => {
    console.log("Updating user:", user);
    return user;
  },
  updateAvatar: (id, url) => {
    console.log("Updating avatar:", id, url);
    return url;
  },
  syncGoogleAvatar: (id) => {
    console.log("Syncing google avatar:", id);
    return "/default-avatar.png";
  },
  getSettings: () => ({
    siteName: "AkaTech IT Solutions",
    emailNotifications: true,
    maintenanceMode: false,
    theme: "light",
    adminEmail: "admin@akatech.com",
    cookiePolicyVersion: "1.0.0",
    enforceSecureCookies: true,
  }),
  saveSettings: (settings) => {
    console.log("Saving settings:", settings);
    return settings;
  },
};
