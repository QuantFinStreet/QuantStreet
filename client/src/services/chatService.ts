import type { ChatRequest, ChatResponse, QueryType } from '@fintech/shared';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Canned Responses ─────────────────────────────────────────────────────────
const RESPONSES: Record<QueryType, string[]> = {
  loan: [
    "Based on your current CIBIL score of 763 and a debt-to-income ratio of 28%, you're in a strong position for most loan products. For a home loan, lenders like HDFC and SBI typically offer rates between 8.35%–9.1% to borrowers with your profile. I'd recommend comparing at least 3 lenders before committing — even a 0.25% difference on ₹50L saves ₹1.8L over 20 years.",
    "Your existing EMI burden of ₹42,300/month on ₹1.5L income puts you at a comfortable 28% DTI ratio. Adding a personal loan would push this to ~35-40% — still within safe limits but leaving less buffer. Consider whether the loan purpose justifies the reduced financial flexibility.",
    "Looking at your assets, you have ₹4.8L in liquid savings. For any loan under ₹10L, you might want to evaluate if liquidating some low-performing FDs (currently at 7.4% XIRR) makes more sense than taking debt at 9-12% interest.",
  ],
  investment: [
    "Your SIP portfolio shows a weighted XIRR of approximately 16.8% — outperforming the Nifty 50's 12-month return of 24.8% on an absolute basis but strong on risk-adjusted returns given your 35% debt allocation. Your mid-cap exposure via ICICI Pru is delivering exceptional returns at 22.7% XIRR — consider increasing allocation here.",
    "Your portfolio is well-diversified across 6 funds but I notice heavy concentration in HDFC Flexi Cap (43% of SIP corpus). While it's a quality fund, consider spreading across 2-3 more funds. The SBI Nifty 50 Index Fund is your star performer in terms of cost-efficiency — expense ratio of 0.1% vs 1.2% on active funds.",
    "Based on your age (32) and risk profile, your 80% equity / 20% debt SIP split is appropriate. As you approach 40, gradually shift 5-10% towards debt funds annually. Your PPF of ₹4.2L is excellent for tax-free debt returns at 7.1% — keep maxing the annual ₹1.5L contribution.",
  ],
  quick_advice: [
    "Quick take: Your financial health score is **B+**. Strengths — rising CIBIL (763), strong SIP discipline, positive net worth trajectory. Areas to improve — home loan is large relative to assets, emergency fund could be 6 months of expenses (you have ~3.5 months currently). Priority: don't take on new debt until the car loan is cleared in 20 months.",
    "Your biggest quick win: redirect the ₹9,800 car loan EMI into your SIP once it closes in 20 months. At 16% XIRR that's an additional ₹35L in 10 years from just that one move.",
    "Consider an annual insurance review. With ₹2.8L+ in liabilities and dependents, ensure your term insurance cover is at least ₹1.5-2Cr. A ₹1.5Cr cover costs under ₹1,500/month at age 32.",
  ],
  general: [
    "Your overall financial picture is positive. Net worth crossed positive territory in July 2024 — a significant milestone. The combination of disciplined SIP investing (₹29K/month) and a rising CIBIL score suggests you're on a strong trajectory. Focus now on building your emergency fund to 6 months of expenses.",
    "Looking at your complete profile: you're earning ₹18 LPA, saving ~25% in SIPs, maintaining a CIBIL of 763, and have started building real wealth through assets that now exceed liabilities. The next phase is wealth acceleration — consider stepping up your SIP contributions by 10% annually (step-up SIP).",
    "Inflation context: with Indian CPI averaging 5-6%, your fixed deposit at 7.4% XIRR is barely keeping pace. Ensure FD is only for emergency/liquidity, not long-term wealth building. Your equity SIPs are doing the heavy lifting at 16-22% XIRR.",
  ],
  complex_analysis: [
    "Detailed portfolio analysis: Your ₹9.3L SIP corpus has generated ₹2.17L in gains (23.3% absolute). However, opportunity cost matters — if this were in Nifty 50 index funds exclusively, you'd have ~₹2.4L gains. The active fund premium isn't justified by returns alone, though diversification adds value. Recommendation: shift 20% of active fund SIPs to index funds over the next 6 months to reduce expense ratio drag.",
    "Tax efficiency analysis: Your mutual fund gains of ₹2.17L — if redeemed — attract LTCG at 12.5% above ₹1.25L. Effective tax liability ≈ ₹11,500. Your PPF returns are fully tax-free. Strategy: harvest equity gains up to ₹1.25L annually (tax-free LTCG threshold) and reinvest to reset cost basis — saves ₹15-20K/year in future taxes.",
    "Financial independence projection: At your current save/invest rate and 16% portfolio XIRR, you could accumulate ₹5Cr in corpus by age 47 (15 years). With the 4% safe withdrawal rule, that supports ₹20L/year in passive income — replacing your current salary. To accelerate by 3 years, increase monthly SIP by ₹15K now. The compounding math is powerful at your age.",
  ],
};

// ─── Stub Service ─────────────────────────────────────────────────────────────
export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  // Simulate network + AI processing latency
  await delay(randomBetween(900, 1800));

  const pool = RESPONSES[req.queryType] ?? RESPONSES.general;
  const message = pool[Math.floor(Math.random() * pool.length)];

  return {
    message,
    queryType: req.queryType,
    confidence: 0.85 + Math.random() * 0.12,
    relatedData: {
      profileId: req.context?.id,
      timestamp: new Date().toISOString(),
    },
  };
}

// ─── Query Type Detector ──────────────────────────────────────────────────────
export function detectQueryType(message: string): QueryType {
  const lower = message.toLowerCase();
  if (/loan|emi|borrow|credit|mortgage|home loan|car loan/.test(lower)) return 'loan';
  if (/invest|sip|portfolio|fund|mutual|stock|nifty|return|xirr/.test(lower)) return 'investment';
  if (/analys|breakdown|deep dive|detail|compare|project/.test(lower)) return 'complex_analysis';
  if (/quick|tip|advice|suggest|should i/.test(lower)) return 'quick_advice';
  return 'general';
}
