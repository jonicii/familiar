import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyhuiguymzvnqtfslshz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6BOw4YxobjorF-D0Rc3Dbw_g81aiYzK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  google_calendar_id?: string;
}

export interface Member {
  id: string;
  household_id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  household_id: string;
  content: string;
  pinned: boolean;
  created_by?: string;
}

export interface Task {
  id: string;
  household_id: string;
  title: string;
  completed: boolean;
  assigned_to?: string;
  due_date?: string;
}

export interface List {
  id: string;
  household_id: string;
  name: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  content: string;
  checked: boolean;
}

// Hardcoded for now - will be replaced with auth later
export const TEST_HOUSEHOLD_INVITE_CODE = 'JAKOBSEN2026';
