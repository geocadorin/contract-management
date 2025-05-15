import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './credentials';


const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be provided as environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
