const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const db = new Database('users.db');
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE,
    role TEXT CHECK(role IN ('admin', 'employee')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create initial admin user if not exists
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)').run(
    'admin',
    hashedPassword,
    'admin@example.com',
    'admin'
  );
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// User routes
app.get('/api/users', authenticateToken, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, created_at, updated_at FROM users').all();
  res.json(users);
});

app.post('/api/users', authenticateToken, (req, res) => {
  const { username, password, email, role } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create users' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)'
    ).run(username, hashedPassword, email, role);
    
    const newUser = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Username or email already exists' });
  }
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { username, email, role, password } = req.body;
  const userId = req.params.id;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update users' });
  }

  try {
    let query = 'UPDATE users SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP';
    let params = [username, email, role];

    if (password) {
      query += ', password = ?';
      params.push(bcrypt.hashSync(password, 10));
    }

    query += ' WHERE id = ?';
    params.push(userId);

    db.prepare(query).run(...params);
    
    const updatedUser = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(userId);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Username or email already exists' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete users' });
  }

  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.sendStatus(204);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});