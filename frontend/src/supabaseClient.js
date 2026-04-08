import { createClient } from '@supabase/supabase-js';

// On laisse les variables vides, tu les rempliras dès qu'il te répond
const supabaseUrl = 'https://ctgykzyluvmevypltxja.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3lrenlsdXZtZXZ5cGx0eGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjcyNzcsImV4cCI6MjA4OTUwMzI3N30.Gjg9q12lxk4YcUuubw2ypx9Sx6Z1ozAxAd6XFBqt4mE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



