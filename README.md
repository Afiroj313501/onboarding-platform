# AI-Powered Employee Onboarding Platform

A full-stack, role-based employee onboarding platform that streamlines the entire onboarding lifecycle for Employees, Managers, and HR Admins — with AI-assisted task generation, document intelligence, and feedback analysis built in.

## Overview

Onboarding a new employee usually means scattered emails, disconnected spreadsheets, and no clear visibility into what's actually been completed. This platform centralizes the entire process: HR Admins build onboarding plans and manage company documents, Managers track team progress and approve completed work, and Employees follow a clear, guided path through their first weeks — all backed by an AI assistant that can answer questions directly from company documents.

## Features

### Employee
- **Dashboard** — visual onboarding progress with a completion ring and task status breakdown
- **Tasks** — track assigned onboarding tasks with an adjustable progress slider, leave comments, and request due date extensions
- **Documents** — browse company documents, with AI-generated summaries for quick reference
- **Feedback** — submit feedback on the onboarding experience
- **AI Assistant** — ask general onboarding or workplace questions
- **Document Q&A** — ask questions answered directly from indexed company documents (RAG)

### Manager
- **Team Progress** — real-time view of each team member's onboarding completion
- **Approve Tasks** — review tasks marked 100% complete; approve or send back for revision with feedback
- **Team Feedback** — view feedback submitted by team members, with AI-generated sentiment analysis and theme summaries
- **Extension Requests** — approve or reject employee requests for more time on a task, surfaced directly on the dashboard

### HR Admin
- **Manage Employees** — convert registered users into employees, assign position and department
- **Upload Documents** — upload company documents (handbooks, policies), with per-document AI indexing for Q&A
- **Onboarding Plans** — build task lists for new employees manually or generate them automatically with AI based on role and department
- **Analytics Dashboard** — company-wide stats: completion rates, task status distribution, department breakdowns, and feedback trends

### AI Capabilities
- Conversational onboarding assistant (Gemini)
- Automatic onboarding task generation by role
- Document summarization
- Document Q&A via Retrieval-Augmented Generation (RAG) with vector similarity search
- Feedback sentiment and theme analysis

## Tech Stack

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS v4
- TanStack Query (React Query)
- React Router

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (with `pgvector` extension for embeddings)
- JWT authentication via httpOnly cookies
- Multer for file uploads

**AI**
- Google Gemini API — chat, task generation, summarization, feedback analysis
- Gemini Embeddings — semantic search for document Q&A

## Architecture

```
onboarding-platform/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Shared UI (Layout, Modal, ProgressRing, etc.)
│       ├── pages/           # Route-level pages, organized by role
│       └── lib/             # API client configuration
├── server/                  # Express backend
│   └── src/
│       ├── routes/          # REST endpoints, grouped by domain
│       ├── middleware/      # Auth middleware
│       ├── services/        # Gemini integration, text chunking
│       └── prisma/          # Database schema and client
└── README.md
```

### Data Model

Core entities: `User` (with role: Employee, Manager, HR Admin), `Company`, `Employee`, `Task`, `Document`, `DocumentChunk` (for RAG), `TaskComment`, `Feedback`.

Tasks support progress tracking (0–100%), comments, due date extension requests, and a manager approval/revision workflow. Documents can be indexed into embedded chunks for semantic search.





## License

Abdullah Firoj Private project — not currently licensed for external use.
