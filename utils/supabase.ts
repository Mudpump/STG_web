/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmjivayvoiufdvmsvhek.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttaml2YXl2b2l1ZmR2bXN2aGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTg3NDQsImV4cCI6MjA4Mzg3NDc0NH0.JVhWsqq3nZbERR8pdULVSekBp4hYwudSx0BveHS84Ck';

export const supabase = createClient(supabaseUrl, supabaseKey);
