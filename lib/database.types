export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserPrivilege = "admin" | "student"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          privilege: UserPrivilege
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          privilege?: UserPrivilege
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          privilege?: UserPrivilege
          updated_at?: string | null
        }
      }
      time_entries: {
        Row: {
          id: number
          user_id: string
          clock_in_time: string
          clock_out_time: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          clock_in_time: string
          clock_out_time?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string
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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"]
