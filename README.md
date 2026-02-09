# HR Manager MVP (AI-Powered Recruitment)

> **Automated, intelligent candidate screening that mimics human HR judgment.**

## 📖 Project Overview

### What is this?

HR Manager MVP is an AI-driven recruitment platform designed to help hiring teams process high volumes of CVs without losing the nuance of human evaluation. Unlike traditional ATS systems that rely on keyword matching (which often filters out great candidates), this system uses a Large Language Model (LLM) to "read" CVs, understand capabilities, and score candidates based on a holistic framework.

### The Problem

- **Resume Fatigue**: HR managers spend hours reviewing hundreds of CVs.
- **Keyword Bias**: Good candidates get rejected because they didn't use the exact keywords from the JD.
- **Inconsistent Scoring**: Different reviewers apply different standards.

### Who is this for?

- **Recruitment Agencies**: To process bulk applications faster.
- **Startups/SMEs**: To hire senior talent without a dedicated HR team.
- **Hiring Managers**: To get a ranked shortlist of "Force Multiplier" candidates instantly.

---

## ⚙️ How It Works

### High-Level Flow

1.  **Job Context Creation**: The user pastes a Job Description (JD) or writes a short summary.
2.  **Candidate Import**: User uploads PDF CVs or imports from a CSV.
3.  **Smart Parsing**: The system extracts text from PDFs using `pdf-parse`.
4.  **AI Evaluation**: The core engine (Gemini Pro) analyzes the candidate against the Job Context.
5.  **Scoring & Ranking**: Candidates are assigned a score (0-100) and placed into bands (e.g., "Force Multiplier", "Solid Contributor").

### Core Architecture

- **AI-First Logic**: The system prompt (`src/lib/ai/prompts.ts`) is designed to reject "checklist" thinking. It treats missing details as neutral, infers skills from context (e.g., "Production ownership" implies "Git"), and enforces a "Seniority Gate" before scoring.
- **Seniority Gating**: Before assigning a score, the AI classifies the candidate as Junior, Mid, Senior, or Expert. A "Clear Senior" is scored on a different curve than a "Junior", preventing false equivalencies.

---

## 🛠 Tech Stack

### Frontend

- **Next.js 14** (App Router): React framework for performance and SEO.
- **Tailwind CSS**: Utility-first styling for a custom, premium design system.
- **Framer Motion**: For smooth UI transitions and micro-interactions.
- **Shadcn UI**: Accessible, reusable component primitives.

### Backend & Infrastructure

- **Serverless API**: Next.js API Routes for handling parsing and AI requests.
- **Supabase**: PostgreSQL database for storing jobs, candidates, and evaluations.
- **Auth**: Supabase Auth (or Better Auth) for secure user management.

### AI & ML

- **Model**: Google Gemini Pro (via Vercel AI SDK).
- **Prompt Engineering**: Custom "Human HR" system prompt with chain-of-thought calibration.

---

## 📂 Project Structure

```bash
src/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # Server-side logic (Parsing, Uploads)
│   └── dashboard/        # Main application UI
├── components/           # React Components
│   ├── atoms/            # Smallest units (Buttons, Badges)
│   ├── molecules/        # Form fields, Cards
│   └── organisms/        # Complex sections (CandidateTable, Filters)
├── lib/                  # Core Business Logic
│   ├── ai/               # Prompts, Parser, Evaluator
│   ├── evaluation/       # Scoring Framework & Rules
│   └── supabase/         # Database Clients
└── scripts/              # Maintenance & Migration scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google Gemini API Key

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/hr-manager-mvp.git
    cd hr-manager-mvp
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Duplicate `.env.example` to `.env` and fill in your secrets.

    ```bash
    cp .env.example .env
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to create your first job context.

---

## 🔐 Environment Variables

The application requires the following environment variables to function.

| Variable                        | Description                                                 |
| :------------------------------ | :---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | content: Your Supabase Project URL                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | content: Your Supabase Anonymous Key (safe for client-side) |
| `SUPABASE_SERVICE_ROLE_KEY`     | content: Service Role Key (Server-side only, bypasses RLS)  |
| `GEMINI_API_KEY`                | content: Google Gemini API Key for the specific AI model    |
| `BETTER_AUTH_SECRET`            | content: Secret used for session encryption (if enabled)    |
| `RESEND_API_KEY`                | content: API Key for sending emails via Resend              |

**Security Note**: Never commit your `.env` file. It is included in `.gitignore` by default.

---

## 🛡️ Security & Privacy

- **No Hardcoded Secrets**: All API keys and sensitive credentials must be loaded via environment variables.
- **Git Hygiene**: `.env` and other sensitive configuration files are strictly ignored by git.
- **Data Isolation**: Each job context is isolated. Candidate data is processed ephemerally by the AI and stored securely in Supabase.

---

## 🚧 Project Status

**Current Status**: MVP (Minimum Viable Product)

- ✅ Core AI Evaluation Engine
- ✅ PDF Parsing & CSV Import
- ✅ Seniority Gating Logic
- ✅ Dashboard UI
- 🚧 Calendar Integration (Planned)
- 🚧 Automated Interview Scheduling (Planned)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
