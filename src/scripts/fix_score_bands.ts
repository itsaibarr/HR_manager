import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service key to bypass RLS if needed, or just standard key if allowed

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixScoreBands() {
  console.log("Fixing score bands...");

  // Fetch all evaluations
  const { data: evaluations, error } = await supabase
    .from("evaluations")
    .select("id, final_score, score_band");

  if (error) {
    console.error("Error fetching evaluations:", error);
    return;
  }

  console.log(`Found ${evaluations.length} evaluations.`);

  let updatedCount = 0;

  for (const ev of evaluations) {
    let correctBand = "Do Not Proceed";
    if (ev.final_score >= 85) correctBand = "Force Multiplier";
    else if (ev.final_score >= 70) correctBand = "Solid Contributor";
    else if (ev.final_score >= 60) correctBand = "Baseline Capable";

    if (ev.score_band !== correctBand) {
        console.log(`Fixing ${ev.id}: Score ${ev.final_score} was '${ev.score_band}', setting to '${correctBand}'`);
        
        const { error: updateError } = await supabase
            .from("evaluations")
            .update({ score_band: correctBand })
            .eq("id", ev.id);
            
        if (updateError) {
            console.error(`Failed to update ${ev.id}:`, updateError);
        } else {
            updatedCount++;
        }
    }
  }

  console.log(`Finished. Updated ${updatedCount} records.`);
}

fixScoreBands();
