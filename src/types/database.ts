export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      answers: {
        Row: {
          answered_at: string;
          id: string;
          is_correct: boolean;
          player_id: string;
          points: number;
          question_id: string;
          question_index: number;
          response_ms: number;
          selected_option_id: string;
          session_id: string;
        };
        Insert: {
          answered_at?: string;
          id?: string;
          is_correct: boolean;
          player_id: string;
          points: number;
          question_id: string;
          question_index: number;
          response_ms: number;
          selected_option_id: string;
          session_id: string;
        };
        Update: {
          answered_at?: string;
          id?: string;
          is_correct?: boolean;
          player_id?: string;
          points?: number;
          question_id?: string;
          question_index?: number;
          response_ms?: number;
          selected_option_id?: string;
          session_id?: string;
        };
        Relationships: [];
      };
      game_sessions: {
        Row: {
          allow_late_join: boolean;
          created_at: string;
          created_by: string | null;
          current_index: number;
          finished_at: string | null;
          id: string;
          join_pin: string | null;
          question_closed_at: string | null;
          question_ends_at: string | null;
          question_order: string[];
          question_started_at: string | null;
          started_at: string | null;
          state_version: number;
          status: Database['public']['Enums']['session_status'];
          total_questions: number;
        };
        Insert: {
          allow_late_join?: boolean;
          created_at?: string;
          created_by?: string | null;
          current_index?: number;
          finished_at?: string | null;
          id?: string;
          join_pin?: string | null;
          question_closed_at?: string | null;
          question_ends_at?: string | null;
          question_order: string[];
          question_started_at?: string | null;
          started_at?: string | null;
          state_version?: number;
          status?: Database['public']['Enums']['session_status'];
          total_questions: number;
        };
        Update: {
          allow_late_join?: boolean;
          created_at?: string;
          created_by?: string | null;
          current_index?: number;
          finished_at?: string | null;
          id?: string;
          join_pin?: string | null;
          question_closed_at?: string | null;
          question_ends_at?: string | null;
          question_order?: string[];
          question_started_at?: string | null;
          started_at?: string | null;
          state_version?: number;
          status?: Database['public']['Enums']['session_status'];
          total_questions?: number;
        };
        Relationships: [];
      };
      players: {
        Row: {
          correct_count: number;
          id: string;
          joined_at: string;
          name: string;
          name_key: string;
          session_id: string;
          token_hash: string;
          total_correct_ms: number;
          total_score: number;
        };
        Insert: {
          correct_count?: number;
          id?: string;
          joined_at?: string;
          name: string;
          session_id: string;
          token_hash: string;
          total_correct_ms?: number;
          total_score?: number;
        };
        Update: {
          correct_count?: number;
          id?: string;
          joined_at?: string;
          name?: string;
          session_id?: string;
          token_hash?: string;
          total_correct_ms?: number;
          total_score?: number;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          archived_at: string | null;
          base_points: number;
          correct_option_id: string;
          created_at: string;
          explanation: string | null;
          id: string;
          options: Json;
          position: number;
          prompt: string;
          time_limit_seconds: number;
          type: Database['public']['Enums']['question_type'];
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          base_points?: number;
          correct_option_id: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          options: Json;
          position: number;
          prompt: string;
          time_limit_seconds?: number;
          type: Database['public']['Enums']['question_type'];
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          base_points?: number;
          correct_option_id?: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          options?: Json;
          position?: number;
          prompt?: string;
          time_limit_seconds?: number;
          type?: Database['public']['Enums']['question_type'];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      advance_session: {
        Args: {
          p_action: string;
          p_expected_version: number;
          p_lead_in_ms?: number;
          p_session_id: string;
        };
        Returns: Database['public']['Tables']['game_sessions']['Row'];
      };
      create_session: {
        Args: {
          p_allow_late_join?: boolean;
          p_created_by: string | null;
          p_join_pin?: string | null;
        };
        Returns: Database['public']['Tables']['game_sessions']['Row'];
      };
      get_db_now: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_leaderboard: {
        Args: {
          p_limit?: number | null;
          p_session_id: string;
        };
        Returns: {
          correct_count: number;
          joined_at: string;
          name: string;
          player_id: string;
          rank: number;
          total_correct_ms: number;
          total_score: number;
        }[];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      join_session: {
        Args: {
          p_name: string;
          p_pin?: string | null;
          p_token_hash: string;
        };
        Returns: {
          player_id: string;
          player_name: string;
          session_id: string;
          session_status: Database['public']['Enums']['session_status'];
          state_version: number;
        }[];
      };
      kick_player: {
        Args: {
          p_player_id: string;
          p_session_id: string;
        };
        Returns: {
          closed_early: boolean;
          deleted: boolean;
          state_version: number;
        }[];
      };
      submit_answer: {
        Args: {
          p_option_id: string;
          p_player_id: string;
          p_question_index: number;
          p_session_id: string;
        };
        Returns: {
          already_answered: boolean;
          answered_count: number;
          closed_early: boolean;
          total_players: number;
        }[];
      };
    };
    Enums: {
      question_type: 'multiple_choice' | 'true_false';
      session_status: 'lobby' | 'running' | 'finished' | 'cancelled';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
