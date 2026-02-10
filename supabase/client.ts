import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fadtmyzlnzuxlkmgfprk.supabase.co";
const SUPABASE_KEY = "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZHRteXpsbnp1eGxrbWdmcHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTg0OTgsImV4cCI6MjA4NjI5NDQ5OH0.Ap2vs9SaWlASKxjffyaullsfAwf8qxowa2-l6Y32D-o>";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
