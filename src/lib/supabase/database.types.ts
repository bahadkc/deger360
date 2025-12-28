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
      customers: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string
          address: string | null
          tc_kimlik: string | null
          dosya_takip_numarasi: string | null
          iban: string | null
          payment_person_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          full_name: string
          address?: string | null
          tc_kimlik?: string | null
          dosya_takip_numarasi?: string | null
          iban?: string | null
          payment_person_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string
          address?: string | null
          tc_kimlik?: string | null
          dosya_takip_numarasi?: string | null
          iban?: string | null
          payment_person_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          customer_id: string
          case_number: string
          status: string
          vehicle_plate: string
          vehicle_brand_model: string
          accident_date: string
          accident_location: string | null
          damage_amount: number | null
          value_loss_amount: number | null
          fault_rate: number
          estimated_compensation: number | null
          commission_rate: number
          current_stage: string
          board_stage: string | null
          assigned_lawyer: string | null
          start_date: string
          estimated_completion_date: string | null
          completion_date: string | null
          notary_and_file_expenses: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          case_number: string
          status?: string
          vehicle_plate: string
          vehicle_brand_model: string
          accident_date: string
          accident_location?: string | null
          damage_amount?: number | null
          value_loss_amount?: number | null
          fault_rate?: number
          estimated_compensation?: number | null
          commission_rate?: number
          current_stage?: string
          board_stage?: string | null
          assigned_lawyer?: string | null
          start_date?: string
          estimated_completion_date?: string | null
          completion_date?: string | null
          notary_and_file_expenses?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          case_number?: string
          status?: string
          vehicle_plate?: string
          vehicle_brand_model?: string
          accident_date?: string
          accident_location?: string | null
          damage_amount?: number | null
          value_loss_amount?: number | null
          fault_rate?: number
          estimated_compensation?: number | null
          commission_rate?: number
          current_stage?: string
          board_stage?: string | null
          assigned_lawyer?: string | null
          start_date?: string
          estimated_completion_date?: string | null
          completion_date?: string | null
          notary_and_file_expenses?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          case_id: string
          name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          category: string
          status: string
          uploaded_by: string
          uploaded_at: string
          description: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          category: string
          status?: string
          uploaded_by?: string
          uploaded_at?: string
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          category?: string
          status?: string
          uploaded_by?: string
          uploaded_at?: string
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      process_steps: {
        Row: {
          id: string
          case_id: string
          step_order: number
          title: string
          description: string | null
          status: string
          start_date: string | null
          end_date: string | null
          duration_days: number | null
          completed_tasks: string[] | null
          missing_items: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          step_order: number
          title: string
          description?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          duration_days?: number | null
          completed_tasks?: string[] | null
          missing_items?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          step_order?: number
          title?: string
          description?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          duration_days?: number | null
          completed_tasks?: string[] | null
          missing_items?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_tasks: {
        Row: {
          id: string
          case_id: string
          title: string
          description: string | null
          task_type: string
          status: string
          completed: boolean
          completed_at: string | null
          related_document_id: string | null
          deadline: string | null
          urgent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          title: string
          description?: string | null
          task_type: string
          status?: string
          completed?: boolean
          completed_at?: string | null
          related_document_id?: string | null
          deadline?: string | null
          urgent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          title?: string
          description?: string | null
          task_type?: string
          status?: string
          completed?: boolean
          completed_at?: string | null
          related_document_id?: string | null
          deadline?: string | null
          urgent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          case_id: string
          type: string
          title: string
          description: string | null
          performed_by: string | null
          user_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          type: string
          title: string
          description?: string | null
          performed_by?: string | null
          user_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          type?: string
          title?: string
          description?: string | null
          performed_by?: string | null
          user_name?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          case_id: string
          amount: number
          payment_type: string
          payment_method: string | null
          status: string
          payment_date: string | null
          iban: string | null
          account_holder: string | null
          description: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          amount: number
          payment_type: string
          payment_method?: string | null
          status?: string
          payment_date?: string | null
          iban?: string | null
          account_holder?: string | null
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          amount?: number
          payment_type?: string
          payment_method?: string | null
          status?: string
          payment_date?: string | null
          iban?: string | null
          account_holder?: string | null
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          customer_id: string
          case_id: string
          title: string
          message: string
          type: string
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          case_id: string
          title: string
          message: string
          type?: string
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          case_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      user_auth: {
        Row: {
          id: string
          customer_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          customer_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}
