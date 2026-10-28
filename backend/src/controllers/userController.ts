import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, village, search, page = '1', limit = '10' } = req.query;

  const query: any = {};
  if (role) query.role = role;
  if (village) query.village = { $regex: new RegExp(String(village), 'i') };
  if (search) {
    query.$or = [
      { name: { $regex: String(search), $options: 'i' } },
      { email: { $regex: String(search), $options: 'i' } },
      { village: { $regex: String(search), $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
};

// @desc    Update user status or role (Admin only)
// @route   PATCH /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, isActive, village, phone } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (village) user.village = village;
  if (phone) user.phone = phone;

  await user.save();

  await AuditLog.create({
    userId: req.user!._id,
    action: 'USER_PROFILE_UPDATED_BY_ADMIN',
    resource: 'User',
    resourceId: user._id,
    details: { updatedFields: { role, isActive, village } },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      village: user.village,
      phone: user.phone,
      isActive: user.isActive
    }
  });
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount
    }
  });
};

// @desc    Mark notification as read
// @route   PATCH /api/users/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  if (req.params.id === 'all') {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
    return;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ success: false, message: 'Notification not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: notification
  });
};
