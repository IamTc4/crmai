# RealEstate Growth OS — Implementation Plan

## Overview

Building a **multi-agent SaaS dashboard** — a full operating system for real estate builders.
- 7 Departments × 7 AI Agents + 1 Master Orchestrator
- Interactive chat interface per agent
- Full CRM pipeline view
- Analytics dashboard
- Content management tools

This is a **Phase 1 Web Platform** — pure HTML/CSS/JS with a Claude API-powered backend simulation. Production-ready architecture for extension to Node.js + PostgreSQL.

---

## User Review Required

> [!IMPORTANT]
> **Claude API Key Required**: The AI agent chat interfaces will use the Claude API. You'll need to provide your Anthropic API key. For now I'll build with a secure proxy-ready architecture (key stored server-side, not exposed in JS).

> [!WARNING]
> **Scope Decision**: This plan builds the **full interactive UI** — all 7 department dashboards + master orchestrator view. The backend (Node.js, PostgreSQL, Redis, Twilio) is Phase 2. The UI will simulate agent responses using real Claude API calls via a lightweight proxy.

> [!NOTE]
> **Multi-file Architecture**: The platform will be split into modular HTML/CSS/JS files — one per major section — for maintainability.

---

## Proposed Changes

### Project Structure

```
c:\work\crmai\
├── index.html                    # Master dashboard + orchestrator
├── assets/
│   ├── css/
│   │   ├── main.css              # Design system tokens, global styles
│   │   ├── dashboard.css         # Dashboard layout
│   │   ├── agent.css             # Agent chat interface
│   │   └── crm.css               # CRM pipeline styles
│   ├── js/
│   │   ├── app.js                # Router, state management
│   │   ├── orchestrator.js       # Master orchestrator logic
│   │   ├── agents/
│   │   │   ├── ad-strategist.js
│   │   │   ├── content-creator.js
│   │   │   ├── market-research.js
│   │   │   ├── lead-qualification.js
│   │   │   ├── followup-ai.js
│   │   │   ├── sales-closer.js
│   │   │   └── analytics-ai.js
│   │   ├── crm.js                # CRM pipeline logic
│   │   ├── analytics.js          # Dashboard charts
│   │   └── api.js                # Claude API connector
│   └── img/                      # Generated assets
├── pages/
│   ├── marketing.html            # Dept 1 – Ad Strategist AI
│   ├── content.html              # Dept 2 – Content Creator AI
│   ├── research.html             # Dept 3 – Market Research AI
│   ├── leads.html                # Dept 4 – Lead Qualification AI
│   ├── crm.html                  # Dept 5 – Follow-up AI + CRM
│   ├── sales.html                # Dept 6 – Sales Closer AI
│   └── analytics.html            # Dept 7 – Analytics AI
└── proxy/
    └── claude-proxy.js           # Node.js API proxy (key protection)
```

---

### Design System

**Color palette** (department-coded):
| Department | Color |
|---|---|
| Master Orchestrator | `#7C3AED` (violet) |
| Marketing Engine | `#2563EB` (blue) |
| Content Engine | `#059669` (emerald) |
| Research Intel | `#D97706` (amber) |
| Lead Generation | `#DC2626` (red) |
| CRM + Automation | `#16A34A` (green) |
| Sales Conversion | `#BE185D` (pink) |
| Performance Tracking | `#6B7280` (slate) |

**Typography**: Inter (Google Fonts)  
**Mode**: Dark mode first (matches architecture diagram aesthetic)  
**Style**: Glass morphism cards, gradient accents, smooth micro-animations

---

### Pages & Features

#### [NEW] index.html — Master Dashboard
- System-wide KPI banner (CPL, Leads Today, Revenue, Active Campaigns)
- Architecture diagram (interactive — click dept → navigate to its page)
- Master Orchestrator chat (routes your query to correct agent)
- Live activity feed (simulated real-time events)
- Quick-action cards per department

#### [NEW] pages/marketing.html — Ad Strategist AI
- Chat interface with Ad Strategist system prompt loaded
- Ad copy generator (input: project, location, budget → output: 3 variants)
- Campaign performance table (mock data with charts)
- Competitor ad spy panel
- Budget optimizer visual

#### [NEW] pages/content.html — Content Creator AI
- 4-employee pipeline visualization (Trend → Strategy → Script → Analysis)
- 30-day content calendar generator
- Script writer with content type selector (reel/caption/blog/email)
- Content performance tab

#### [NEW] pages/research.html — Market Research AI
- Competitor analysis input form → structured JSON output
- Buyer persona generator
- Market report viewer
- Micro-market demand heatmap (visual)

#### [NEW] pages/leads.html — Lead Qualification AI
- Lead intake form + instant scoring
- Hot/Warm/Cold lead pipeline view
- Behavioral scoring panel
- Fake lead filter alerts

#### [NEW] pages/crm.html — Follow-up AI + CRM
- Kanban-style pipeline: New → Contacted → Interested → Visit Scheduled → Negotiating → Closed
- Lead cards with drag-and-drop
- Follow-up message generator UI
- WhatsApp/Email/SMS channel selector
- Auto-sequence scheduler

#### [NEW] pages/sales.html — Sales Closer AI
- 3-mode interface: Pre-call Briefing / Live Objection Handler / Post-call Summary
- Objection handler library
- Closing probability score per lead
- Competitive comparison card generator

#### [NEW] pages/analytics.html — Analytics AI
- Real-time KPI dashboard (Chart.js)
- Funnel visualization
- Channel attribution chart
- AI weekly report generator
- Budget reallocation recommendations

---

## Open Questions

> [!IMPORTANT]
> **Do you have a Claude API key?** The agent chat interfaces need one. I'll build the proxy so the key is never exposed in client JS.

> [!IMPORTANT]
> **Starting point**: Should I build **all 7 pages + master dashboard** in one go, or start with the **Master Dashboard + 2-3 key departments** (e.g., Lead Qualification + CRM + Analytics) first?

> [!NOTE]
> **Mock data vs. live**: For the CRM, analytics charts, and lead lists — should I use realistic mock data to demo the full system, or leave them as empty shells?

> [!NOTE]
> **Branding**: What is the platform name? I'll use "Growth OS" unless you specify otherwise. Any logo or brand colors to match?

---

## Verification Plan

### Automated
- Open each page in browser, verify navigation works between all 7 departments
- Confirm agent chat sends prompts and receives responses (with API key)
- Test CRM kanban drag-and-drop
- Test content calendar generator

### Manual
- Visual review of each department page
- Verify system prompt is correctly pre-loaded per agent
- Confirm responsive layout on desktop

---

## Timeline Estimate

| Phase | Scope | Time |
|---|---|---|
| Design System + Index | Tokens, master dashboard, architecture diagram | ~45 min |
| 7 Department Pages | All agents, CRM, analytics | ~2-3 hrs |
| Charts + Interactivity | Chart.js, kanban, calendar | ~1 hr |
| Claude API Integration | Proxy + agent routing | ~30 min |
