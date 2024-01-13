import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://rxyltmzhoyhvkptdmoog.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eWx0bXpob3lodmtwdGRtb29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3MTMwNDksImV4cCI6MjAyMDI4OTA0OX0.5NhtnvurC2iKIWS1rFjpYBwdxK-09sbyCEI5y02NR0k"
);

export default supabase;
