import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Alert } from '../models/Alert';
import { Report } from '../models/Report';
import { AuditLog } from '../models/AuditLog';
import { evaluateVillageRisk } from '../services/alertEngine';

// @desc    Get alerts with filters
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, riskLevel, village, page = '1', limit = '10' } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (riskLevel) query.riskLevel = riskLevel;
  if (village) query.village = { $regex: new RegExp(String(village), 'i') };

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Alert.countDocuments(query);
  const alerts = await Alert.find(query)
    .populate('resolvedBy', 'name email role')
    .sort({ generatedAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: alerts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
export const getAlertById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const alert = await Alert.findById(req.params.id).populate('resolvedBy', 'name email role');
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: alert
  });
};

// @desc    Update alert status (acknowledge or resolve)
// @route   PATCH /api/alerts/:id
// @access  Private (Health Worker, Admin)
export const updateAlertStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, notes } = req.body;

  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }

  if (status) alert.status = status;
  if (notes !== undefined) alert.notes = notes;

  if (status === 'resolved') {
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user!._id as any;
  }

  await alert.save();

  await AuditLog.create({
    userId: req.user!._id,
    action: 'ALERT_STATUS_UPDATED',
    resource: 'Alert',
    resourceId: alert._id,
    details: { newStatus: status, notes },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: `Alert marked as ${status}`,
    data: alert
  });
};

// @desc    Trigger early-warning risk evaluation on demand
// @route   POST /api/alerts/evaluate
// @access  Private (Health Worker, Admin)
export const triggerRiskEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { village } = req.body;

  if (village) {
    const alertResult = await evaluateVillageRisk(village);
    res.status(200).json({
      success: true,
      message: `Evaluation completed for village: ${village}`,
      data: alertResult
    });
    return;
  }

  // Evaluate across distinct villages with recent reports
  const distinctVillages = await Report.distinct('village');
  const results = [];
  for (const v of distinctVillages) {
    const alert = await evaluateVillageRisk(v);
    if (alert) results.push(alert);
  }

  res.status(200).json({
    success: true,
    message: `Surveillance scan completed across ${distinctVillages.length} villages`,
    data: results
  });
};
