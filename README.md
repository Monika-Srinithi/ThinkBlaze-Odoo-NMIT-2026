<div align="center">

# 🚀 ThinkBlaze Dayflow

**AI-Powered Human Resource Management System**

*Odoo × NMIT Bangalore Hackathon 2026 Submission*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6B6B?style=for-the-badge)](https://langchain.ai)

</div>

---

## 🎯 What is Dayflow?

Dayflow is an intelligent HR management platform that combines traditional HRMS workflows with AI-powered workforce intelligence. It predicts workforce risks, simulates what-if scenarios, and deploys a multi-agent system to automate HR decision support.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🏢 **Core HRMS** | Employee management, attendance tracking, leave workflows |
| 📊 **Smart Dashboards** | Real-time employee and HR command center views |
| 🧠 **Workforce Intelligence** | AI-powered risk scoring and anomaly detection |
| 🔮 **What-If Simulator** | Scenario planning and impact analysis |
| 🤖 **Multi-Agent AI** | LangGraph orchestrator with 6 specialized HR agents |
| 📝 **Audit Trail** | Full audit logging and agent trace transparency |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React + TypeScript                 │
│              (Vite · Zustand · React Query)          │
└──────────────────────┬──────────────────────────────┘
                       │ REST API / WebSocket
┌──────────────────────▼──────────────────────────────┐
│                FastAPI Backend                       │
│         (Python 3.11 · SQLAlchemy · JWT)             │
│  ┌───────────────────────────────────────────────┐   │
│  │          LangGraph Multi-Agent System         │   │
│  │  Attendance · Leave · Workforce · Policy      │   │
│  │  Simulation · Decision · HR Copilot           │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │ SQLAlchemy ORM
┌──────────────────────▼──────────────────────────────┐
│              PostgreSQL 15                           │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or Docker)

### Option A — Docker (recommended)

```bash
cp .env.example .env
# Edit .env with your credentials
docker-compose up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option B — Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

---

## 🧪 Demo Credentials

After seeding the database (`python seed.py`):

| Role | Email | Password |
|------|-------|----------|
| HR Admin | admin@dayflow.com | Demo@1234 |
| Employee | john.doe@dayflow.com | Demo@1234 |
| Manager | sarah.mgr@dayflow.com | Demo@1234 |

---

## 📁 Project Structure

```
ThinkBlaze-Odoo-NMIT-2026/
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── components/    # Reusable UI
│       ├── pages/         # Route pages
│       ├── hooks/         # Custom hooks
│       ├── store/         # Zustand stores
│       ├── api/           # API client
│       └── types/         # TypeScript types
├── backend/           # FastAPI
│   └── app/
│       ├── api/           # Route handlers
│       ├── core/          # Config, security, DB
│       ├── models/        # SQLAlchemy models
│       ├── schemas/       # Pydantic schemas
│       ├── services/      # Business logic
│       └── agents/        # LangGraph agents
├── database/          # SQL init scripts
├── docs/              # Documentation
├── docker-compose.yml
├── .env.example       # Template — never commit .env
└── README.md
```

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| Monika Srinithi | Full-Stack & AI Lead | [@Monika-Srinithi](https://github.com/Monika-Srinithi) |
| Kishore | Backend & HRMS | [@Kishore](https://github.com) |
| Shivani | Frontend & Dashboards | [@Shivani](https://github.com) |

---

## 📜 License

MIT License — See [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for Odoo × NMIT Bangalore Hackathon 2026
</div>
