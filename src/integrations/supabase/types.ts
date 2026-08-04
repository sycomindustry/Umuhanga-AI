export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          instructions: string | null
          rubric: Json | null
          subject_id: string | null
          teacher_id: string
          title: string
          total_points: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          rubric?: Json | null
          subject_id?: string | null
          teacher_id: string
          title: string
          total_points?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          rubric?: Json | null
          subject_id?: string | null
          teacher_id?: string
          title?: string
          total_points?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      content_library: {
        Row: {
          content_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          level: string
          subject_id: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          level: string
          subject_id?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          level?: string
          subject_id?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          message: string
          response: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          message: string
          response: string
          subject_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          message?: string
          response?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_history_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_equipment: {
        Row: {
          equipment_id: string
          experiment_id: string
          id: string
          is_required: boolean | null
          notes: string | null
          quantity: number | null
        }
        Insert: {
          equipment_id: string
          experiment_id: string
          id?: string
          is_required?: boolean | null
          notes?: string | null
          quantity?: number | null
        }
        Update: {
          equipment_id?: string
          experiment_id?: string
          id?: string
          is_required?: boolean | null
          notes?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "lab_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_equipment_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          learning_objectives: Json | null
          level: Database["public"]["Enums"]["education_level"]
          materials: Json | null
          procedure: Json | null
          safety_notes: string | null
          subject_id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          learning_objectives?: Json | null
          level: Database["public"]["Enums"]["education_level"]
          materials?: Json | null
          procedure?: Json | null
          safety_notes?: string | null
          subject_id: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          learning_objectives?: Json | null
          level?: Database["public"]["Enums"]["education_level"]
          materials?: Json | null
          procedure?: Json | null
          safety_notes?: string | null
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_equipment: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          lab_type: string
          name: string
          properties: Json | null
          safety_level: string | null
          updated_at: string | null
          usage_instructions: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          lab_type: string
          name: string
          properties?: Json | null
          safety_level?: string | null
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          lab_type?: string
          name?: string
          properties?: Json | null
          safety_level?: string | null
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Relationships: []
      }
      lab_reports: {
        Row: {
          ai_feedback: string | null
          conclusion: string | null
          created_at: string | null
          data: Json | null
          experiment_id: string
          grade: number | null
          graphs: Json | null
          id: string
          observations: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          conclusion?: string | null
          created_at?: string | null
          data?: Json | null
          experiment_id: string
          grade?: number | null
          graphs?: Json | null
          id?: string
          observations?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          conclusion?: string | null
          created_at?: string | null
          data?: Json | null
          experiment_id?: string
          grade?: number | null
          graphs?: Json | null
          id?: string
          observations?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          id: string
          quiz_id: string
          score: number
          total_points: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          id?: string
          quiz_id: string
          score?: number
          total_points?: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number
          total_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          explanation: string | null
          id: string
          options: Json
          points: number | null
          question: string
          quiz_id: string
        }
        Insert: {
          correct_answer: number
          explanation?: string | null
          id?: string
          options?: Json
          points?: number | null
          question: string
          quiz_id: string
        }
        Update: {
          correct_answer?: number
          explanation?: string | null
          id?: string
          options?: Json
          points?: number | null
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          level: string
          subject_id: string | null
          time_limit: number | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          level: string
          subject_id?: string | null
          time_limit?: number | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          level?: string
          subject_id?: string | null
          time_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          id: string
          last_activity: string | null
          quizzes_taken: number | null
          subject_id: string
          topics_completed: Json | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          id?: string
          last_activity?: string | null
          quizzes_taken?: number | null
          subject_id: string
          topics_completed?: Json | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          id?: string
          last_activity?: string | null
          quizzes_taken?: number | null
          subject_id?: string
          topics_completed?: Json | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          level: Database["public"]["Enums"]["education_level"]
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          level: Database["public"]["Enums"]["education_level"]
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          level?: Database["public"]["Enums"]["education_level"]
          name?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          ai_feedback: string | null
          assignment_id: string
          attachments: Json | null
          content: string
          feedback: string | null
          grade: number | null
          graded_at: string | null
          id: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          ai_feedback?: string | null
          assignment_id: string
          attachments?: Json | null
          content: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          ai_feedback?: string | null
          assignment_id?: string
          attachments?: Json | null
          content?: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lab_sessions: {
        Row: {
          completed_at: string | null
          experiment_id: string
          id: string
          selected_equipment: Json | null
          session_data: Json | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          experiment_id: string
          id?: string
          selected_equipment?: Json | null
          session_data?: Json | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          experiment_id?: string
          id?: string
          selected_equipment?: Json | null
          session_data?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lab_sessions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_display_names: {
        Args: { _ids: string[] }
        Returns: {
          full_name: string
          id: string
        }[]
      }
      get_user_education_level: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["education_level"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: { Args: { _student_id: string }; Returns: boolean }
      is_teacher_of: { Args: { _student_id: string }; Returns: boolean }
      list_directory: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "parent" | "lab_tech"
      education_level: "primary" | "secondary" | "tvet"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student", "parent", "lab_tech"],
      education_level: ["primary", "secondary", "tvet"],
    },
  },
} as const
