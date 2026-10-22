const { getDb } = require("./db/connectionManager.cjs");
const { withRetry, retryConfig } = require("./db/retry.cjs");
const logger = require("./logging/logger.cjs");
const {
  users,
  projects,
  messages,
  notifications,
  auditLogs,
  signupProgress,
  tickets,
  subscriptions,
  invoices,
  systemSettings,
  passwordResetTokens,
} = require("./db/schema.cjs");
const { eq, desc, and, or, notInArray, sql, isNull, gt } = require("drizzle-orm");

let dbInstance = null;

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await getDb();
  }
  return dbInstance;
};

// Dashboard Stats
const getDashboardStats = async () => {
  return withRetry(
    async () => {
      logger.info("Fetching dashboard stats...");
      const database = await getDatabase();

      // 1. Total Users
      const usersCount = await database
        .select({ count: sql`count(*)` })
        .from(users)
        .then((res) => parseInt(res[0].count));
      logger.debug("Users count fetched", { usersCount });

      // 2. Active Projects (not completed or rejected)
      const activeProjectsCount = await database
        .select({ count: sql`count(*)` })
        .from(projects)
        .where(notInArray(projects.status, ["completed", "rejected"]))
        .then((res) => parseInt(res[0].count));
      logger.debug("Active projects fetched", { activeProjectsCount });

      // 3. Pending Tickets (not resolved or closed)
      const pendingTicketsCount = await database
        .select({ count: sql`count(*)` })
        .from(tickets)
        .where(notInArray(tickets.status, ["resolved", "closed"]))
        .then((res) => parseInt(res[0].count));
      logger.debug("Pending tickets fetched", { pendingTicketsCount });

      // 4. Total Revenue (Sum of paid invoices)
      const paidInvoices = await database
        .select()
        .from(invoices)
        .where(or(eq(invoices.status, "paid"), eq(invoices.status, "Paid")));

      const totalRevenue = paidInvoices.reduce((acc, inv) => {
        const cleanAmount = inv.amount ? inv.amount.replace(/[^0-9.]/g, "") : "0";
        return acc + (parseFloat(cleanAmount) || 0);
      }, 0);
      logger.debug("Total revenue calculated", { totalRevenue });

      // 5. Outstanding Revenue (Sum of invoices not paid/cancelled)
      const outstandingInvoices = await database
        .select()
        .from(invoices)
        .where(
          notInArray(invoices.status, ["paid", "Paid", "cancelled", "Cancelled"])
        );

      const outstandingRevenue = outstandingInvoices.reduce((acc, inv) => {
        const cleanAmount = inv.amount ? inv.amount.replace(/[^0-9.]/g, "") : "0";
        return acc + (parseFloat(cleanAmount) || 0);
      }, 0);
      logger.debug("Outstanding revenue calculated", { outstandingRevenue });

      return {
        totalUsers: usersCount,
        activeProjects: activeProjectsCount,
        pendingTickets: pendingTicketsCount,
        totalRevenue,
        outstandingRevenue,
      };
    },
    "getDashboardStats",
    retryConfig.query
  );
};
const getUserByEmail = async (email) => {
  return withRetry(
    async () => {
      const database = await getDatabase();
      const result = await database.select().from(users).where(eq(users.email, email));
      return result[0];
    },
    "getUserByEmail",
    retryConfig.query
  );
};

const getUserById = async (id) => {
  return withRetry(
    async () => {
      const database = await getDatabase();
      const result = await database.select().from(users).where(eq(users.id, id));
      return result[0];
    },
    "getUserById",
    retryConfig.query
  );
};

const createUser = async (userData) => {
  return withRetry(
    async () => {
      const database = await getDatabase();
      const result = await database.insert(users).values(userData).returning();
      return result[0];
    },
    "createUser",
    retryConfig.transaction
  );
};

const getAllUsers = async () => {
  const database = await getDatabase();
  return await database.select().from(users);
};

const getClients = async () => {
  const database = await getDatabase();
  return await database.select().from(users).where(eq(users.role, "client"));
};

// Projects
const createProject = async (projectData) => {
  const database = await getDatabase();
  const result = await database.insert(projects).values(projectData).returning();
  return result[0];
};

const getAllProjects = async () => {
  const database = await getDatabase();
  return await database.select().from(projects).orderBy(desc(projects.createdAt));
};

const getProjectsByEmail = async (email) => {
  const database = await getDatabase();
  return await database.select().from(projects).where(eq(projects.email, email));
};

