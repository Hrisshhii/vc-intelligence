export type ScoreResult = {
  score: number;
  reasons: string[];
};

export function scoreCompany(
  thesis: string,
  enrichment?: {
    keywords?: string[];
    signals?: string[];
  },
  industry?: string
): ScoreResult {
  if (!thesis) return { score: 0, reasons: [] };

  const thesisWords = thesis
    .toLowerCase()
    .split(",")
    .map((w) => w.trim());

  let score = 0;
  const reasons: string[] = [];

  // Industry match
  if (industry && thesisWords.some((t) => industry.toLowerCase().includes(t))) {
    score += 30;
    reasons.push(`Industry matches thesis (${industry})`);
  }

  // Keyword matches
  enrichment?.keywords?.forEach((k) => {
    if (thesisWords.some((t) => k.includes(t))) {
      score += 10;
      reasons.push(`Keyword match: ${k}`);
    }
  });

  // Signal bonus
  enrichment?.signals?.forEach((s) => {
    if (s.toLowerCase().includes("enterprise")) {
      score += 10;
      reasons.push("Enterprise signal detected");
    }
  });

  return {
    score: Math.min(score, 100),
    reasons,
  };
}