import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgfzybothfnhsivxzbat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZnp5Ym90aGZuaHNpdnh6YmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTMzODksImV4cCI6MjA2NjEyOTM4OX0.G1o6B6ax_PdLPJroqF2feh1ph2F5040FADVnzikMOGY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);