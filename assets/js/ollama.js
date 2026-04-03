/**
 * ollama.js — Ollama Local AI Connector
 * Handles model selection, streaming chat, and connection status
 */

const OLLAMA_BASE = 'http://localhost:11434';

const MODELS = [
  { id: 'llama3.2',     label: 'Llama 3.2',     icon: '🦙' },
  { id: 'mistral',      label: 'Mistral',        icon: '🌪️' },
  { id: 'phi3',         label: 'Phi-3',          icon: '⚡' },
  { id: 'deepseek-r1',  label: 'DeepSeek R1',    icon: '🔍' },
  { id: 'gemma3',       label: 'Gemma 3',        icon: '💎' },
  { id: 'llama3.1',     label: 'Llama 3.1',      icon: '🦙' },
];

// Agent system prompts
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

class OllamaConnector {
  constructor() {
    this.currentModel = localStorage.getItem('ollama_model') || 'llama3.2';
    this.isOnline = false;
    this.checkStatus();
  }

  setModel(modelId) {
    this.currentModel = modelId;
    localStorage.setItem('ollama_model', modelId);
    document.querySelectorAll('.model-select').forEach(el => el.value = modelId);
  }

  async checkStatus() {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
      this.isOnline = res.ok;
    } catch {
      this.isOnline = false;
    }
    this.updateStatusUI();
    return this.isOnline;
  }

  updateStatusUI() {
    document.querySelectorAll('.ollama-status').forEach(el => {
      el.className = `ollama-status ${this.isOnline ? 'ollama-online' : 'ollama-offline'}`;
      el.innerHTML = `<span class="${this.isOnline ? 'live-dot' : ''}"></span>${this.isOnline ? 'Ollama Online' : 'Ollama Offline'}`;
    });
  }

  async *streamChat(agentType, userMessage, conversationHistory = []) {
    if (!this.isOnline) {
      const ok = await this.checkStatus();
      if (!ok) {
        yield { type: 'error', text: '⚠️ Ollama is not running. Please start Ollama and try again.' };
        return;
      }
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.orchestrator },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.currentModel,
          messages,
          stream: true,
          options: { temperature: 0.7 }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              yield { type: 'chunk', text: json.message.content };
            }
            if (json.done) yield { type: 'done' };
          } catch { /* skip invalid JSON */ }
        }
      }
    } catch (err) {
      yield { type: 'error', text: `Connection error: ${err.message}` };
    }
  }

  async quickChat(agentType, userMessage) {
    let full = '';
    for await (const chunk of this.streamChat(agentType, userMessage)) {
      if (chunk.type === 'chunk') full += chunk.text;
      if (chunk.type === 'error') return chunk.text;
    }
    return full;
  }
}

// Global instance
const ollama = new OllamaConnector();

// ── Chat Manager ────────────────────────────────────────────────────
class ChatManager {
  constructor(containerId, inputId, sendBtnId, agentType) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.sendBtn = document.getElementById(sendBtnId);
    this.agentType = agentType;
    this.history = [];
    this.streaming = false;

