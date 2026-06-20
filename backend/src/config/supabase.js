const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-anon-key';

if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  console.log('\n======================================================');
  console.log('⚠️  WARNING: Supabase Environment Variables are missing!');
  console.log('Please add the following to your backend/.env file:');
  console.log('SUPABASE_URL=your_supabase_project_url');
  console.log('SUPABASE_KEY=your_supabase_service_role_key');
  console.log('======================================================\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
