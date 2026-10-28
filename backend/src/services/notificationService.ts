import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';
import { User } from '../models/User';

export const createNotification = async (
  userId: mongoose.Types.ObjectId | string,
  title: string,
  message: string,
  type: NotificationType = 'system',
  relatedId?: mongoose.Types.ObjectId | string
) => {
  try {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId: relatedId ? new mongoose.Types.ObjectId(relatedId) : undefined
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const notifyVillageHealthWorkersAndAdmins = async (
  village: string,
  title: string,
  message: string,
  type: NotificationType = 'alert',
  relatedId?: mongoose.Types.ObjectId | string
) => {
  try {
    // Find health workers in this village and all admins
    const recipients = await User.find({
      $or: [
        { role: 'admin' },
        { role: 'health_worker', village: { $regex: new RegExp(`^${village}$`, 'i') } }
      ],
      isActive: true
    }).select('_id');

    const notifications = recipients.map((user) => ({
      userId: user._id,
      title,
      message,
      type,
      relatedId: relatedId ? new mongoose.Types.ObjectId(relatedId) : undefined
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Failed to broadcast alert notification:', error);
  }
};
