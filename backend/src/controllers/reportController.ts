import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Report } from '../models/Report';
import { AuditLog } from '../models/AuditLog';
import { evaluateVillageRisk } from '../services/alertEngine';
import { createNotification } from '../services/notificationService';

// @desc    Create a new community health/water report
// @route   POST /api/reports
// @access  Private (Citizen, Health Worker, Admin)
export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { village, sourceType, symptoms, description, location } = req.body;

  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Location fallback (default Northeast India coordinates if not provided)
  let coordinates: [number, number] = [92.9376, 26.2006];
  if (location && location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    coordinates = [Number(location.coordinates[0]), Number(location.coordinates[1])];
  }

  const report = await Report.create({
    userId: req.user._id,
    village: village || req.user.village,
    sourceType,
    symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
    description,
    reportedAt: new Date(),
    status: 'pending',
    location: {
      type: 'Point',
      coordinates
    }
  });

  // Log in AuditLog
  await AuditLog.create({
    userId: req.user._id,
    action: 'REPORT_SUBMITTED',
    resource: 'Report',
    resourceId: report._id,
    details: { village: report.village, sourceType: report.sourceType, symptomsCount: report.symptoms.length },
    ipAddress: req.ip
  });

  // Notify citizen that their report was received
  await createNotification(
    req.user._id,
    'Report Submitted Successfully',
    `Your report for ${report.village} (${report.sourceType}) has been logged and assigned for surveillance review.`,
    'status_update',
    report._id as any
  );

  // Trigger early warning engine evaluation in background
  try {
    await evaluateVillageRisk(report.village);
  } catch (err) {
    console.error('Error in early warning evaluation:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Local health monitoring teams have been alerted.',
    data: report
  });
};

// @desc    Get reports with filters, search and pagination
// @route   GET /api/reports
// @access  Private (Health Worker, Admin)
export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    village,
    status,
    sourceType,
    symptom,
    search,
    page = '1',
    limit = '10',
    sortBy = 'reportedAt',
    sortOrder = 'desc'
  } = req.query;

  const query: any = {};

  if (village) {
    query.village = { $regex: new RegExp(String(village), 'i') };
  }
  if (status) {
    query.status = status;
  }
  if (sourceType) {
    query.sourceType = sourceType;
  }
  if (symptom) {
    query.symptoms = { $in: [String(symptom)] };
  }
  if (search) {
    query.$or = [
      { village: { $regex: String(search), $options: 'i' } },
      { description: { $regex: String(search), $options: 'i' } },
      { sourceType: { $regex: String(search), $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const totalReports = await Report.countDocuments(query);
  const reports = await Report.find(query)
    .populate('userId', 'name email village phone')
    .populate('assignedTo', 'name email')
    .sort({ [String(sortBy)]: sortDirection })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: reports,
    pagination: {
      total: totalReports,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalReports / limitNum)
    }
  });
};

// @desc    Get current user's submitted reports
// @route   GET /api/reports/my
// @access  Private
export const getMyReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { page = '1', limit = '10' } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const totalReports = await Report.countDocuments({ userId: req.user._id });
  const reports = await Report.find({ userId: req.user._id })
    .sort({ reportedAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: reports,
    pagination: {
      total: totalReports,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalReports / limitNum)
    }
  });
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const report = await Report.findById(req.params.id)
    .populate('userId', 'name email village phone')
    .populate('assignedTo', 'name email');

  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: report
  });
};

// @desc    Update report status and assignment
// @route   PATCH /api/reports/:id/status
// @access  Private (Health Worker, Admin)
export const updateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, assignedTo, resolutionNotes } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  if (status) report.status = status;
  if (assignedTo) report.assignedTo = assignedTo;
  if (resolutionNotes !== undefined) report.resolutionNotes = resolutionNotes;

  await report.save();

  // Audit log
  await AuditLog.create({
    userId: req.user!._id,
    action: 'REPORT_STATUS_UPDATED',
    resource: 'Report',
    resourceId: report._id,
    details: { newStatus: status, resolutionNotes },
    ipAddress: req.ip
  });

  // Notify the submitting citizen
  await createNotification(
    report.userId,
    `Report Status Updated: ${status.replace('_', ' ').toUpperCase()}`,
    `Your water health report for ${report.village} is now marked as ${status}. ${resolutionNotes ? `Notes: ${resolutionNotes}` : ''}`,
    'status_update',
    report._id as any
  );

  res.status(200).json({
    success: true,
    message: 'Report status updated successfully',
    data: report
  });
};