    if (this.sendBtn) this.sendBtn.addEventListener('click', () => this.send());
    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
      });
    }
  }

  addMessage(role, content, isStreaming = false) {
    if (!this.container) return null;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `msg ${role} animate-in`;
    const isAI = role === 'ai';
    div.innerHTML = `
      <div class="msg-avatar">${isAI ? '🤖' : '👤'}</div>
      <div>
        <div class="msg-bubble ${isStreaming ? 'streaming-cursor' : ''}">${this.formatMsg(content)}</div>
        <div class="msg-time">${now}</div>
      </div>`;
    this.container.appendChild(div);
    this.container.scrollTop = this.container.scrollHeight;
    return div;
  }

  formatMsg(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:0.1em 0.3em;border-radius:3px">$1</code>')
      .replace(/\n/g, '<br>');
  }

  showTyping() {
    const div = document.createElement('div');
    div.className = 'msg ai animate-in';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    this.container.appendChild(div);
    this.container.scrollTop = this.container.scrollHeight;
  }

  removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  async send() {
    if (this.streaming || !this.input) return;
    const text = this.input.value.trim();
    if (!text) return;

    this.input.value = '';
    this.streaming = true;
    if (this.sendBtn) this.sendBtn.disabled = true;

    this.addMessage('user', text);
    this.history.push({ role: 'user', content: text });

    this.showTyping();
    let fullResponse = '';
    let msgEl = null;
    let bubble = null;

    for await (const chunk of ollama.streamChat(this.agentType, text, this.history.slice(-10))) {
      if (chunk.type === 'chunk') {
        this.removeTyping();
        if (!msgEl) {
          msgEl = this.addMessage('ai', '', true);
          bubble = msgEl?.querySelector('.msg-bubble');
        }
        fullResponse += chunk.text;
        if (bubble) bubble.innerHTML = this.formatMsg(fullResponse) + '<span class="streaming-cursor-bar">▊</span>';
        this.container.scrollTop = this.container.scrollHeight;
      }
      if (chunk.type === 'done' || chunk.type === 'error') {
        this.removeTyping();
        if (!msgEl) msgEl = this.addMessage('ai', fullResponse || chunk.text);
        else if (bubble) bubble.innerHTML = this.formatMsg(fullResponse);
        if (chunk.type === 'error' && !msgEl) this.addMessage('ai', chunk.text);
        break;
      }
    }

    if (fullResponse) this.history.push({ role: 'assistant', content: fullResponse });
    this.streaming = false;
    if (this.sendBtn) this.sendBtn.disabled = false;
  }

  useQuickPrompt(text) {
    if (this.input) this.input.value = text;
    this.input?.focus();
  }
}

// ── Model Selector Builder ──────────────────────────────────────────
function buildModelSelector(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="model-selector">
      <span>🤖</span>
      <select class="model-select" onchange="ollama.setModel(this.value)">
        ${MODELS.map(m => `<option value="${m.id}" ${ollama.currentModel === m.id ? 'selected' : ''}>${m.icon} ${m.label}</option>`).join('')}
      </select>
    </div>
    <div class="ollama-status ollama-offline">Checking...</div>`;
}

// ── Toast Notifications ─────────────────────────────────────────────
function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

// ── Ollama Setup Guide ──────────────────────────────────────────────
function showOllamaGuide() {
  const existing = document.getElementById('ollama-guide-modal');
  if (existing) { existing.remove(); return; }
  const modal = document.createElement('div');
  modal.id = 'ollama-guide-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem">
        <div style="font-size:2rem">🦙</div>
        <div><h3 style="font-size:1.1rem">Setup Ollama</h3><p style="font-size:0.8rem;color:var(--text-muted)">Run AI locally — free, private, fast</p></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.85rem">
        <div class="card" style="padding:0.75rem">
          <div style="font-weight:700;margin-bottom:0.4rem">1. Download Ollama</div>
          <code style="background:rgba(0,0,0,0.3);padding:0.3rem 0.6rem;border-radius:4px;display:block">https://ollama.com/download</code>
        </div>
        <div class="card" style="padding:0.75rem">
          <div style="font-weight:700;margin-bottom:0.4rem">2. Pull a model</div>
          <code style="background:rgba(0,0,0,0.3);padding:0.3rem 0.6rem;border-radius:4px;display:block">ollama pull llama3.2</code>
        </div>
        <div class="card" style="padding:0.75rem">
          <div style="font-weight:700;margin-bottom:0.4rem">3. Start Ollama</div>
          <code style="background:rgba(0,0,0,0.3);padding:0.3rem 0.6rem;border-radius:4px;display:block">ollama serve</code>
        </div>
        <div class="card" style="padding:0.75rem">
          <div style="font-weight:700;margin-bottom:0.35rem">Available models</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
            ${MODELS.map(m => `<span style="padding:0.2rem 0.5rem;background:rgba(124,58,237,0.15);border-radius:4px;font-size:0.75rem">${m.icon} ${m.label}</span>`).join('')}
          </div>
        </div>
      </div>
      <button class="btn btn-primary w-full mt-4" onclick="document.getElementById('ollama-guide-modal').remove()">Got it!</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
