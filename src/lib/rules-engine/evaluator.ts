import { UserProfile, EligibilityResult, EligibilityStatus, AssessmentResult, ConditionStatus } from './types';
import { PROGRAMS, getProgramById } from './programs';

function determineStatus(results: { status: ConditionStatus; weight: string }[]): { status: EligibilityStatus; confidence: number } {
  const required = results.filter(r => r.weight === 'required');
  const strong = results.filter(r => r.weight === 'strong_indicator');
  
  const requiredMet = required.filter(r => r.status === 'MET').length;
  const requiredUnmet = required.filter(r => r.status === 'UNMET').length;
  const requiredUnknown = required.filter(r => r.status === 'UNKNOWN').length;
  const strongMet = strong.filter(r => r.status === 'MET').length;
  
  // If any required condition is UNMET → likely not eligible
  if (requiredUnmet > 0) {
    return { status: 'LIKELY_NOT_ELIGIBLE', confidence: 0.8 + (requiredUnmet / required.length) * 0.2 };
  }
  
  // If all required conditions are MET
  if (requiredMet === required.length && required.length > 0) {
    const strongRatio = strong.length > 0 ? strongMet / strong.length : 1;
    return { status: 'LIKELY_ELIGIBLE', confidence: 0.7 + strongRatio * 0.3 };
  }
  
  // If we have unknown required conditions
  if (requiredUnknown > 0) {
    const knownMet = requiredMet + strongMet;
    const total = required.length + strong.length;
    if (knownMet > 0) {
      return { status: 'MAY_BE_ELIGIBLE', confidence: 0.4 + (knownMet / total) * 0.3 };
    }
    return { status: 'INSUFFICIENT_DATA', confidence: 0.2 };
  }
  
  return { status: 'MAY_BE_ELIGIBLE', confidence: 0.5 };
}

function getProvinceNote(programId: string, province?: string): { en: string; ur: string } | undefined {
  const program = getProgramById(programId);
  if (!program?.provinceVariations || !province) return undefined;
  
  const variation = program.provinceVariations.find(v => v.province === province);
  if (!variation) return undefined;
  
  return variation.description;
}

export function evaluateEligibility(profile: UserProfile): AssessmentResult {
  const results: EligibilityResult[] = [];
  const crossProgramAlerts: { en: string[]; ur: string[] } = { en: [], ur: [] };
  
  // First pass: evaluate all programs
  for (const program of PROGRAMS) {
    const conditionResults = program.eligibilityCriteria.map(criterion => ({
      criterion,
      status: criterion.evaluate(profile)
    }));
    
    const { status, confidence } = determineStatus(
      conditionResults.map(cr => ({ status: cr.status, weight: cr.criterion.weight }))
    );
    
    const result: EligibilityResult = {
      programId: program.id,
      program,
      status,
      confidence,
      conditionResults,
      explanation: generateExplanation(program.id, status, conditionResults, profile),
      provinceNote: getProvinceNote(program.id, profile.province),
      unlocks: [],
      unlockedBy: program.dependsOn || []
    };
    
    results.push(result);
  }
  
  // Second pass: resolve cross-program dependencies
  for (const result of results) {
    if (result.program.dependsOn) {
      for (const depId of result.program.dependsOn) {
        const depResult = results.find(r => r.programId === depId);
        if (depResult) {
          if (depResult.status === 'LIKELY_ELIGIBLE' || depResult.status === 'MAY_BE_ELIGIBLE') {
            // If parent program is likely/maybe, child might be unlocked
            if (result.status !== 'LIKELY_NOT_ELIGIBLE') {
              const depProgram = getProgramById(depId);
              crossProgramAlerts.en.push(
                `Because you may qualify for ${depProgram?.name.en || depId}, you may also be eligible for ${result.program.name.en}.`
              );
              crossProgramAlerts.ur.push(
                `چونکہ آپ ${depProgram?.name.ur || depId} کے لیے اہل ہو سکتے ہیں، آپ ${result.program.name.ur} کے لیے بھی اہل ہو سکتے ہیں۔`
              );
            }
          }
          // Add unlock relationships
          if (depResult.unlocks) {
            depResult.unlocks.push(result.programId);
          }
        }
      }
    }
  }
  
  // Sort: likely eligible first, then maybe, then unlikely
  const statusOrder: Record<EligibilityStatus, number> = {
    'LIKELY_ELIGIBLE': 0,
    'MAY_BE_ELIGIBLE': 1,
    'INSUFFICIENT_DATA': 2,
    'LIKELY_NOT_ELIGIBLE': 3
  };
  results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  
  return {
    profile,
    results,
    totalProgramsChecked: results.length,
    likelyEligibleCount: results.filter(r => r.status === 'LIKELY_ELIGIBLE').length,
    mayBeEligibleCount: results.filter(r => r.status === 'MAY_BE_ELIGIBLE').length,
    crossProgramAlerts,
    timestamp: new Date().toISOString(),
    disclaimer: {
      en: 'Raahnuma provides guidance only — not official eligibility determination. Final eligibility is determined by BISP through the NSER Dynamic Survey and PMT scoring. Always verify through official channels (8171 SMS, BISP office) before making decisions based on these results.',
      ur: 'رہنما صرف رہنمائی فراہم کرتا ہے — سرکاری اہلیت کا فیصلہ نہیں۔ حتمی اہلیت BISP کی NSER سروے اور PMT سکورنگ سے طے ہوتی ہے۔ ہمیشہ سرکاری ذرائع سے تصدیق کریں۔'
    }
  };
}