// Messages
const createMessage = async (messageData) => {
  const database = await getDatabase();
  const result = await database.insert(messages).values(messageData).returning();
  return result[0];
};

const getAllMessages = async () => {
  const database = await getDatabase();
  return await database.select().from(messages).orderBy(desc(messages.createdAt));
};

const deleteMessage = async (id) => {
  const database = await getDatabase();
  await database.delete(messages).where(eq(messages.id, id));
};

// Notifications
const createNotification = async (notifData) => {
  const database = await getDatabase();
  const result = await database.insert(notifications).values(notifData).returning();
  return result[0];
};

const getNotificationsByUserId = async (userId, role) => {
  const database = await getDatabase();
  const conditions = [
    eq(notifications.userId, userId),
    eq(notifications.target, "all"),
  ];
  if (role === "admin") {
    conditions.push(eq(notifications.target, "admin"));
  }

  return await database.select()
    .from(notifications)
    .where(or(...conditions))
    .orderBy(desc(notifications.createdAt));
};

// Audit Logs
const createAuditLog = async (logData) => {
  const database = await getDatabase();
  await database.insert(auditLogs).values(logData);
};

const getAllAuditLogs = async () => {
  const database = await getDatabase();
  return await database.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
};

// Signup Progress
const upsertSignupProgress = async (email, data, step) => {
  const database = await getDatabase();
  const existing = await database.select()
    .from(signupProgress)
    .where(eq(signupProgress.email, email));
  if (existing.length > 0) {
    const result = await database.update(signupProgress)
      .set({ data, step, updatedAt: new Date() })
      .where(eq(signupProgress.email, email))
      .returning();
    return result[0];
  } else {
    const result = await database.insert(signupProgress)
      .values({ email, data, step })
      .returning();
    return result[0];
  }
};

const getSignupProgress = async (email) => {
  const database = await getDatabase();
  const result = await database.select()
    .from(signupProgress)
    .where(eq(signupProgress.email, email));
  return result[0];
};

// System Settings
const getSystemSetting = async (key) => {
  const database = await getDatabase();
  const result = await database.select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key));
  return result[0];
};

