const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const xss = require('xss');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;
const SECRET_KEY = 'akatech-super-secret-key-change-in-prod';
const DB_FILE = path.join(__dirname, 'db.json');

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// --- Database Helper ---
const getDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ messages: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
};

const saveDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Encryption Helper (Simple for Demo) ---
const encrypt = (text) => {
  // In a real app, use crypto with a proper key/iv. 
  // For this demo, we'll base64 encode to simulate "storage format"
  return Buffer.from(text).toString('base64');
};

const decrypt = (text) => {
  return Buffer.from(text, 'base64').toString('utf8');
};

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Routes ---

// 1. Client Message Submission
app.post('/api/client-messages', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Profanity Filter (Simple list)
  const badWords = ['spam', 'junk', 'badword']; // Expand as needed
  const containsProfanity = badWords.some(word => message.toLowerCase().includes(word));
  if (containsProfanity) {
    return res.status(400).json({ error: 'Message contains inappropriate content.' });
  }

  // Length Check
  if (message.length < 1 || message.length > 1000) {
    return res.status(400).json({ error: 'Message must be between 1 and 1000 characters.' });
  }

  // Sanitization
  const sanitizedMessage = xss(message);

  // Create Message Object
  const newMessage = {
    id: crypto.randomUUID(),
    name: xss(name),
    email: xss(email),
    subject: xss(subject),
    content: encrypt(sanitizedMessage), // Encrypt content
    timestamp: new Date().toISOString(),
    status: 'unread',
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };

  // Save to DB
  const db = getDb();
  db.messages.push(newMessage);
  saveDb(db);

  // Notify Admin via Socket
  io.emit('new_message', { ...newMessage, content: sanitizedMessage }); // Send decrypted content to admin

  res.status(201).json({ message: 'Message sent successfully.' });
});

// 2. Admin Login (Demo)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded for demo
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username: 'admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 3. Get Messages (Admin Only)
app.get('/api/messages', authenticateToken, (req, res) => {
  const db = getDb();
  // Decrypt messages for display
  const messages = db.messages.map(msg => ({
    ...msg,
    content: decrypt(msg.content)
  }));
  res.json(messages);
});

// 4. Update Message Status
app.patch('/api/messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const db = getDb();
  const msgIndex = db.messages.findIndex(m => m.id === id);
  
  if (msgIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  db.messages[msgIndex].status = status;
  saveDb(db);
  
  res.json(db.messages[msgIndex]);
});

// --- Socket.io ---
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
