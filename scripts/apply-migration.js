#!/usr/bin/env node

/**
 * Apply database migration to add preferences column to profiles table
 * Run with: node scripts/apply-migration.js
 */

const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20260208_add_preferences_to_profiles.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Applying migration: add preferences to profiles table...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration failed:', error);
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
      console.log('---');
      console.log(sql);
      console.log('---');
      process.exit(1);
    }
    
    console.log('✓ Migration applied successfully!');
  } catch (err) {
    console.error('Error:', err);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log('---');
    console.log(sql);
    console.log('---');
  }
}

applyMigration();
