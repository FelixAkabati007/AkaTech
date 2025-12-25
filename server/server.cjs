const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const xss = require("xss");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dns = require("dns").promises; // Added for MX lookup
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const { OAuth2Client } = require("google-auth-library");
const dal = require("./dal.cjs");

// --- Load .env manually ---
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const app = express();
const server = http.createServer(app);

// --- Email Transporter ---
// Support for both Basic Auth and OAuth 2.0
const authConfig = process.env.OAUTH_CLIENT_ID
  ? {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    }
  : {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    };

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: authConfig,
});

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
const SECRET_KEY = "akatech-super-secret-key-change-in-prod";

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 verification requests per windowMs
  message: { error: "Too many verification attempts, please try again later." },
});

// --- Encryption Helper (Simple for Demo) ---
const encrypt = (text) => {
  // In a real app, use crypto with a proper key/iv.
  // For this demo, we'll base64 encode to simulate "storage format"
  return Buffer.from(text).toString("base64");
};

const decrypt = (text) => {
  return Buffer.from(text, "base64").toString("utf8");
};

// --- Audit Log Helper ---
const logAudit = async (action, performedBy, details) => {
  await dal.createAuditLog({
    action,
    performedBy,
    details,
  });
};

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "No token provided" });

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Invalid or expired token" });

    // Fetch latest user data from DB to ensure role is up-to-date
    const user = await dal.getUserById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "User not found" });
    }

    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden", message: "Insufficient permissions" });
  }
};

// --- Routes ---

const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth
app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });

  try {
    // Verify ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googleUser = ticket.getPayload();

    let user = await dal.getUserByEmail(googleUser.email);

    if (!user) {
      user = await dal.createUser({
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        role: "user",
        accountType: "Auto", // Default for Google users
      });
    }

    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({ token: sessionToken, user });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

// 0.1 Get Current User (Session Persistence)
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  const user = await dal.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });
});

// 0.2 Register User (Email/Password)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, accountType } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  const existingUser = await dal.getUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User already exists with this email." });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const newUser = await dal.createUser({
    name: xss(name),
    email: xss(email),
    passwordHash: hashedPassword,
    role: role || "client",
    accountType: accountType || "Auto",
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    SECRET_KEY,
    { expiresIn: "24h" }
  );

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = newUser;

  // Notify clients
  io.emit("user_registered", userWithoutPassword);

  res.status(201).json({ token, user: userWithoutPassword });
});

// 0.3 Get All Users (Admin)
app.get("/api/users", authenticateToken, authorizeAdmin, async (req, res) => {
  const users = await dal.getAllUsers();
  const safeUsers = users.map(({ passwordHash, ...user }) => user);
  res.json(safeUsers);
});

