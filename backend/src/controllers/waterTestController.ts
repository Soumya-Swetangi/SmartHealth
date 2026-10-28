import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { WaterTest } from '../models/WaterTest';
import { Report } from '../models/Report';
import { AuditLog } from '../models/AuditLog';
import { evaluateVillageRisk } from '../services/alertEngine';

// @desc    Record water quality test results
// @route   POST /api/water-tests
// @access  Private (Health Worker, Admin)
export const createWaterTest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { reportId, village, sourceType, parameters, result, notes, location } = req.body;

  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Derive coordinates if not explicitly passed
  let testLocation = location;
  if (!testLocation && reportId) {
    const matchedReport = await Report.findById(reportId);
    if (matchedReport && matchedReport.location) {
      testLocation = matchedReport.location;
    }
  }

  const waterTest = await WaterTest.create({
    reportId: reportId || undefined,
    village,
    sourceType,
    testedBy: req.user._id,
    testDate: new Date(),
    parameters: parameters || {},
    result,
    notes,
    location: testLocation || {
      type: 'Point',
      coordinates: [92.9376, 26.2006]
    }
  });

  // If linked to a report and unsafe, update report status to under_review or verified
  if (reportId) {
    await Report.findByIdAndUpdate(reportId, {
      status: result === 'unsafe' ? 'verified' : 'under_review',
      resolutionNotes: `Water test performed on ${new Date().toLocaleDateString()}: Result=${result.toUpperCase()}. ${notes || ''}`
    });
  }

  await AuditLog.create({
    userId: req.user._id,
    action: 'WATER_TEST_RECORDED',
    resource: 'WaterTest',
    resourceId: waterTest._id,
    details: { village, result, sourceType },
    ipAddress: req.ip
  });

  // Re-evaluate early warning risk in background
  try {
    await evaluateVillageRisk(village);
  } catch (err) {
    console.error('Error updating risk after water test:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Water test results recorded successfully',
    data: waterTest
  });
};

// @desc    Get water tests with filtering
// @route   GET /api/water-tests
// @access  Private
export const getWaterTests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { village, result, sourceType, page = '1', limit = '10' } = req.query;

  const query: any = {};
  if (village) query.village = { $regex: new RegExp(String(village), 'i') };
  if (result) query.result = result;
  if (sourceType) query.sourceType = sourceType;

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await WaterTest.countDocuments(query);
  const tests = await WaterTest.find(query)
    .populate('testedBy', 'name email village role')
    .populate('reportId', 'sourceType symptoms reportedAt status')
    .sort({ testDate: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: tests,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
};

// @desc    Get single water test details
// @route   GET /api/water-tests/:id
// @access  Private
export const getWaterTestById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const test = await WaterTest.findById(req.params.id)
    .populate('testedBy', 'name email village role')
    .populate('reportId');

  if (!test) {
    res.status(404).json({ success: false, message: 'Water test record not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: test
  });
};
