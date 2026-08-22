# ThinkBlaze Dayflow — Architecture Decision Records

## ADR-001: Technology Stack Selection

**Status:** Accepted

**Context:** Need a modern, maintainable full-stack for an HRMS hackathon submission.

**Decision:**
- **Frontend:** React 18 + TypeScript + Vite (fast dev server, excellent DX)
- **Backend:** FastAPI (async, auto-docs, type safety via Pydantic)
- **Database:** PostgreSQL 15 (proven ACID-compliant RDBMS for HR data)
- **ORM:** SQLAlchemy 2.0 async (modern async support)
- **State:** Zustand (minimal boilerplate vs Redux)
- **Data Fetching:** TanStack Query (caching, background refetch)
- **AI:** LangGraph (graph-based multi-agent orchestration)

---

## ADR-002: Authentication Strategy

**Status:** Accepted

**Context:** Need secure auth with multi-role support.

**Decision:** JWT with access token (60min) + refresh token (7 days). Stored in localStorage (access) and httpOnly cookie consideration for production. Role-based access via middleware dependency.

---

## ADR-003: Agent Architecture

**Status:** Accepted

**Context:** Need AI agents that work without an API key for demo/judging.

**Decision:** All agents implement dual mode:
1. **Mock mode** (no API key): Returns deterministic, realistic responses from pre-computed data
2. **LLM mode** (API key present): Uses OpenAI via LangChain

This ensures the system works fully for hackathon demo without exposing API keys.

---

## ADR-004: Database Schema — Generated Columns for Payroll

**Status:** Accepted

**Decision:** `gross_salary` and `net_salary` are PostgreSQL generated columns (computed from other columns). Eliminates business logic duplication.

---

## ADR-005: Glassmorphism Design System

**Status:** Accepted

**Decision:** Dark glassmorphism design (bg: #0f0f1a, cards: rgba white 5%) for premium aesthetic. CSS custom properties for consistency. Framer Motion for animations.
