# Strata: AI-Powered Recruitment (MVP)

> **High-density, technical-brutalist candidate screening that mimics senior HR judgment.**

---

## 📖 Project Overview

**Strata** is an AI-driven recruitment platform designed for precision. Unlike traditional keyword-based ATS systems, Strata uses Large Language Models (LLM) to perform deep, contextual reading of CVs—extracting capabilities, inferring ownership, and scoring candidates against an expert-calibrated framework.

### Why Strata?

- **Bias Reduction**: Rejects "checklist" thinking; focuses on demonstrated outcomes and system ownership.
- **Seniority Gating**: Automatically classifies candidates (Junior to Expert) using distinct evaluation curves for each level.
- **Technical Brutalism**: A UI designed for efficiency, not fluff. High information density, disciplined spacing, and zero visual noise.

---

## ⚙️ Core Architecture

### 1. Smart Evaluation Engine

The core engine (`src/lib/ai/evaluator.ts`) uses **Gemini 1.5 Pro** to process candidates. It follows a multi-step "Chain of Thought" reasoning process:

- **Parse**: Extract structured data from PDF/CSV.
- **Gate**: Determine seniority level to set the scoring baseline.
- **Score**: Evaluate across 5 dimensions (Core Competencies, Results, Leadership, Problem Solving, fit).

### 2. Technical Brutalist Design System

Built under strict constraints to ensure a professional, disciplined product feel:

- **Hierarchy over Symmetry**: Using controlled asymmetry to guide the eye to primary actions.
- **Restricted Palette**: High-contrast, single-primary color logic.
- **Deterministic Spacing**: Strict 4px/8px grid system.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Core**: React 19 / TypeScript 5.9
- **Database/Auth**: [Supabase](https://supabase.com/) & [Better Auth](https://www.better-auth.com/)
- **AI**: Google Gemini AI (Vertex AI SDK)
- **Styling**: Tailwind CSS 4 (Technical Brutalist aesthetic)
- **Email**: Resend API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com/) Account & Project
- [Google AI Studio](https://aistudio.google.com/) API Key (Gemini)

### Local Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/itsaibarr/HR_manager.git
   cd HR_manager
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment**:

   ```bash
   cp .env.example .env.local
   ```

   _Fill in your keys in `.env.local`._

4. **Run Dev**:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```bash
src/
├── app/                  # Next.js 16 App Router (Routes & Server Actions)
├── components/           # Atomic Design Structure (Atoms -> Molecules -> Organisms)
├── lib/                  # Core logic: AI Evaluator, Scoring Framework
├── hooks/                # Custom React hooks (Theme, Toast, Auth)
└── types/                # Centralized Type Definitions & Database Schemas
```

---

## 🛡️ Security & Privacy

- **Stateless Intelligence**: Candidate data is processed ephemerally.
- **Local Secrets**: All credentials are managed via environment variables and never committed to version control.
- **Disciplined Git**: `.env`, `.agent`, and `.claude` directories are strictly ignored.

---

## 📄 License

Strata is available under the [MIT License](LICENSE).
