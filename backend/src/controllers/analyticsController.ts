import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Report } from '../models/Report';
import { Alert } from '../models/Alert';
import { WaterTest } from '../models/WaterTest';
import { User } from '../models/User';

// @desc    High-level dashboard overview statistics
// @route   GET /api/analytics/overview
// @access  Private
export const getDashboardOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    activeAlerts,
    criticalAlerts,
    totalWaterTests,
    unsafeWaterTests,
    totalUsers
  ] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments({ status: 'verified' }),
    Report.countDocuments({ status: 'resolved' }),
    Alert.countDocuments({ status: 'active' }),
    Alert.countDocuments({ status: 'active', riskLevel: 'critical' }),
    WaterTest.countDocuments(),
    WaterTest.countDocuments({ result: 'unsafe' }),
    User.countDocuments({ isActive: true })
  ]);

  // Distinct villages with active alerts
  const villagesAtRiskCount = (await Alert.distinct('village', { status: 'active' })).length;

  res.status(200).json({
    success: true,
    data: {
      reports: {
        total: totalReports,
        pending: pendingReports,
        verified: verifiedReports,
        resolved: resolvedReports,
        resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0
      },
      alerts: {
        active: activeAlerts,
        critical: criticalAlerts,
        villagesAtRisk: villagesAtRiskCount
      },
      waterTests: {
        total: totalWaterTests,
        unsafe: unsafeWaterTests,
        contaminationRate: totalWaterTests > 0 ? Math.round((unsafeWaterTests / totalWaterTests) * 100) : 0
      },
      users: {
        totalActive: totalUsers
      }
    }
  });
};

// @desc    Trend of reports over the last 14 days
// @route   GET /api/analytics/trends
// @access  Private
export const getReportsTrend = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const days = parseInt(String(req.query.days || '14'), 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const reports = await Report.find({ reportedAt: { $gte: cutoff } }).select('reportedAt status symptoms');

  // Group by date YYYY-MM-DD
  const dateMap: Record<string, { date: string; total: number; diarrhea: number; fever: number; vomiting: number }> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = { date: dateStr, total: 0, diarrhea: 0, fever: 0, vomiting: 0 };
  }

  reports.forEach((r) => {
    const dStr = new Date(r.reportedAt).toISOString().split('T')[0];
    if (dateMap[dStr]) {
      dateMap[dStr].total += 1;
      if (r.symptoms.includes('diarrhea')) dateMap[dStr].diarrhea += 1;
      if (r.symptoms.includes('fever')) dateMap[dStr].fever += 1;
      if (r.symptoms.includes('vomiting')) dateMap[dStr].vomiting += 1;
    }
  });

  res.status(200).json({
    success: true,
    data: Object.values(dateMap)
  });
};

// @desc    Symptom distribution breakdown
// @route   GET /api/analytics/symptoms
// @access  Private
export const getSymptomDistribution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reports = await Report.find().select('symptoms');

  const distribution: Record<string, number> = {
    diarrhea: 0,
    vomiting: 0,
    fever: 0,
    abdominal_pain: 0,
    dehydration: 0,
    nausea: 0,
    fatigue: 0
  };

  reports.forEach((r) => {
    r.symptoms.forEach((s) => {
      const key = s.toLowerCase().trim();
      distribution[key] = (distribution[key] || 0) + 1;
    });
  });

  const formatted = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: count
    }));

  res.status(200).json({
    success: true,
    data: formatted
  });
};

// @desc    Comparison metrics by village
// @route   GET /api/analytics/villages
// @access  Private
export const getVillageComparison = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [reports, alerts, waterTests] = await Promise.all([
    Report.find().select('village status symptoms'),
    Alert.find({ status: 'active' }).select('village riskLevel'),
    WaterTest.find().select('village result')
  ]);

  const villageMap: Record<
    string,
    { village: string; totalReports: number; activeAlerts: number; unsafeWater: number; highestRisk: string }
  > = {};

  reports.forEach((r) => {
    if (!villageMap[r.village]) {
      villageMap[r.village] = { village: r.village, totalReports: 0, activeAlerts: 0, unsafeWater: 0, highestRisk: 'low' };
    }
    villageMap[r.village].totalReports += 1;
  });

  waterTests.forEach((w) => {
    if (!villageMap[w.village]) {
      villageMap[w.village] = { village: w.village, totalReports: 0, activeAlerts: 0, unsafeWater: 0, highestRisk: 'low' };
    }
    if (w.result === 'unsafe') {
      villageMap[w.village].unsafeWater += 1;
    }
  });

  const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  alerts.forEach((a) => {
    if (!villageMap[a.village]) {
      villageMap[a.village] = { village: a.village, totalReports: 0, activeAlerts: 0, unsafeWater: 0, highestRisk: a.riskLevel };
    }
    villageMap[a.village].activeAlerts += 1;
    const currentWeight = riskOrder[villageMap[a.village].highestRisk as keyof typeof riskOrder] || 0;
    const newWeight = riskOrder[a.riskLevel as keyof typeof riskOrder] || 0;
    if (newWeight > currentWeight) {
      villageMap[a.village].highestRisk = a.riskLevel;
    }
  });

  res.status(200).json({
    success: true,
    data: Object.values(villageMap).sort((a, b) => b.totalReports - a.totalReports)
  });
};

// @desc    Get map spatial points for GIS surveillance
// @route   GET /api/analytics/map-data
// @access  Private
export const getMapData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [reports, waterTests, activeAlerts] = await Promise.all([
    Report.find().select('village sourceType symptoms status location reportedAt description').limit(150),
    WaterTest.find().select('village sourceType result parameters location testDate notes').limit(100),
    Alert.find({ status: 'active' }).select('village riskLevel reason reportCount')
  ]);

  const villageRiskMap: Record<string, string> = {};
  activeAlerts.forEach((a) => {
    villageRiskMap[a.village.toLowerCase()] = a.riskLevel;
  });

  const reportMarkers = reports.map((r) => ({
    id: r._id,
    type: 'report',
    village: r.village,
    sourceType: r.sourceType,
    symptoms: r.symptoms,
    status: r.status,
    description: r.description,
    riskLevel: villageRiskMap[r.village.toLowerCase()] || 'low',
    coordinates: r.location && r.location.coordinates ? r.location.coordinates : [92.9376, 26.2006],
    timestamp: r.reportedAt
  }));

  const testMarkers = waterTests.map((t) => ({
    id: t._id,
    type: 'waterTest',
    village: t.village,
    sourceType: t.sourceType,
    result: t.result,
    parameters: t.parameters,
    notes: t.notes,
    riskLevel: t.result === 'unsafe' ? 'critical' : t.result === 'borderline' ? 'medium' : 'low',
    coordinates: t.location && t.location.coordinates ? t.location.coordinates : [92.9376, 26.2006],
    timestamp: t.testDate
  }));

  res.status(200).json({
    success: true,
    data: {
      reports: reportMarkers,
      waterTests: testMarkers,
      alerts: activeAlerts
    }
  });
};
