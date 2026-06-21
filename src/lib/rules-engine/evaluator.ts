import { UserProfile, EligibilityResult, EligibilityStatus, AssessmentResult, ConditionStatus, Language, MultilingualText, MultilingualList } from './types';
import { PROGRAMS, getProgramById } from './programs';

function determineStatus(results: { status: ConditionStatus; weight: string }[]): { status: EligibilityStatus; confidence: number } {
  const required = results.filter(r => r.weight === 'required');
  const strong = results.filter(r => r.weight === 'strong_indicator');
  
  const requiredMet = required.filter(r => r.status === 'MET').length;
  const requiredUnmet = required.filter(r => r.status === 'UNMET').length;
  const requiredUnknown = required.filter(r => r.status === 'UNKNOWN').length;
  const strongMet = strong.filter(r => r.status === 'MET').length;
  
  if (requiredUnmet > 0) {
    return { status: 'LIKELY_NOT_ELIGIBLE', confidence: 0.8 + (requiredUnmet / required.length) * 0.2 };
  }
  
  if (requiredMet === required.length && required.length > 0) {
    const strongRatio = strong.length > 0 ? strongMet / strong.length : 1;
    return { status: 'LIKELY_ELIGIBLE', confidence: 0.7 + strongRatio * 0.3 };
  }
  
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

function getProvinceNote(programId: string, province?: string): MultilingualText | undefined {
  const program = getProgramById(programId);
  if (!program?.provinceVariations || !province) return undefined;
  
  const variation = program.provinceVariations.find(v => v.province === province);
  if (!variation) return undefined;
  
  return variation.description;
}

export function evaluateEligibility(profile: UserProfile): AssessmentResult {
  const results: EligibilityResult[] = [];
  const crossProgramAlerts: MultilingualList = {
    en: [], ur: [], sd: [], ps: [], pn: [], bl: []
  };
  
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
  
  for (const result of results) {
    if (result.program.dependsOn) {
      for (const depId of result.program.dependsOn) {
        const depResult = results.find(r => r.programId === depId);
        if (depResult) {
          if (depResult.status === 'LIKELY_ELIGIBLE' || depResult.status === 'MAY_BE_ELIGIBLE') {
            if (result.status !== 'LIKELY_NOT_ELIGIBLE') {
              const depProgram = getProgramById(depId);
              const names = depProgram?.name || { en: depId, ur: depId };
              const currentNames = result.program.name;

              crossProgramAlerts.en.push(
                `Because you may qualify for ${names.en}, you may also be eligible for ${currentNames.en}.`
              );
              crossProgramAlerts.ur.push(
                `چونکہ آپ ${names.ur} کے لیے اہل ہو سکتے ہیں، آپ ${currentNames.ur} کے لیے بھی اہل ہو سکتے ہیں۔`
              );
              crossProgramAlerts.sd!.push(
                `ڇاڪاڻ ته توهان ${names.sd || names.ur} لاءِ اهل ٿي سگهو ٿا، توهان ${currentNames.sd || currentNames.ur} لاءِ پڻ اهل ٿي سگهو ٿا.`
              );
              crossProgramAlerts.ps!.push(
                `ځکه چې تاسو ممکن د ${names.ps || names.ur} لپاره وړ یاست، تاسو د ${currentNames.ps || currentNames.ur} لپاره هم وړ کیدی شئ.`
              );
              crossProgramAlerts.pn!.push(
                `کیونجے تسی ${names.pn || names.ur} لئی اہل ہو سکدے او، تسی ${currentNames.pn || currentNames.ur} لئی وی اہل ہو سکدے او۔`
              );
              crossProgramAlerts.bl!.push(
                `پرچا شما ${names.bl || names.ur} واستہ لائق بوت کنائت، شما ${currentNames.bl || currentNames.ur} واستہ ہم لائق بوت کنائت۔`
              );
            }
          }
          if (depResult.unlocks) {
            depResult.unlocks.push(result.programId);
          }
        }
      }
    }
  }
  
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
      ur: 'رہنما صرف رہنمائی فراہم کرتا ہے — سرکاری اہلیت کا فیصلہ نہیں۔ حتمی اہلیت BISP کی NSER سروے اور PMT سکورنگ سے طے ہوتی ہے۔ ہمیشہ سرکاری ذرائع (8171 ایس ایم ایس یا بی آئی ایس پی دفتر) سے تصدیق کریں۔',
      sd: 'رهنما صرف رهنمائي فراهم ڪري ٿو — سرڪاري فيصلو ناهي. هميشه سرڪاري ذريعن (8171 ايس ايم ايس يا BISP آفيس) مان تصديق ڪريو.',
      ps: 'رهنما یوازې لارښود دی — رسمي وړتیا د BISP د NSER سروې او PMT نمرې له لارې ټاکل کیږي. تل له رسمي سرچینو څخه تصدیق کړئ.',
      pn: 'راہنما صرف رہنمائی دیندا اے۔ اصل اہلیت دا فیصلہ NSER سروے تے PMT سکور توں ہوندا اے۔ ہمیشہ سرکاری ذرائع توں تصدیق کرو۔',
      bl: 'رہنما صرف رہنمائی دنت — حتمی فیصلہ BISP ءِ NSER سروے ءَ چہ بیت۔ سرکاری ذرائع چہ تصدیق کن ات۔'
    }
  };
}