// 1. Client Message Submission
app.post("/api/client-messages", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Profanity Filter (Simple list)
  const badWords = ["spam", "junk", "badword"]; // Expand as needed
  const containsProfanity = badWords.some((word) =>
    message.toLowerCase().includes(word)
  );
  if (containsProfanity) {
    return res
      .status(400)
      .json({ error: "Message contains inappropriate content." });
  }

  // Length Check
  if (message.length < 1 || message.length > 1000) {
    return res
      .status(400)
      .json({ error: "Message must be between 1 and 1000 characters." });
  }

  // Sanitization
  const sanitizedMessage = xss(message);

  // Create Message Object
  const newMessage = await dal.createMessage({
    name: xss(name),
    email: xss(email),
    subject: xss(subject),
    content: encrypt(sanitizedMessage), // Encrypt content
    status: "unread",
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Notify Admin via Socket
  io.emit("new_message", { ...newMessage, content: sanitizedMessage }); // Send decrypted content to admin

  res.status(201).json({ message: "Message sent successfully." });
});

// 1b. Project Request Submission
app.post("/api/projects", async (req, res) => {
  const { name, email, company, plan, notes } = req.body;

  if (!name || !email || !plan) {
    return res
      .status(400)
      .json({ error: "Name, email, and plan are required." });
  }

  const newProject = await dal.createProject({
    name: xss(name),
    email: xss(email),
    company: xss(company || ""),
    plan: xss(plan),
    notes: encrypt(xss(notes || "")),
    status: "pending",
  });

  io.emit("new_project", { ...newProject, notes: xss(notes || "") });
  res.status(201).json({ message: "Project request received." });
});

// 1c. Support Ticket Submission
app.post("/api/tickets", async (req, res) => {
  const { subject, message, priority, userEmail, userName } = req.body;

  if (!subject || !message || !userEmail) {
    return res
      .status(400)
      .json({ error: "Subject, message, and email are required." });
  }

  const newTicket = await dal.createTicket({
    subject: xss(subject),
    message: encrypt(xss(message)),
    priority: xss(priority || "medium"),
    userEmail: xss(userEmail),
    userName: xss(userName || "User"),
    status: "open",
    responses: [],
  });

  io.emit("new_ticket", { ...newTicket, message: xss(message) });
  res.status(201).json({ message: "Support ticket created." });
});

// 1d. Get Client Tickets (Public/Simple Auth for Demo)
app.get("/api/client/tickets", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const tickets = await dal.getTicketsByEmail(email);
  const userTickets = tickets.map((t) => ({
    ...t,
    message: decrypt(t.message),
    responses: (t.responses || []).map((r) => ({
      ...r,
      message: decrypt(r.message),
    })),
  }));

  res.json(userTickets);
});

// 1e. Get Client Projects
app.get("/api/client/projects", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const projects = await dal.getProjectsByEmail(email);
  const userProjects = projects.map((p) => ({
    ...p,
    notes: decrypt(p.notes),
  }));

  res.json(userProjects);
});

// 1f. Client Reply to Ticket
app.patch("/api/client/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const { email, response } = req.body;

  if (!email || !response)
    return res.status(400).json({ error: "Email and response required" });

  const ticket = await dal.getTicketById(id);

  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  // Verify ownership
  if (ticket.userEmail !== email) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Add response
  const newResponse = {
    id: crypto.randomUUID(),
    sender: "client",
    message: encrypt(response),
    timestamp: new Date().toISOString(),
  };

  const responses = ticket.responses || [];
  responses.push(newResponse);

  const updatedTicket = await dal.updateTicket(id, { responses });

  // Return updated ticket
  updatedTicket.message = decrypt(updatedTicket.message);
  updatedTicket.responses = (updatedTicket.responses || []).map((r) => ({
    ...r,
    message: decrypt(r.message),
  }));

  io.emit("update_tickets", updatedTicket);
  res.json(updatedTicket);
});

// 6. Get Clients (for Direct Messaging)
app.get("/api/clients", authenticateToken, async (req, res) => {
  const clients = new Map();
  const subscriptions = await dal.getAllSubscriptions();
  const messages = await dal.getAllMessages();

  // Add from subscriptions
  subscriptions.forEach((sub) => {
    if (sub.userEmail) {
      clients.set(sub.userEmail, {
        name: sub.userName,
        email: sub.userEmail,
        source: "Subscription",
        status: sub.status,
      });
    }
  });

  // Add from messages
  messages.forEach((msg) => {
    if (msg.email) {
      if (!clients.has(msg.email)) {
        clients.set(msg.email, {
          name: msg.name,
          email: msg.email,
          source: "Inquiry",
        });
      }
    }
  });

  res.json(Array.from(clients.values()));
});

// 2. Admin Login (Demo)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    // Ensure admin user exists in DB
    let adminUser = await dal.getUserByEmail("admin@akatech.com");

    if (!adminUser) {
      adminUser = await dal.createUser({
        name: "System Admin",
        email: "admin@akatech.com",
        role: "admin",
      });
    }

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: "admin" },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, user: adminUser });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// 3. Get Data (Admin Only)
app.get("/api/messages", authenticateToken, async (req, res) => {
  const messages = await dal.getAllMessages();
  const decryptedMessages = messages.map((msg) => ({
    ...msg,
    content: decrypt(msg.content),
  }));
  res.json(decryptedMessages);
});

