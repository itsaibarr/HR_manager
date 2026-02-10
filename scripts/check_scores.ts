import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { getScoreBand } from './src/lib/evaluation/framework';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching evaluations...');
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('id, final_score, candidate_id');

  if (error) {
    console.error('Error fetching evaluations:', error);
    return;
  }

  console.log(`Found ${evaluations.length} evaluations.`);
  
  const scoreCounts: Record<string, number> = {};
  
  evaluations.forEach((ev: any) => {
    const band = getScoreBand(ev.final_score);
    scoreCounts[band] = (scoreCounts[band] || 0) + 1;
    if (band === 'Baseline Capable') {
        console.log(`Candidate ${ev.candidate_id} has score ${ev.final_score} and is Baseline Capable`);
    }
  });

  console.log('Score Band Distribution:', scoreCounts);
}

main();
