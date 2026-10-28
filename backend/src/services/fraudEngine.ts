/**
 * Fraud Detection Engine
 *
 * Analyses incoming health reports for suspicious patterns.
 * IMPORTANT RULES:
 *  - A flagged report is NEVER automatically rejected.
 *  - Fraud flags only add a review requirement; human health workers decide.
 *  - The engine returns a score and flags array — it does NOT modify report status.
 *
 * Score interpretation:
 *  0-29   → Low suspicion (auto-approved for workflow)
 *  30-59  → Moderate (queued for soft review)
 *  60-84  → High (queued for mandatory review before field action)
 *  85-100 → Critical (immediate health-worker review required)
 */

import { Report, IReport, FraudFlag } from '../models/Report';

export interface FraudAnalysisResult {
  fraudScore: number;
  fraudFlags: FraudFlag[];
  requiresReview: boolean;
}

interface NewReportData {
  userId: string;
  village: string;
  sourceType: string;
  symptoms: string[];
  description?: string;
  location: { coordinates: [number, number] };
}

/**
 * Analyse a new report for fraud indicators.
 * Call this AFTER the report is saved to DB so we can query history.
 */
export async function analyseReport(
  newReport: IReport,
  userId: string
): Promise<FraudAnalysisResult> {
  const flags: FraudFlag[] = [];
  let totalScore = 0;

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ── Rule 1: Duplicate submission — same user, same village, same source within 24h ──
  const recentDuplicate = await Report.countDocuments({
    userId,
    village: newReport.village,
    sourceType: newReport.sourceType,
    reportedAt: { $gte: last24h },
    _id: { $ne: newReport._id }
  });

  if (recentDuplicate >= 1) {
    const score = Math.min(35 + recentDuplicate * 10, 50);
    flags.push({
      type: 'DUPLICATE_SUBMISSION',
      message: `User submitted ${recentDuplicate + 1} report(s) for the same source in ${newReport.village} within 24 hours.`,
      score
    });
    totalScore += score;
  }

  // ── Rule 2: High frequency from single user — >3 reports in 7 days ──
  const userReports7d = await Report.countDocuments({
    userId,
    reportedAt: { $gte: last7d },
    _id: { $ne: newReport._id }
  });

  if (userReports7d >= 3) {
    const score = Math.min(15 + (userReports7d - 3) * 8, 40);
    flags.push({
      type: 'HIGH_FREQUENCY_USER',
      message: `User has submitted ${userReports7d + 1} reports in the last 7 days.`,
      score
    });
    totalScore += score;
  }

  // ── Rule 3: Symptom explosion — >8 distinct symptoms (unusually broad) ──
  if (newReport.symptoms.length > 8) {
    const score = 25;
    flags.push({
      type: 'SYMPTOM_OVERLOAD',
      message: `Report lists ${newReport.symptoms.length} distinct symptoms, which is unusually broad.`,
      score
    });
    totalScore += score;
  }

  // ── Rule 4: Implausible coordinates — outside Northeast India bounding box ──
  const [lon, lat] = newReport.location.coordinates;
  const NE_BOUNDS = { minLat: 21.0, maxLat: 29.5, minLon: 88.0, maxLon: 97.5 };
  if (lat < NE_BOUNDS.minLat || lat > NE_BOUNDS.maxLat || lon < NE_BOUNDS.minLon || lon > NE_BOUNDS.maxLon) {
    const score = 40;
    flags.push({
      type: 'IMPLAUSIBLE_LOCATION',
      message: `Reported coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)}) are outside Northeast India.`,
      score
    });
    totalScore += score;
  }

  // ── Rule 5: Suspiciously short description (if provided) ──
  if (newReport.description && newReport.description.trim().length < 10) {
    const score = 10;
    flags.push({
      type: 'MINIMAL_DESCRIPTION',
      message: 'Report description is unusually short (fewer than 10 characters).',
      score
    });
    totalScore += score;
  }

  // ── Rule 6: No symptoms listed ──
  if (!newReport.symptoms || newReport.symptoms.length === 0) {
    const score = 15;
    flags.push({
      type: 'NO_SYMPTOMS',
      message: 'Report has no symptoms listed.',
      score
    });
    totalScore += score;
  }

  // Cap at 100
  const fraudScore = Math.min(Math.round(totalScore), 100);
  const requiresReview = fraudScore >= 30;

  return { fraudScore, fraudFlags: flags, requiresReview };
}

/**
 * Get a human-readable risk label from a fraud score.
 */
export function getFraudRiskLabel(score: number): string {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 85) return 'High';
  return 'Critical';
}
