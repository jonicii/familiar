import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types will be generated from Supabase
export interface Household {
  id: string;
  name: string;
  invite_code: string;
  google_calendar_id?: string;
  created_at: string;
}

export interface Member {
  id: string;
  household_id: string;
  name: string;
  color: string;
  avatar_url?: string;
  created_at: string;
}

export interface Note {
  id: string;
  household_id: string;
  content: string;
  pinned: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  household_id: string;
  title: string;
  completed: boolean;
  assigned_to?: string;
  due_date?: string;
  created_by: string;
  created_at: string;
}

export interface List {
  id: string;
  household_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  content: string;
  checked: boolean;
  created_by: string;
  created_at: string;
}