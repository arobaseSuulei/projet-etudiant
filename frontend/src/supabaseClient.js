import { createClient } from '@supabase/supabase-js';

// On laisse les variables vides, tu les rempliras dès qu'il te répond
const supabaseUrl = 'https://ctgykzyluvmevypltxja.supabase.co'; 
const supabaseAnonKey = 'ctgykzyluvmevypltxja';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