app.get("/api/projects", authenticateToken, async (req, res) => {
  const projects = await dal.getAllProjects();
  const decryptedProjects = projects.map((p) => ({
    ...p,
    notes: decrypt(p.notes),
  }));
  res.json(decryptedProjects);
});

app.get("/api/tickets", authenticateToken, authorizeAdmin, async (req, res) => {
  const tickets = await dal.getAllTickets();
  const decryptedTickets = tickets.map((t) => ({
    ...t,
    message: decrypt(t.message),
    responses: (t.responses || []).map((r) => ({
      ...r,
      message: decrypt(r.message),
    })),
  }));
  res.json(decryptedTickets);
});

// 5. Subscription Management
app.get("/api/subscriptions", authenticateToken, async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  let subs = await dal.getAllSubscriptions();

  if (status) {
    subs = subs.filter((s) => s.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedSubs = subs.slice(startIndex, endIndex);

  res.json({
    total: subs.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paginatedSubs,
  });
});

app.post("/api/subscriptions", authenticateToken, async (req, res) => {
  const { userId, userName, userEmail, plan, durationMonths } = req.body;
  if (!userEmail || !plan)
    return res.status(400).json({ error: "Missing fields" });

  const newSub = await dal.createSubscription({
    userId: userId || crypto.randomUUID(), // Or handle this better if userId refers to registered user
    userName: xss(userName),
    userEmail: xss(userEmail),
    plan: xss(plan),
    status: "pending",
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + (durationMonths || 1))
    ).toISOString(),
    paymentHistory: [],
  });

  await logAudit("CREATE_SUBSCRIPTION", req.user.username, {
    subId: newSub.id,
    plan,
  });
  res.status(201).json(newSub);
});

app.patch(
  "/api/subscriptions/:id/action",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { action, details } = req.body; // action: approve, reject, cancel, extend

    const sub = await dal.getSubscriptionById(id);
    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    let updated = false;
    const updates = {};

    switch (action) {
      case "approve":
        updates.status = "active";
        updates.startDate = new Date().toISOString();
        updated = true;
        break;
      case "reject":
        updates.status = "rejected";
        updated = true;
        break;
      case "cancel":
        updates.status = "cancelled";
        updated = true;
        break;
      case "extend":
        const months = details?.months || 1;
        const currentEnd = new Date(sub.endDate);
        updates.endDate = new Date(
          currentEnd.setMonth(currentEnd.getMonth() + months)
        ).toISOString();
        updated = true;
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    if (updated) {
      const updatedSub = await dal.updateSubscription(id, updates);
      await logAudit(
        `SUBSCRIPTION_${action.toUpperCase()}`,
        req.user.username,
        {
          subId: id,
        }
      );
      res.json(updatedSub);
    }
  }
);

app.get("/api/subscriptions/export", authenticateToken, async (req, res) => {
  const subs = await dal.getAllSubscriptions();
  // Simple CSV export
  const fields = [
    "id",
    "userName",
    "userEmail",
    "plan",
    "status",
    "startDate",
    "endDate",
  ];
  const csv = [
    fields.join(","),
    ...subs.map((s) => fields.map((f) => s[f]).join(",")),
  ].join("\n");

  res.header("Content-Type", "text/csv");
  res.attachment("subscriptions.csv");
  res.send(csv);
});

app.get("/api/audit-logs", authenticateToken, async (req, res) => {
  const logs = await dal.getAllAuditLogs();
  res.json(logs.slice(0, 100)); // Last 100 logs (already reversed in DAL)
});

// 9b. Get Client Notifications
app.get("/api/notifications", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const notifications = await dal.getNotificationsByUserId(userId);
  const userNotifications = notifications.map((n) => ({
    ...n,
    read:
      n.target === "all"
        ? n.readBy
          ? n.readBy.includes(userId)
          : false
        : n.read,
    readBy: undefined, // Hide the list of other readers
  }));
  // .reverse() is done in DAL orderBy

  res.json(userNotifications);
});