const setSystemSetting = async (key, value) => {
  const database = await getDatabase();
  const existing = await getSystemSetting(key);
  if (existing) {
    const result = await database.update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return result[0];
  } else {
    const result = await database.insert(systemSettings)
      .values({ key, value })
      .returning();
    return result[0];
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser: async (id, data) => {
    const database = await getDatabase();
    const result = await database.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },
  getAllUsers,
  getClients,
  createProject,
  getAllProjects,
  getProjectsByEmail,
  updateProject: async (id, data) => {
    const database = await getDatabase();
    const result = await database.update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  },
  deleteProject: async (id) => {
    const database = await getDatabase();
    await database.delete(projects).where(eq(projects.id, id));
  },

  // Messages
  createMessage,
  getAllMessages,
  deleteMessage,
  updateMessage: async (id, data) => {
    const database = await getDatabase();
    const result = await database.update(messages)
      .set({ ...data }) // messages doesn't have updatedAt
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  },

  // Notifications
  createNotification,
  getNotificationsByUserId,
  getAllNotifications: async () => {
    const database = await getDatabase();
    return await database.select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  },

  // Audit Logs
  createAuditLog,
  getAllAuditLogs,
  upsertSignupProgress,
  getSignupProgress,

  // Notifications (continued)
  markNotificationRead: async (id, userId) => {
    const database = await getDatabase();
    const notif = await database.select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .then((res) => res[0]);
    if (!notif) return;

    if (notif.target === "all" || notif.target === "admin") {
      const readBy = notif.readBy || [];
      if (!readBy.includes(userId)) {
        await database.update(notifications)
          .set({ readBy: [...readBy, userId] })
          .where(eq(notifications.id, id));
      }
    } else {
      await database.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, id));
    }
  },

  markAllNotificationsRead: async (userId) => {
    const database = await getDatabase();

    // 1. Mark user-specific notifications
    await database.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));

    // 2. Mark system-wide notifications
    const allNotifs = await database.select()
      .from(notifications)
      .where(eq(notifications.target, "all"));

    for (const notif of allNotifs) {
      const readBy = notif.readBy || [];
      if (!readBy.includes(userId)) {
        await database.update(notifications)
          .set({ readBy: [...readBy, userId] })
          .where(eq(notifications.id, notif.id));
      }
    }
  },

  // Tickets
  createTicket: async (ticketData) => {
    const database = await getDatabase();
    const result = await database.insert(tickets).values(ticketData).returning();
    return result[0];
  },

  getAllTickets: async () => {
    const database = await getDatabase();
    return await database.select().from(tickets).orderBy(desc(tickets.createdAt));
  },

  getTicketsByEmail: async (email) => {
    const database = await getDatabase();
    return await database.select()
      .from(tickets)
      .where(eq(tickets.userEmail, email))
      .orderBy(desc(tickets.createdAt));
  },

  getTicketById: async (id) => {
    const database = await getDatabase();
    const result = await database.select().from(tickets).where(eq(tickets.id, id));
    return result[0];
  },

  updateTicket: async (id, data) => {
    const database = await getDatabase();
    const result = await database.update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return result[0];
  },

  deleteTicket: async (id) => {
    const database = await getDatabase();
    await database.delete(tickets).where(eq(tickets.id, id));
  },

  // Subscriptions
  createSubscription: async (subData) => {
    const database = await getDatabase();
    const result = await database.insert(subscriptions).values(subData).returning();
    return result[0];
  },

  getAllSubscriptions: async () => {
    const database = await getDatabase();
    return await database.select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt));
  },

  getSubscriptionsByUserId: async (userId) => {
    const database = await getDatabase();
    return await database.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  },

  getSubscriptionById: async (id) => {
    const database = await getDatabase();
    const result = await database.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return result[0];
  },

  updateSubscription: async (id, data) => {
    const database = await getDatabase();
    const result = await database.update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  },

  deleteSubscription: async (id) => {
    const database = await getDatabase();
    await database.delete(subscriptions).where(eq(subscriptions.id, id));
  },

  // Invoices
  createInvoice: async (invoiceData) => {
    const database = await getDatabase();
    const result = await database.insert(invoices).values(invoiceData).returning();
    return result[0];
  },

  getAllInvoices: async () => {
    const database = await getDatabase();
    return await database.select().from(invoices).orderBy(desc(invoices.createdAt));
  },

  getInvoicesByUserId: async (userId) => {
    const database = await getDatabase();
    return await database.select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  },

  getInvoiceByReference: async (reference) => {
    const database = await getDatabase();
    const result = await database.select()
      .from(invoices)
      .where(eq(invoices.referenceNumber, reference));
    return result[0];
  },

  getInvoiceById: async (id) => {
    const database = await getDatabase();
    const result = await database.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  },

  updateInvoice: async (id, data) => {
    const database = await getDatabase();
    const result = await database.update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return result[0];
  },

  deleteInvoice: async (id) => {
    const database = await getDatabase();
    await database.delete(invoices).where(eq(invoices.id, id));
  },

  createPasswordResetToken: async (tokenData) => {
    const database = await getDatabase();
    const result = await database
      .insert(passwordResetTokens)
      .values(tokenData)
      .returning();
    return result[0];
  },

  getValidPasswordResetToken: async (tokenHash) => {
    const database = await getDatabase();
    const result = await database
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );
    return result[0];
  },

  markPasswordResetTokenUsed: async (id) => {
    const database = await getDatabase();
    const result = await database
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    return result[0];
  },

  // Email Verifications & Progress
  upsertSignupProgress,
  getSignupProgress,

  // Audit Logs
  createAuditLog,
  getAllAuditLogs,
  getSystemSetting,
  setSystemSetting,
  getDashboardStats,

  // System Health
  getSystemHealth: async () => {
    const database = await getDatabase();
    try {
      const start = Date.now();
      // Simple query to check DB connection and latency
      await database.execute(sql`SELECT 1`);
      const latency = Date.now() - start;

      // Get DB Size (Postgres specific)
      const sizeResult = await database.execute(
        sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size, pg_database_size(current_database()) as raw_size`
      );
      const dbSize = sizeResult[0]?.size || "Unknown";

      // Calculate a "usage percentage" based on a hypothetical limit (e.g., 500MB for free tier)
      // Neon free tier is usually 500MB.
      const rawSize = parseInt(sizeResult[0]?.raw_size || 0);
      const limit = 500 * 1024 * 1024; // 500MB
      const dbUsage = Math.min(Math.round((rawSize / limit) * 100), 100);

      return {
        status: "healthy",
        latency,
        dbSize,
        dbUsage,
      };
    } catch (error) {
      logger.error("Health check failed", {
        message: error.message,
        code: error.code
      });
      return {
        status: "unhealthy",
        error: error.message,
        dbUsage: 0,
      };
    }
  },
};
