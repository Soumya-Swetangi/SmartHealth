import { Report } from '../models/Report';
import { Alert, AlertRiskLevel } from '../models/Alert';
import { WaterTest } from '../models/WaterTest';
import { notifyVillageHealthWorkersAndAdmins } from './notificationService';

export interface AlertThresholdConfig {
  windowDays: number;
  lowThreshold: number;
  mediumThreshold: number;
  highThreshold: number;
  criticalDiarrheaCount: number;
}

export const DEFAULT_ALERT_CONFIG: AlertThresholdConfig = {
  windowDays: 7,
  lowThreshold: 3,
  mediumThreshold: 5,
  highThreshold: 8,
  criticalDiarrheaCount: 5
};

/**
 * Early Warning Engine
 * Evaluates reported symptoms and water quality signals in a given village.
 * Always marks reason with "Potential Risk – Based on Unverified Citizen Reports".
 * Never claims medical diagnosis or confirmed outbreak.
 */
export const evaluateVillageRisk = async (
  village: string,
  config: AlertThresholdConfig = DEFAULT_ALERT_CONFIG
) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.windowDays);

    // Fetch reports in the time window
    const recentReports = await Report.find({
      village: { $regex: new RegExp(`^${village}$`, 'i') },
      reportedAt: { $gte: cutoffDate }
    });

    const reportCount = recentReports.length;

    // If report count is less than minimum threshold, return
    if (reportCount < config.lowThreshold) {
      return null;
    }

    // Aggregate symptoms
    const symptomCounts: Record<string, number> = {};
    recentReports.forEach((r) => {
      r.symptoms.forEach((s) => {
        const lower = s.toLowerCase().trim();
        symptomCounts[lower] = (symptomCounts[lower] || 0) + 1;
      });
    });

    const diarrheaCount = symptomCounts['diarrhea'] || 0;
    const vomitingCount = symptomCounts['vomiting'] || 0;
    const feverCount = symptomCounts['fever'] || 0;

    // Check for recent unsafe water test in this village (last 14 days)
    const waterTestCutoff = new Date();
    waterTestCutoff.setDate(waterTestCutoff.getDate() - 14);

    const unsafeWaterTest = await WaterTest.findOne({
      village: { $regex: new RegExp(`^${village}$`, 'i') },
      result: 'unsafe',
      testDate: { $gte: waterTestCutoff }
    });

    // Determine risk level
    let riskLevel: AlertRiskLevel = 'low';
    let triggerDetails = `${reportCount} citizen reports logged in the past ${config.windowDays} days.`;

    if (unsafeWaterTest && (reportCount >= 3 || diarrheaCount >= 2)) {
      riskLevel = 'critical';
      triggerDetails = `Unsafe water test detected combined with ${reportCount} symptom reports (including ${diarrheaCount} diarrhea cases) within ${config.windowDays} days.`;
    } else if (diarrheaCount >= config.criticalDiarrheaCount || reportCount >= config.highThreshold) {
      riskLevel = 'high';
      triggerDetails = `High clustering: ${reportCount} reports with elevated gastrointestinal complaints (${diarrheaCount} diarrhea, ${vomitingCount} vomiting) within ${config.windowDays} days.`;
    } else if (reportCount >= config.mediumThreshold || diarrheaCount >= 3) {
      riskLevel = 'medium';
      triggerDetails = `Moderate surge: ${reportCount} reports with ${diarrheaCount} diarrhea and ${feverCount} fever complaints within ${config.windowDays} days.`;
    } else {
      riskLevel = 'low';
      triggerDetails = `Elevated community reports (${reportCount} reports) requiring field observation.`;
    }

    const standardReason = `Potential Risk – Based on Unverified Citizen Reports: ${triggerDetails}`;
    const symptomsInvolved = Object.keys(symptomCounts).filter((s) => symptomCounts[s] > 0);

    // Look for existing active alert for this village
    let existingAlert = await Alert.findOne({
      village: { $regex: new RegExp(`^${village}$`, 'i') },
      status: { $in: ['active', 'acknowledged'] }
    });

    if (existingAlert) {
      // Update existing alert with latest counts & severity
      existingAlert.reportCount = reportCount;
      existingAlert.symptomsInvolved = symptomsInvolved;
      existingAlert.riskLevel = riskLevel;
      existingAlert.reason = standardReason;
      existingAlert.generatedAt = new Date();
      await existingAlert.save();

      await notifyVillageHealthWorkersAndAdmins(
        village,
        `Risk Alert Updated (${riskLevel.toUpperCase()}) - ${village}`,
        standardReason,
        'alert',
        existingAlert._id as any
      );

      return existingAlert;
    } else {
      // Create new Alert document
      const newAlert = await Alert.create({
        village,
        riskLevel,
        reason: standardReason,
        reportCount,
        symptomsInvolved,
        status: 'active',
        generatedAt: new Date()
      });

      await notifyVillageHealthWorkersAndAdmins(
        village,
        `New Early Warning Alert (${riskLevel.toUpperCase()}) - ${village}`,
        standardReason,
        'alert',
        newAlert._id as any
      );

      return newAlert;
    }
  } catch (error) {
    console.error(`[EarlyWarningEngine] Error evaluating risk for village ${village}:`, error);
    return null;
  }
};
