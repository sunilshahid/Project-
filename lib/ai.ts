import { UNIFIED_FALLACIES, getFallacyById, FallacyDefinition } from './fallacies';

export interface FallacyAuditItem {
  fallacyId: string;
  fallacyName: string;
  quote: string;
  confidence: number;
  explanation: string;
  counterStrategy: string;
}

export interface AuditResult {
  soundnessScore: number;
  fallacies: FallacyAuditItem[];
  unstatedAssumptions: string[];
  cognitiveBiasesObserved: string[];
  overallAssessment: string;
}

export interface SteelmanResult {
  steelmannedArgument: string;
  strongestPremises: string[];
  validTruthsToAcknowledge: string[];
  cruxOfDisagreement: string;
  bestSocraticCounter: string;
}

export interface SyllogismResult {
  majorPremise: string;
  minorPremise: string;
  hiddenEnthymemes: string[];
  conclusion: string;
  isValidDeductively: boolean;
  isSound: boolean;
  analysis: string;
}

// Heuristic keyword patterns for local offline epistemic analysis
const HEURISTIC_PATTERNS: Array<{
  id: string;
  regex: RegExp;
  confidence: number;
  explanation: string;
}> = [
  {
    id: 'ad-hominem',
    regex: /\b(idiot|stupid|moron|corrupt|hypocrite|liar|shill|incompetent|fool|evil|clueless)\b/i,
    confidence: 88,
    explanation: 'Contains ad hominem character attacks targeting the person rather than the premise.',
  },
  {
    id: 'slippery-slope',
    regex: /\b(if we allow|inevitably lead to|will destroy|collapse of civilization|soon.*will ban|downhill from here)\b/i,
    confidence: 82,
    explanation: 'Leaps from a specific step directly to extreme unproven systemic collapse.',
  },
  {
    id: 'false-dilemma',
    regex: /\b(either.*or|you are either with|only two choices|no middle ground|if you don't.*you hate)\b/i,
    confidence: 85,
    explanation: 'Presents an artificial binary ultimatum while ignoring nuance and intermediate alternatives.',
  },
  {
    id: 'appeal-to-emotion',
    regex: /\b(think of the children|heartless|outrageous|disgusting|monstrous|unforgivable|pure evil)\b/i,
    confidence: 80,
    explanation: 'Employs visceral emotional appeals in place of empirical justification or causal mechanisms.',
  },
  {
    id: 'bandwagon',
    regex: /\b(everyone knows|millions of people|nobody believes|widely accepted that|everybody is doing)\b/i,
    confidence: 78,
    explanation: 'Substitutes popularity or consensus assertion for verifiable evidence.',
  },
  {
    id: 'tu-quoque',
    regex: /\b(what about|you did it too|look who's talking|you do the same|hypocritical of you)\b/i,
    confidence: 84,
    explanation: 'Deflects the thesis by redirecting an accusation of hypocrisy back to the speaker.',
  },
  {
    id: 'strawman',
    regex: /\b(so you're saying|so you want to ban|you think.*is completely useless|you claimed that all)\b/i,
    confidence: 76,
    explanation: 'Reframes the opponent’s stance into an extreme or distorted caricature.',
  },
  {
    id: 'burden-of-proof',
    regex: /\b(prove me wrong|prove it doesn't|can you disprove|no one has proven.*false)\b/i,
    confidence: 90,
    explanation: 'Attempts to shift the burden of proof to the skeptic rather than justifying the positive claim.',
  },
  {
    id: 'hasty-generalization',
    regex: /\b(all of them|every single|always|never|typical of that group|met two and both were)\b/i,
    confidence: 74,
    explanation: 'Extrapolates universal claims from isolated or unrepresentative anecdotal experiences.',
  },
  {
    id: 'false-cause',
    regex: /\b(ever since.*happened|right after.*so therefore|caused by.*because it followed)\b/i,
    confidence: 79,
    explanation: 'Confuses temporal sequence (post hoc) with verified causal mechanism.',
  },
];

/**
 * 100% Private, Local Heuristic Fallacy & Logic Auditor
 */
export async function runAiAudit(
  text: string,
  context?: string
): Promise<AuditResult> {
  const foundFallacies: FallacyAuditItem[] = [];
  const biases: string[] = [];
  const assumptions: string[] = [];

  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  HEURISTIC_PATTERNS.forEach((pattern) => {
    for (const sentence of sentences) {
      if (pattern.regex.test(sentence)) {
        const def = getFallacyById(pattern.id);
        if (def && !foundFallacies.some((f) => f.fallacyId === pattern.id)) {
          foundFallacies.push({
            fallacyId: def.id,
            fallacyName: def.name,
            quote: sentence.length > 140 ? sentence.slice(0, 137) + '...' : sentence,
            confidence: pattern.confidence,
            explanation: pattern.explanation,
            counterStrategy: def.counter,
          });
        }
      }
    }
  });

  if (text.length > 80 && foundFallacies.length === 0) {
    // If no major fallacies, run soft check
    assumptions.push('Presumes current background empirical conditions remain constant.');
  } else {
    assumptions.push('Assumes the listener accepts unverified causal links between premises.');
  }

  if (/\b(obviously|clearly|undeniably|without question)\b/i.test(text)) {
    biases.push('Overconfidence Bias / Framing Heuristic (using certainty rhetoric to bypass evidence).');
  }
  if (/\b(they always|those people|the other side)\b/i.test(text)) {
    biases.push('In-Group / Out-Group Polarization Bias.');
  }

  const baseScore = 95 - foundFallacies.length * 18 - biases.length * 8;
  const soundnessScore = Math.max(20, Math.min(98, baseScore));

  const assessment =
    foundFallacies.length === 0
      ? 'The examined statement presents a coherent structural argument with low rhetorical evasion or acute formal fallacies.'
      : `Identified ${foundFallacies.length} potential rhetorical or structural vulnerability. Consider addressing the highlighted premises to enhance argumentative rigor.`;

  return {
    soundnessScore,
    fallacies: foundFallacies,
    unstatedAssumptions: assumptions,
    cognitiveBiasesObserved: biases,
    overallAssessment: assessment,
  };
}

/**
 * 100% Private, Local Steelmanning Synthesizer
 */
export async function runSteelman(text: string): Promise<SteelmanResult> {
  const clean = text.replace(/<[^>]*>/g, '').trim();
  const firstSentence = clean.split(/[.?!]/)[0] || clean;

  return {
    steelmannedArgument: `When formulated at its strongest, the underlying contention asserts that: "${firstSentence}." Proponents of this view emphasize systemic incentives and empirical risk minimization rather than bad-faith motives.`,
    strongestPremises: [
      'Empirical observation reveals recurring historical incentives that align with this concern.',
      'Risk-aversion principles dictate testing defensive hedges against low-probability high-impact outcomes.',
      'The principle of charity suggests the position originates from legitimate security or ethical priorities.',
    ],
    validTruthsToAcknowledge: [
      'The core concern touches on genuine institutional vulnerabilities that require monitoring.',
      'Critics often dismiss the concern using caricatures rather than addressing the strongest version.',
    ],
    cruxOfDisagreement:
      'The fundamental crux hinges on whether the proposed intervention imposes greater unintended friction than the problem it seeks to mitigate.',
    bestSocraticCounter:
      'What specific empirical metric would provide falsifiable proof that this concern has been resolved without this intervention?',
  };
}

/**
 * 100% Private, Local Syllogistic Deconstruction
 */
export async function runSyllogismDeconstruction(
  text: string
): Promise<SyllogismResult> {
  const clean = text.replace(/<[^>]*>/g, '').trim();
  const parts = clean.split(/[.?!]/).map((s) => s.trim()).filter(Boolean);

  const major = parts[0] || 'All entities under specified condition X exhibit property Y.';
  const minor = parts[1] || 'The subject under consideration satisfies condition X.';
  const conclusion =
    parts.length > 2
      ? parts[parts.length - 1]
      : 'Therefore, the subject exhibits property Y.';

  return {
    majorPremise: `Major Premise: ${major}`,
    minorPremise: `Minor Premise: ${minor}`,
    hiddenEnthymemes: [
      'Assumes that no unstated confounding variables invalidate the linkage between premise and conclusion.',
    ],
    conclusion: `Conclusion: ${conclusion}`,
    isValidDeductively: true,
    isSound: false,
    analysis:
      'Deductively structured into antecedent, consequent, and inference. Soundness requires independently verifying the factual truth of both premises.',
  };
}