// 9c. Mark Notification as Read
app.patch(
  "/api/notifications/:id/read",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await dal.markNotificationRead(id, userId);

    res.json({ message: "Marked as read" });
  }
);

// 9d. Mark All Notifications as Read
app.patch(
  "/api/notifications/read-all",
  authenticateToken,
  async (req, res) => {
    const userId = req.user.id;

    await dal.markAllNotificationsRead(userId);

    res.json({ message: "All marked as read" });
  }
);

// --- Multi-Step Signup Endpoints ---

// Helper: Check MX Record
const checkMxRecord = async (email) => {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    console.error(`MX Check failed for ${email}:`, err.message);
    return false;
  }
};

// 10. Google Verification
app.post("/api/signup/verify-google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, email_verified } = payload;

    if (email_verified) {
      // Return success
      res.json({
        message: "Email verified successfully",
        email,
        method: "google",
      });
    } else {
      res.status(400).json({ error: "Google email not verified" });
    }
  } catch (error) {
    console.error("Google verification error:", error);
    res.status(400).json({ error: "Invalid Google Token" });
  }
});

// 10a. Send Verification Email
app.post("/api/signup/verify-email", verificationLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // 1. Format Validation (RFC 5322 regex approximation)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // 2. MX Record Lookup
  const mxValid = await checkMxRecord(email);
  if (!mxValid) {
    return res
      .status(400)
      .json({ error: "Invalid email domain (no MX record found)" });
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationToken = crypto.randomUUID();

  // Store code in memory or DB (for production, use DB/Redis with expiration)
  await dal.deleteEmailVerification(email);

  await dal.createEmailVerification({
    email,
    code: verificationCode,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours (User requirement)
  });

  // Send Email
  const verificationLink = `http://localhost:5175/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "AkaTech - Verify your email",
    text: `Your verification code is: ${verificationCode}. \n\nOr click this link to verify: ${verificationLink}\n\nThis link expires in 24 hours.`,
    html: `
      <h3>Verify your email</h3>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>Or click the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email send error:", error);
      // For demo purposes, we'll return the code if email fails (so you can test)
      return res.status(200).json({
        message: "Verification code sent (simulated)",
        debugCode: verificationCode,
        debugLink: verificationLink,
      });
    }
    res.json({ message: "Verification code sent" });
  });
});

// 10b. Validate Verification Code
app.post("/api/signup/validate-code", verificationLimiter, async (req, res) => {
  const { email, code, token } = req.body;

  let record;
  if (token) {
    record = await dal.getEmailVerificationByToken(token);
  } else if (email) {
    record = await dal.getEmailVerification(email);
    // If we fetched by email, check code match
    if (record && record.code !== code) {
      record = null;
    }
  }

  if (!record) {
    return res.status(400).json({ error: "Invalid code or token" });
  }

  if (new Date(record.expiresAt) < new Date()) {
    return res.status(400).json({ error: "Verification expired" });
  }

  // Code is valid
  // Mark as verified? Or just return success.
  // We can update the record to "verified" state if we want to prevent reuse or support polling.

  res.json({ message: "Email verified successfully", email: record.email });
});

// 10b-2. Validate Verification Link (Get Request)
app.get("/api/signup/verify-link", verificationLimiter, async (req, res) => {
  const { token } = req.query;
  const record = await dal.getEmailVerificationByToken(token);

  if (!record) {
    return res.status(400).json({ error: "Invalid token" });
  }

  if (new Date(record.expiresAt) < new Date()) {
    return res.status(400).send("<h1>Link expired</h1>");
  }

  // Ideally, redirect to frontend success page
  // For now, return HTML
  res.send(`
    <html>
      <head>
        <title>Email Verified</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; background: #f9f9f9; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
          h1 { color: #16a34a; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verified Successfully!</h1>
          <p>You have successfully verified your email: <strong>${record.email}</strong></p>
          <p>You can close this tab and return to the signup wizard.</p>
        </div>
      </body>
    </html>
  `);
});

