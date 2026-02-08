export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'hr_manager' | 'viewer'
          ai_config: Json | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'hr_manager' | 'viewer'
          ai_config?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'hr_manager' | 'viewer'
          ai_config?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      job_contexts: {
        Row: {
          id: string
          title: string
          original_description: string | null
          responsibilities: string[]
          must_have_skills: string[]
          nice_to_have_skills: string[]
          experience_expectations: Json | null
          non_requirements: string[]
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          original_description?: string | null
          responsibilities: string[]
          must_have_skills: string[]
          nice_to_have_skills?: string[]
          experience_expectations?: Json | null
          non_requirements?: string[]
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          original_description?: string | null
          responsibilities?: string[]
          must_have_skills?: string[]
          nice_to_have_skills?: string[]
          experience_expectations?: Json | null
          non_requirements?: string[]
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_contexts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      candidate_profiles: {
        Row: {
          id: string
          external_id: string | null
          education: Json
          experience: Json
          projects: Json
          skills: string[]
          collaboration_signals: string[]
          availability: Json | null
          other_signals: Json | null
          raw_cv_text: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          external_id?: string | null
          education?: Json
          experience?: Json
          projects?: Json
          skills?: string[]
          collaboration_signals?: string[]
          availability?: Json | null
          other_signals?: Json | null
          raw_cv_text?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          external_id?: string | null
          education?: Json
          experience?: Json
          projects?: Json
          skills?: string[]
          collaboration_signals?: string[]
          availability?: Json | null
          other_signals?: Json | null
          raw_cv_text?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      evaluations: {
        Row: {
          id: string
          job_context_id: string
          candidate_id: string
          core_competencies_score: number
          experience_results_score: number
          collaboration_signals_score: number
          cultural_practical_fit_score: number
          education_other_score: number
          final_score: number
          score_band: 'Strong Fit' | 'Good Fit' | 'Borderline' | 'Reject'
          reasoning: string[]
          potential_concern: string
          rejection_reason: string | null
          status: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered'
          evaluated_by: string | null
          ai_model_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_context_id: string
          candidate_id: string
          core_competencies_score: number
          experience_results_score: number
          collaboration_signals_score: number
          cultural_practical_fit_score: number
          education_other_score: number
          final_score: number
          score_band: 'Strong Fit' | 'Good Fit' | 'Borderline' | 'Reject'
          reasoning: string[]
          potential_concern: string
          rejection_reason?: string | null
          status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered'
          evaluated_by?: string | null
          ai_model_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_context_id?: string
          candidate_id?: string
          core_competencies_score?: number
          experience_results_score?: number
          collaboration_signals_score?: number
          cultural_practical_fit_score?: number
          education_other_score?: number
          final_score?: number
          score_band?: 'Strong Fit' | 'Good Fit' | 'Borderline' | 'Reject'
          reasoning?: string[]
          potential_concern?: string
          rejection_reason?: string | null
          status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered'
          evaluated_by?: string | null
          ai_model_version?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_job_context_id_fkey"
            columns: ["job_context_id"]
            isOneToOne: false
            referencedRelation: "job_contexts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  defaultView?: 'dashboard' | 'jobs' | 'candidates';
  density?: 'compact' | 'comfortable' | 'spacious';
}
