# HR Screening Agent MVP

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Copy `.env.local.example` (or use the provided template) to `.env.local` and fill in:
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
    - `GEMINI_API_KEY`: Your Google Gemini API Key
    - `BETTER_AUTH_SECRET`: Generate a random string
    - `BETTER_AUTH_URL`: `http://localhost:3000` (for local dev)

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## API Routes

- `POST /api/jobs`: Create a new job context
- `GET /api/jobs`: List all job contexts
- `POST /api/candidates`: Upload candidate profile
- `POST /api/evaluate`: Run AI evaluation
- `GET /api/evaluations`: List evaluations

## Database Schema

The core tables are:

- `profiles`: User profiles
- `job_contexts`: Job descriptions and criteria
- `candidate_profiles`: Candidate data (parsed from CVs)
- `evaluations`: AI evaluation results

## Design

The UI implementation is being handled separately via the `pencil-new.pen` file.
