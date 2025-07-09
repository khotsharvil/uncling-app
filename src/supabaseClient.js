import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvuhbxqiclqzafooeysm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dWhieHFpY2xxemFmb29leXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjAzOTYsImV4cCI6MjA2NzI5NjM5Nn0.FbHypFHTwB2hPHP5jZV68_0c_3UNQpq8NUWelhLQfa8';
export const supabase = createClient(supabaseUrl, supabaseKey);