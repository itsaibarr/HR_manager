export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  defaultView?: 'dashboard' | 'jobs' | 'candidates';
  density?: 'compact' | 'comfortable' | 'spacious';
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'hr_manager' | 'viewer';
          ai_config: Json | null;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'hr_manager' | 'viewer';
          ai_config?: Json | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'hr_manager' | 'viewer';
          ai_config?: Json | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_contexts: {
        Row: {
          id: string;
          title: string;
          original_description: string | null;
          responsibilities: string[];
          must_have_skills: string[];
          nice_to_have_skills: string[];
          experience_expectations: Json | null;
          non_requirements: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          original_description?: string | null;
          responsibilities: string[];
          must_have_skills: string[];
          nice_to_have_skills?: string[];
          experience_expectations?: Json | null;
          non_requirements?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          original_description?: string | null;
          responsibilities?: string[];
          must_have_skills?: string[];
          nice_to_have_skills?: string[];
          experience_expectations?: Json | null;
          non_requirements?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_profiles: {
        Row: {
          id: string;
          external_id: string | null;
          education: Json;
          experience: Json;
          projects: Json;
          skills: string[];
          collaboration_signals: string[];
          availability: Json | null;
          other_signals: Json | null;
          raw_cv_text: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          education?: Json;
          experience?: Json;
          projects?: Json;
          skills?: string[];
          collaboration_signals?: string[];
          availability?: Json | null;
          other_signals?: Json | null;
          raw_cv_text?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          education?: Json;
          experience?: Json;
          projects?: Json;
          skills?: string[];
          collaboration_signals?: string[];
          availability?: Json | null;
          other_signals?: Json | null;
          raw_cv_text?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          job_context_id: string;
          candidate_id: string;
          core_competencies_score: number;
          experience_results_score: number;
          collaboration_signals_score: number;
          cultural_practical_fit_score: number;
          education_other_score: number;
          final_score: number;
          score_band: 'Strong Fit' | 'Good Fit' | 'Borderline' | 'Reject';
          reasoning: string[];
          potential_concern: string;
          rejection_reason: string | null;
          status: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered';
          evaluated_by: string | null;
          ai_model_version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_context_id: string;
          candidate_id: string;
          core_competencies_score: number;
          experience_results_score: number;
          collaboration_signals_score: number;
          cultural_practical_fit_score: number;
          education_other_score: number;
          final_score: number;
          score_band: 'Strong Fit' | 'Good Fit' | 'Borderline' | 'Reject';
          reasoning: string[];
          potential_concern: string;
          rejection_reason?: string | null;
          status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered';
          evaluated_by?: string | null;
          ai_model_version?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_context_id?: string;
          candidate_id?: string;
          core_competencies_score?: number;
          experience_results_score?: number;
          collaboration_signals_score?: number;
          cultural_practical_fit_score?: number;
          education_other_score?: number;
          final_score?: number;
          score_band?: 'Strong Fit' | 'Good Fit' | 'Borderline' | 'Reject';
          reasoning?: string[];
          potential_concern?: string;
          rejection_reason?: string | null;
          status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered';
          evaluated_by?: string | null;
          ai_model_version?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