// 10c. Save Progress (Draft)
app.post("/api/signup/progress", async (req, res) => {
  const { email, data } = req.body;

  // Encrypt data before saving
  const encryptedData = encrypt(JSON.stringify(data));

  // Upsert progress
  await dal.upsertSignupProgress(email, encryptedData, "draft");

  res.json({ message: "Progress saved" });
});

// 10d. Get Progress
app.get("/api/signup/progress", async (req, res) => {
  const { email } = req.query;
  const record = await dal.getSignupProgress(email);

  if (!record) return res.status(404).json({ error: "No progress found" });

  // Check expiration (72 hours)
  const expirationTime =
    new Date(record.updatedAt).getTime() + 72 * 60 * 60 * 1000;
  if (Date.now() > expirationTime) {
    return res.status(404).json({ error: "Progress expired" });
  }

  try {
    const data = JSON.parse(decrypt(record.data));
    res.json({ data });
  } catch (e) {
    console.error("Decrypt error:", e);
    res.status(500).json({ error: "Failed to decrypt data" });
  }
});

// 10e. Complete Signup
app.post("/api/signup/complete", async (req, res) => {
  const { email, finalData } = req.body;

  try {
    // 1. Create User if not exists
    let user = await dal.getUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      if (!finalData.password) {
        return res
          .status(400)
          .json({ error: "Password required for new users" });
      }

      const hashedPassword = crypto
        .createHash("sha256")
        .update(finalData.password)
        .digest("hex");

      user = await dal.createUser({
        name: xss(finalData.name || "Client"),
        email: xss(email),
        passwordHash: hashedPassword,
        role: "client",
        accountType: "Transparent Package", // Default or from finalData
        company: xss(finalData.companyName || ""),
        // Phone is not in user schema directly, maybe add to details or subscription
      });
      isNewUser = true;
    }

    // 2. Create Subscription/Project Request
    const newSub = await dal.createSubscription({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      plan: xss(finalData.selectedPackage || "Unknown"),
      status: "pending",
      startDate: new Date(),
      details: encrypt(JSON.stringify(finalData)), // Encrypt all extra form data
    });

    // 3. Clear progress (not strictly necessary as we can just ignore it, or delete it)
    // dal.deleteSignupProgress(email); // If we implemented it

    // 4. Log Audit
    await dal.createAuditLog({
      action: "SIGNUP_COMPLETE",
      performedBy: user.name,
      details: {
        email: user.email,
        package: newSub.plan,
        isNewUser,
      },
    });

    // 5. Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Signup completed successfully",
      token,
      user: { ...user, password: undefined },
    });
  } catch (error) {
    console.error("Signup Completion Error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// 4. Update Status (Generic)
app.patch("/api/:resource/:id", authenticateToken, async (req, res) => {
  const { resource, id } = req.params;
  const { status, response } = req.body; // response is for tickets/messages

  let updatedItem = null;

  try {
    if (resource === "tickets") {
      const updates = {};
      if (status) updates.status = status;

      // If responding to a ticket
      if (response) {
        const ticket = await dal.getTicketById(id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        const responses = ticket.responses || [];
        responses.push({
          id: crypto.randomUUID(),
          sender: "admin",
          message: encrypt(response),
          timestamp: new Date().toISOString(),
        });
        updates.responses = responses;
      }

      updatedItem = await dal.updateTicket(id, updates);
      if (updatedItem) {
        updatedItem.message = decrypt(updatedItem.message);
        updatedItem.responses = (updatedItem.responses || []).map((r) => ({
          ...r,
          message: decrypt(r.message),
        }));
      }
    } else if (resource === "messages") {
      const updates = {};
      if (status) updates.status = status;
      updatedItem = await dal.updateMessage(id, updates);
      if (updatedItem && updatedItem.content) {
        updatedItem.content = decrypt(updatedItem.content);
      }
    } else if (resource === "projects") {
      const updates = {};
      if (status) updates.status = status;
      updatedItem = await dal.updateProject(id, updates);
      if (updatedItem && updatedItem.notes) {
        updatedItem.notes = decrypt(updatedItem.notes);
      }
    } else if (resource === "subscriptions") {
      // Subscriptions are handled by specific endpoint, but if generic is used:
      const updates = {};
      if (status) updates.status = status;
      updatedItem = await dal.updateSubscription(id, updates);
    } else {
      return res
        .status(404)
        .json({ error: "Resource type not found or not supported for update" });
    }

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    io.emit(`update_${resource}`, updatedItem); // Notify clients
    res.json(updatedItem);
  } catch (error) {
    console.error(`Update error for ${resource}:`, error);
    res.status(500).json({ error: "Update failed" });
  }
});

// 8. Delete Resource
app.delete("/api/:resource/:id", authenticateToken, async (req, res) => {
  const { resource, id } = req.params;

  try {
    if (resource === "tickets") {
      await dal.deleteTicket(id);
    } else if (resource === "messages") {
      await dal.deleteMessage(id);
    } else if (resource === "projects") {
      await dal.deleteProject(id);
    } else if (resource === "subscriptions") {
      await dal.deleteSubscription(id);
    } else {
      return res.status(404).json({ error: "Resource type not found" });
    }

    // We can't easily check if it was actually deleted without a prior get,
    // but for delete it's usually idempotent/safe to return success.
    // Or we could check if getById returns null after.

    io.emit(`delete_${resource}`, id); // Notify clients
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(`Delete error for ${resource}:`, error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// 9. Notifications System
app.post(
  "/api/notifications/send",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { recipientId, title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const newNotification = await dal.createNotification({
      recipientId: recipientId || "all", // Note: schema uses 'target' and 'userId'. We need to adapt.
      // Schema: userId (uuid, nullable), target (text), readBy (jsonb)
      // If recipientId is 'all', target='all', userId=null.
      // If specific, target='user', userId=recipientId.
      userId: recipientId === "all" ? null : recipientId,
      target: recipientId === "all" ? "all" : "user",
      title: xss(title),
      message: xss(message),
      type: xss(type || "info"), // Schema doesn't have 'type', maybe add it or put in message?
      // Schema has: title, message, read, readBy, target. No 'type'.
      // We can ignore 'type' or add it to schema. For now, let's ignore or append to title?
      // Or maybe the frontend expects it. Let's assume schema matches or we add 'type' to schema.
      // Wait, I didn't add 'type' to notification schema.
      // Let's assume it's fine without it for DB, but we return it?
      // Actually, let's just stick to schema.
      readBy: [],
    });

    // Add type back to response if needed, or update schema.
    // I'll stick to schema for now.

    // Broadcast via Socket.io
    io.emit("notification", newNotification);

    await logAudit("SEND_NOTIFICATION", req.user.name, {
      recipientId: recipientId || "all",
      title: newNotification.title,
    });

    res.status(201).json(newNotification);
  }
);

app.get(
  "/api/notifications/history",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const notifications = await dal.getAllNotifications();
    res.json(notifications.slice(0, 50));
  }
);

// 7. Send Direct Message (Outlook Integration)
app.post("/api/send-email", authenticateToken, async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res
      .status(400)
      .json({ error: "To, Subject, and Message are required." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.error("Email send error:", error);
      return res.status(500).json({ error: "Failed to send email." });
    }

    // Save to DB as sent message
    const sentMsg = await dal.createMessage({
      name: "Admin",
      email: to, // The recipient
      subject: subject,
      content: encrypt(message),
      status: "sent",
      // Schema doesn't have 'direction'.
      // We can infer from name='Admin' or add direction to schema.
      // For now, schema is fine.
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    io.emit("new_message", { ...sentMsg, content: message });

    await logAudit("SEND_EMAIL", req.user.name, { to, subject });

    res.json({ message: "Email sent successfully", info });
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

// --- Socket.io ---
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// --- Start Server ---
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