function generateExplanation(
  programId: string,
  status: EligibilityStatus,
  conditions: { criterion: { id: string; description: { en: string; ur: string } }; status: ConditionStatus }[],
  profile: UserProfile
): { en: string; ur: string } {
  const met = conditions.filter(c => c.status === 'MET').map(c => c.criterion.description.en);
  const unmet = conditions.filter(c => c.status === 'UNMET').map(c => c.criterion.description.en);
  const unknown = conditions.filter(c => c.status === 'UNKNOWN').map(c => c.criterion.description.en);
  
  let en = '';
  let ur = '';
  
  switch (status) {
    case 'LIKELY_ELIGIBLE':
      en = `Based on the information provided, you appear to meet the key eligibility criteria. ${met.length > 0 ? `Conditions met: ${met.join('; ')}.` : ''}`;
      ur = `فراہم کردہ معلومات کی بنیاد پر، آپ اہلیت کے بنیادی معیار پر پورا اترتے نظر آتے ہیں۔`;
      break;
    case 'MAY_BE_ELIGIBLE':
      en = `You may be eligible, but we need more information to be sure. ${met.length > 0 ? `Conditions met: ${met.join('; ')}.` : ''} ${unknown.length > 0 ? `Still need to verify: ${unknown.join('; ')}.` : ''}`;
      ur = `آپ اہل ہو سکتے ہیں، لیکن مزید معلومات درکار ہیں۔`;
      break;
    case 'LIKELY_NOT_ELIGIBLE':
      en = `Based on the information provided, you may not meet the eligibility criteria. ${unmet.length > 0 ? `Conditions not met: ${unmet.join('; ')}.` : ''}`;
      ur = `فراہم کردہ معلومات کی بنیاد پر، آپ اہلیت کے معیار پر پورا نہیں اترتے۔`;
      break;
    case 'INSUFFICIENT_DATA':
      en = `We don't have enough information to assess eligibility. ${unknown.length > 0 ? `We need to know: ${unknown.join('; ')}.` : ''}`;
      ur = `اہلیت کا جائزہ لینے کے لیے کافی معلومات نہیں ہیں۔`;
      break;
  }
  
  // Add province-specific notes for Sehat Card
  if (programId === 'sehat_sahulat' && profile.province) {
    const provinceNames: Record<string, string> = {
      punjab: 'Punjab', sindh: 'Sindh', kpk: 'KP', balochistan: 'Balochistan',
      islamabad: 'Islamabad', ajk: 'AJK', gilgit_baltistan: 'Gilgit-Baltistan'
    };
    if (profile.province === 'punjab') {
      en += ` ⚠️ Important: In ${provinceNames[profile.province]}, the Sehat Card currently works ONLY at private empaneled hospitals — not at government hospitals. Also, only IN-PATIENT treatment is covered (not OPD/routine checkups).`;
    } else {
      en += ` In ${provinceNames[profile.province]}, the Sehat Card covers treatment at both public and private empaneled hospitals. Note: only IN-PATIENT treatment is covered (not OPD/routine checkups).`;
    }
  }
  
  return { en, ur };
}

export { PROGRAMS };
