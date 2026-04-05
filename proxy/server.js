require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getDbConnection, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// Gemini API Key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const SYSTEM_PROMPTS = {
  orchestrator: `You are the Master Orchestrator of a real estate Growth OS. You coordinate 7 specialized AI agents: Ad Strategist, Content Creator, Market Research, Lead Qualifier, CRM Follow-up, Sales Closer, and Analytics AI. Route user queries to the right department. Be concise, strategic, and decisive. When appropriate, explain which agent you're engaging and why. Focus on Indian real estate market context.`,
  marketing: `You are an expert real estate digital marketing strategist specializing in the Indian market. You create data-driven ad campaigns for real estate builders on Meta, Google, Instagram, and YouTube. You analyze campaign performance, generate compelling ad copy, suggest budget allocation, and identify competitor strategies. Always output structured recommendations with specific metrics and actionable next steps. Respond with ad variants, targeting suggestions, and performance benchmarks.`,
  content: `You are a real estate content creation specialist. You produce viral reels scripts, engaging captions, blog posts, email sequences, and WhatsApp broadcasts for real estate builders. You understand buyer psychology, property showcase techniques, and platform algorithms. Generate content that converts browsers into leads. Always tailor content to the specific project, location, and target demographic provided.`,
  research: `You are a real estate market research analyst with deep expertise in Indian residential and commercial properties. You analyze micro-markets, track competitor pricing and strategies, generate buyer personas, and identify demand trends. Provide structured reports with data tables, competitive intelligence, and market forecasting. Use realistic Indian city data (Mumbai, Pune, Bangalore, Hyderabad, etc.).`,
  leads: `You are an AI lead qualification engine for real estate. Score leads 0-100 based on: budget alignment (30pts), purchase timeline (25pts), intent signals (25pts), location match (20pts). Output structured JSON with score, segment (Hot/Warm/Cold), reasoning, and recommended next action. Flag suspicious patterns like duplicate numbers or out-of-range budgets. Be decisive and specific.`,
  crm: `You are a real estate CRM and follow-up automation AI. Generate personalized follow-up messages via WhatsApp, Email, SMS, and call scripts. Adapt tone based on lead temperature and stage (New/Contacted/Interested/Visit Scheduled/Negotiating/Closing). Reference the lead's specific project interest, budget, and last touchpoint. Keep messages natural, warm, and conversion-focused.`,
  sales: `You are an elite real estate sales coach specializing in closing high-value property deals. Handle buyer objections about price, location, project delays, builder reputation, and competition. Provide proven closing scripts, handle price negotiations, and generate pre-call briefings. You understand Indian buyer psychology deeply — family dynamics, investment mindset, EMI sensitivity. Be direct, confident, and effective.`,
  analytics: `You are a real estate performance analytics AI. Analyze campaign data, lead funnels, sales conversion metrics, and ROI across channels. Generate insights on what's working, what's not, and where to reallocate budget. Produce weekly performance narratives, identify anomalies, and make data-backed recommendations. Reference specific metrics: CPL, conversion rates, ROAS, lead velocity, and pipeline value.`,
};

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Request logging

// Serve frontend static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

// Rate Limiting (20 requests per minute per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Rate limit exceeded. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({error: 'Unauthorized'});

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({error: 'Forbidden'});
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'API Proxy is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), version: '1.0.0' });
});

// Initialize Database on startup
initializeDatabase().catch(console.error);

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Use PIN_CODE from env for simple auth
  const pin = process.env.PIN_CODE || 'admin';

  // Basic hardcoded auth for demo + roles
  if (username === 'admin' && password === pin) {
    const token = jwt.sign({ username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: 'admin' });
  } else if (username === 'manager' && password === pin) {
    const token = jwt.sign({ username: 'manager', role: 'manager' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: 'manager' });
  } else if (username === 'sales' && password === pin) {
    const token = jwt.sign({ username: 'sales', role: 'sales' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: 'sales' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- CRM Endpoints ---

// Get all leads
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection();
    const leads = await db.all('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Add a new lead
app.post('/api/leads', authenticateToken, async (req, res) => {
  try {
    const { name, project, source, value, score, stage } = req.body;
    if (!name || !stage) return res.status(400).json({ error: 'Name and stage are required' });

    const db = await getDbConnection();
    const result = await db.run(
      `INSERT INTO leads (name, project, source, value, score, stage) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, project || '', source || 'Direct', value || 0, score || 50, stage]
    );
    res.status(201).json({ id: result.lastID, message: 'Lead added successfully' });
  } catch (error) {
    console.error('Error adding lead:', error);
    res.status(500).json({ error: 'Failed to add lead' });
  }
});

// Update lead stage
app.put('/api/leads/:id/stage', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ error: 'Stage is required' });

    const db = await getDbConnection();
    await db.run(
      `UPDATE leads SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [stage, id]
    );
    res.json({ message: 'Lead stage updated successfully' });
  } catch (error) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
});

// --- Chat Endpoint (Gemini Streaming) ---

app.post('/api/chat', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const { agentType, message, history, model } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.orchestrator;

    // Prepare Gemini model
    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    // Format history for Gemini
    const chatHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = geminiModel.startChat({
      history: chatHistory
    });

    const result = await chat.sendMessageStream(message);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
  console.log(`Frontend and API are both served from this port.`);
});