function generateExplanation(
  programId: string,
  status: EligibilityStatus,
  conditions: { criterion: { id: string; description: MultilingualText }; status: ConditionStatus }[],
  profile: UserProfile
): MultilingualText {
  const getLanguageExplanation = (lang: Language): string => {
    const met = conditions.filter(c => c.status === 'MET').map(c => c.criterion.description[lang] || c.criterion.description.en);
    const unmet = conditions.filter(c => c.status === 'UNMET').map(c => c.criterion.description[lang] || c.criterion.description.en);
    const unknown = conditions.filter(c => c.status === 'UNKNOWN').map(c => c.criterion.description[lang] || c.criterion.description.en);
    
    let text = '';
    const delimiter = lang === 'en' ? '; ' : '، ';
    
    switch (status) {
      case 'LIKELY_ELIGIBLE':
        if (lang === 'en') {
          text = `Based on the information provided, you appear to meet the key eligibility criteria. ${met.length > 0 ? `Conditions met: ${met.join(delimiter)}.` : ''}`;
        } else if (lang === 'ur') {
          text = `فراہم کردہ معلومات کی بنیاد پر، آپ اہلیت کے بنیادی معیار پر پورا اترتے نظر آتے ہیں۔ ${met.length > 0 ? `پورے کیے گئے شرائط: ${met.join(delimiter)}۔` : ''}`;
        } else if (lang === 'sd') {
          text = `فراهم ڪيل معلومات جي بنياد تي، توهان بنيادي معيارن تي پورا لهو ٿا. ${met.length > 0 ? `پورا ڪيل شرط: ${met.join(delimiter)}.` : ''}`;
        } else if (lang === 'ps') {
          text = `د ورکړل شوي معلوماتو پراساس، داسې ښکاري چې تاسو د وړتیا معیارونه پوره کوئ. ${met.length > 0 ? `پوره شوي شرطونه: ${met.join(delimiter)}.` : ''}`;
        } else if (lang === 'pn') {
          text = `فراہم کیتی معلومات دی بنیاد تے، تسی اہلیت دے بنیادی معیاراں تے پورے اتردے او۔ ${met.length > 0 ? `پوریاں کیتیاں شرائط: ${met.join(delimiter)}۔` : ''}`;
        } else {
          text = `فراہم داتگیں معلوماتاں چہ پد، شما اہلیت ءِ درستیگیں معیاراں پوره کن ات۔ ${met.length > 0 ? `پوره کتگیں شرائط: ${met.join(delimiter)}۔` : ''}`;
        }
        break;
      case 'MAY_BE_ELIGIBLE':
        if (lang === 'en') {
          text = `You may be eligible, but we need more information to be sure. ${met.length > 0 ? `Conditions met: ${met.join(delimiter)}.` : ''} ${unknown.length > 0 ? `Still need to verify: ${unknown.join(delimiter)}.` : ''}`;
        } else if (lang === 'ur') {
          text = `آپ اہل ہو سکتے ہیں، لیکن تصدیق کے لیے مزید معلومات درکار ہیں۔ ${met.length > 0 ? `پورے کیے گئے شرائط: ${met.join(delimiter)}۔` : ''} ${unknown.length > 0 ? `تصدیق طلب شرائط: ${unknown.join(delimiter)}۔` : ''}`;
        } else if (lang === 'sd') {
          text = `توهان اهل ٿي سگهو ٿا، پر تصديق لاءِ وڌيڪ معلومات گهربل آهي. ${met.length > 0 ? `پورا ڪيل شرط: ${met.join(delimiter)}.` : ''}`;
        } else if (lang === 'ps') {
          text = `تاسو ممکن وړ یاست، مګر د ډاډ ترلاسه کولو لپاره موږ نورو معلوماتو ته اړتیا لرو.`;
        } else if (lang === 'pn') {
          text = `تسی لائق ہو سکدے او، پر پکی گل لئی ہور معلومات چاہی دی اے۔`;
        } else {
          text = `شما لائق بوت کنائت، پر گیشیں معلومات پکار انت۔`;
        }
        break;
      case 'LIKELY_NOT_ELIGIBLE':
        if (lang === 'en') {
          text = `Based on the information provided, you may not meet the eligibility criteria. ${unmet.length > 0 ? `Conditions not met: ${unmet.join(delimiter)}.` : ''}`;
        } else if (lang === 'ur') {
          text = `فراہم کردہ معلومات کی بنیاد پر، آپ اہلیت کے معیار پر پورا نہیں اترتے۔ ${unmet.length > 0 ? `شرائط جو پوری نہیں ہوئیں: ${unmet.join(delimiter)}۔` : ''}`;
        } else if (lang === 'sd') {
          text = `توهان اهليت جي معيار تي پورا نٿا لهو. ${unmet.length > 0 ? `شرط جيڪي پورا نه ٿيا: ${unmet.join(delimiter)}.` : ''}`;
        } else if (lang === 'ps') {
          text = `د ورکړل شوي معلوماتو پراساس، تاسو د وړتیا معیارونه نه پوره کوئ.`;
        } else if (lang === 'pn') {
          text = `تسی اہلیت دے معیاراں تے پورے نہیں اتردے۔`;
        } else {
          text = `شما اہلیت ءِ معیاراں پوره نہ کن ات۔`;
        }
        break;
      case 'INSUFFICIENT_DATA':
        if (lang === 'en') {
          text = `We don't have enough information to assess eligibility. ${unknown.length > 0 ? `We need to know: ${unknown.join(delimiter)}.` : ''}`;
        } else if (lang === 'ur') {
          text = `اہلیت کا جائزہ لینے کے لیے کافی معلومات نہیں ہیں۔ ${unknown.length > 0 ? `ہمیں معلوم کرنا ہوگا: ${unknown.join(delimiter)}۔` : ''}`;
        } else {
          text = `اہلیت کا جائزہ لینے کے لیے کافی معلومات نہیں ہیں۔`;
        }
        break;
    }

    if (programId === 'sehat_sahulat' && profile.province) {
      const provinceNames: Record<string, string> = {
        punjab: 'Punjab', sindh: 'Sindh', kpk: 'KP', balochistan: 'Balochistan',
        islamabad: 'Islamabad', ajk: 'AJK', gilgit_baltistan: 'Gilgit-Baltistan'
      };
      if (profile.province === 'punjab') {
        if (lang === 'en') {
          text += ` ⚠️ Important: In ${provinceNames[profile.province]}, the Sehat Card currently works ONLY at private empaneled hospitals — not at government hospitals. Also, only IN-PATIENT treatment is covered (not OPD/routine checkups).`;
        } else {
          text += ` ⚠️ اہم: پنجاب میں صحت کارڈ فی الحال صرف نجی ہسپتالوں میں کام کرتا ہے — سرکاری ہسپتالوں میں نہیں۔ اور صرف داخل مریضوں کا علاج مفت ہے۔`;
        }
      } else {
        if (lang === 'en') {
          text += ` In ${provinceNames[profile.province]}, the Sehat Card covers treatment at both public and private empaneled hospitals. Note: only IN-PATIENT treatment is covered (not OPD/routine checkups).`;
        } else {
          text += ` اس صوبے میں صحت کارڈ کے تحت رجسٹرڈ سرکاری اور نجی دونوں ہسپتالوں میں داخل مریضوں کا علاج مفت ہے۔`;
        }
      }
    }
    return text;
  };

  return {
    en: getLanguageExplanation('en'),
    ur: getLanguageExplanation('ur'),
    sd: getLanguageExplanation('sd'),
    ps: getLanguageExplanation('ps'),
    pn: getLanguageExplanation('pn'),
    bl: getLanguageExplanation('bl'),
  };
}
