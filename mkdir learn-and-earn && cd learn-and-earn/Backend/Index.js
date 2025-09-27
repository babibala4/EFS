// Simple Express API with SQLite storage
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) console.error('DB open error', err);
  else console.log('SQLite DB connected:', DB_FILE);
});

db.serialize(() => {
  // tables
  db.run(`CREATE TABLE IF NOT EXISTS gigs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    skills TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gig_id INTEGER,
    student_name TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(gig_id) REFERENCES gigs(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS microtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    reward REAL,
    task_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    student_name TEXT,
    content TEXT,
    status TEXT DEFAULT 'submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES microtasks(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_word TEXT,
    quiz_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // seed sample data if empty
  db.get(`SELECT COUNT(*) as cnt FROM gigs`, (err, row) => {
    if (!err && row && row.cnt === 0) {
      db.run(`INSERT INTO gigs (title, description, price, skills) VALUES (?,?,?,?)`,
        ["Create 6 Instagram captions", "Write captions and hashtags for 6 posts", 15.00, "instagram,copywriting"]);
      db.run(`INSERT INTO gigs (title, description, price, skills) VALUES (?,?,?,?)`,
        ["Edit 1-minute video", "Quick 60s edit for Reels/TikTok", 20.00, "video-editing"]);
    }
  });

  db.get(`SELECT COUNT(*) as cnt FROM microtasks`, (err, row) => {
    if (!err && row && row.cnt === 0) {
      db.run(`INSERT INTO microtasks (title, reward, task_type) VALUES (?,?,?)`,
        ["5-question survey on school life", 2.00, "survey"]);
      db.run(`INSERT INTO microtasks (title, reward, task_type) VALUES (?,?,?)`,
        ["Record 30s speaking challenge", 3.00, "record"]);
    }
  });

  db.get(`SELECT COUNT(*) as cnt FROM lessons`, (err, row) => {
    if (!err && row && row.cnt === 0) {
      const quiz = JSON.stringify([
        { "id": 1, "q": "What's a synonym of 'happy'?", "options": ["sad", "glad", "angry"], "answer": 1 },
        { "id": 2, "q": "Choose the correct form: I ___ to school yesterday.", "options": ["go", "went", "gone"], "answer": 1 }
      ]);
      db.run(`INSERT INTO lessons (daily_word, quiz_json) VALUES (?,?)`, ["serendipity", quiz]);
    }
  });
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- gigs ---
app.get('/api/gigs', (req, res) => {
  db.all('SELECT * FROM gigs ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/gigs', (req, res) => {
  const { title, description, price, skills } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
  db.run('INSERT INTO gigs (title, description, price, skills) VALUES (?,?,?,?)',
    [title, description || '', price || 0, skillsStr], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.get('/api/gigs/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM gigs WHERE id = ?', [id], (err, gig) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!gig) return res.status(404).json({ error: 'not found' });
    db.all('SELECT * FROM applications WHERE gig_id = ? ORDER BY created_at DESC', [id], (err2, apps) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ ...gig, applications: apps });
    });
  });
});

app.post('/api/gigs/:id/apply', (req, res) => {
  const id = req.params.id;
  const { student_name, message } = req.body;
  if (!student_name) return res.status(400).json({ error: 'student_name required' });
  db.run('INSERT INTO applications (gig_id, student_name, message) VALUES (?,?,?)', [id, student_name, message || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// --- microtasks ---
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM microtasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, reward, task_type } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  db.run('INSERT INTO microtasks (title, reward, task_type) VALUES (?,?,?)', [title, reward || 1, task_type || 'survey'], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.post('/api/tasks/:id/complete', (req, res) => {
  const id = req.params.id;
  const { student_name, content } = req.body;
  if (!student_name) return res.status(400).json({ error: 'student_name required' });
  // For MVP we auto-approve
  db.run('INSERT INTO submissions (task_id, student_name, content, status) VALUES (?,?,?,?)', [id, student_name, content || '', 'approved'], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, status: 'approved' });
  });
});

// --- lessons ---
app.get('/api/lessons/daily', (req, res) => {
  db.get('SELECT * FROM lessons ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({ daily_word: null, quiz: [] });
    const quiz = JSON.parse(row.quiz_json || '[]');
    res.json({ id: row.id, daily_word: row.daily_word, quiz });
  });
});

app.post('/api/lessons/:id/quiz-submit', (req, res) => {
  const id = req.params.id;
  const { answers } = req.body; // answers should be an array of selected option indexes
  db.get('SELECT * FROM lessons WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'not found' });
    const quiz = JSON.parse(row.quiz_json || '[]');
    let score = 0;
    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (Array.isArray(answers) && answers[i] !== undefined && parseInt(answers[i], 10) === q.answer) score++;
    }
    res.json({ score, total: quiz.length });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API listening at http://localhost:${PORT}`);
});
