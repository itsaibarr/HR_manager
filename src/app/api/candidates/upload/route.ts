import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseCvText } from '@/lib/ai/parser';
import { evaluateCandidate } from '@/lib/ai/evaluator';
import { JobContextSchema } from '@/types/schemas';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Polyfill for DOMMatrix which is missing in Node environment but required by pdf-parse dependencies
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {
    constructor(public data: Uint8ClampedArray, public width: number, public height: number) {}
  };
}
if (typeof global.Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {};
}

let pdf: any;
try {
  pdf = require('pdf-parse');
  console.log('[UPLOAD] pdf-parse loaded:', typeof pdf);
} catch (e) {
  console.error('[UPLOAD] Failed to load pdf-parse:', e);
} 

export async function POST(request: Request) {
  try {
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const jobId = formData.get('jobId') as string;
    const providedRawText = formData.get('rawText') as string | null;
    const manualName = formData.get('name') as string | null;
    const manualEmail = formData.get('email') as string | null;

    console.log(`[UPLOAD_API] Request received for jobId: ${jobId}, candidate: ${manualName || 'unknown'}`);

    if (!jobId || (!file && !providedRawText)) {
      return NextResponse.json({ error: 'Missing jobId or content (file/rawText)' }, { status: 400 });
    }

    // Fetch user profile for AI Config
    const { data: profile } = await supabase
        .from('profiles')
        .select('ai_config')
        .eq('id', user.id)
        .single();
    
    // Construct AI Config
    const aiConfig = profile?.ai_config as any;
    const config = aiConfig ? { provider: aiConfig.provider, apiKey: aiConfig.keys?.[aiConfig.provider] } : undefined;

    // 1. Extract Text
    let rawText = '';
    
    if (providedRawText) {
        rawText = providedRawText;
    } else if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (file.type === 'application/pdf') {
          try {
            const data = await pdf(buffer);
            rawText = data.text;
          } catch (e) {
            console.error('PDF Parse Error:', e);
            return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
          }
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
           rawText = buffer.toString('utf-8');
        } else {
             return NextResponse.json({ error: 'Only PDF and TXT files are supported' }, { status: 400 });
        }
    }
    
    // Clean text slightly
    rawText = rawText.replace(/\n\s*\n/g, '\n').trim();

    if (rawText.length < 50) {
         console.warn(`[UPLOAD] Text too short for candidate ${manualName || 'unknown'}`);
         return NextResponse.json({ error: 'Extracted text is too short to be a valid CV' }, { status: 400 });
    }

    console.log(`[UPLOAD] Processing candidate: ${manualName || 'unknown'} for jobId: ${jobId}`);

    // 2. Parse CV into Structured Data (AI)
    let candidateProfile;
    try {
        candidateProfile = await parseCvText(rawText, config);
    } catch (e) {
        console.error(`[UPLOAD] AI parsing failed for ${manualName || 'unknown'}:`, e);
        return NextResponse.json({ error: 'AI parsing failed' }, { status: 500 });
    }

    // 3. Fetch Job Context for Evaluation
    const { data: jobData, error: jobError } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
        console.error(`[UPLOAD] Job context ${jobId} not found`);
        return NextResponse.json({ error: 'Job context not found' }, { status: 404 });
    }

    const jobContext = {
        id: jobData.id,
        title: jobData.title,
        responsibilities: jobData.responsibilities,
        mustHaveSkills: jobData.must_have_skills,
        niceToHaveSkills: jobData.nice_to_have_skills,
        experienceExpectations: jobData.experience_expectations,
        nonRequirements: jobData.non_requirements,
        createdAt: new Date(jobData.created_at),
        updatedAt: new Date(jobData.updated_at)
    };
    
    // Safe parse to ensure it matches schema
    const safeJobContext = JobContextSchema.parse(jobContext);

    // 4. Evaluate Candidate (AI)
    const evaluationResult = await evaluateCandidate(safeJobContext, candidateProfile, config);

    // 5. Store in Database
    
    // A. Create Candidate Profile
    const { data: profileData, error: profileError } = await supabase
      .from('candidate_profiles')
      .insert({
        full_name: manualName || candidateProfile.fullName || "",
        email: manualEmail || candidateProfile.email || "",
        education: candidateProfile.education || [],
        experience: candidateProfile.experience || [],
        projects: candidateProfile.projects || [],
        skills: candidateProfile.skills || [],
        collaboration_signals: candidateProfile.collaborationSignals || [],
        availability: candidateProfile.availability || null,
        other_signals: candidateProfile.otherSignals || null,
        raw_cv_text: rawText,
        created_by: user.id
      })
      .select()
      .single();

    if (profileError) {
        console.error('[UPLOAD] Profile Insert Error:', profileError);
        console.error('[UPLOAD] Attempted to insert:', {
          full_name: manualName || candidateProfile.fullName || "",
          email: manualEmail || candidateProfile.email || "",
          hasEducation: !!candidateProfile.education,
          hasExperience: !!candidateProfile.experience,
        });
        return NextResponse.json({ error: 'Failed to save candidate profile', details: profileError.message }, { status: 500 });
    }

    // B. Create Evaluation
    const { data: evalData, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        job_context_id: jobId,
        candidate_id: profileData.id,
        core_competencies_score: evaluationResult.coreCompetenciesScore,
        experience_results_score: evaluationResult.experienceResultsScore,
        collaboration_signals_score: evaluationResult.collaborationSignalsScore,
        cultural_practical_fit_score: evaluationResult.culturalPracticalFitScore,
        education_other_score: evaluationResult.educationOtherScore,
        final_score: evaluationResult.finalScore,
        score_band: evaluationResult.scoreBand,
        reasoning: evaluationResult.reasoning,
        potential_concern: evaluationResult.potentialConcern,
        rejection_reason: evaluationResult.rejectionReason,
        evaluated_by: user.id,
        ai_model_version: evaluationResult.aiModelVersion
      })
      .select()
      .single();
      
     if (evalError) {
        console.error('Evaluation Insert Error:', evalError);
        return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        candidateId: profileData.id,
        evaluationId: evalData.id 
    });

  } catch (error) {
    console.error('Upload Handler Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
