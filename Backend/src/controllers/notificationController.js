const db = require('../db');

/**
 * GET /api/notifications
 * Get notifications for user
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { unreadOnly = 'false' } = req.query;

    let query = `
      SELECT id, title, description, type, is_read, icon_name, icon_color, related_id, created_at
      FROM notifications
      WHERE patient_id = $1
    `;

    if (unreadOnly === 'true') {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, [userId]);

    // Separate into new (unread) and earlier (read)
    const newNotifications = [];
    const earlierNotifications = [];

    result.rows.forEach(notif => {
      const notification = {
        id: notif.id,
        title: notif.title,
        description: notif.description,
        time: formatTime(notif.created_at),
        type: notif.type,
        isRead: notif.is_read,
        iconName: notif.icon_name || 'notifications',
        iconColor: notif.icon_color || '#3B82F6',
        relatedId: notif.related_id,
        createdAt: notif.created_at
      };

      if (!notif.is_read) {
        newNotifications.push(notification);
      } else {
        earlierNotifications.push(notification);
      }
    });

    const unreadCount = newNotifications.length;

    res.json({
      notifications: {
        new: newNotifications,
        earlier: earlierNotifications
      },
      unreadCount
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * PATCH /api/notifications/:notificationId
 * Mark notification as read/unread
 */
async function updateNotification(req, res) {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        error: 'isRead must be a boolean' 
      });
    }

    const result = await db.query(`
      UPDATE notifications
      SET is_read = $1
      WHERE id = $2 AND patient_id = $3
      RETURNING id
    `, [isRead, notificationId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      message: `Notification marked as ${isRead ? 'read' : 'unread'}`
    });
  } catch (err) {
    console.error('Update notification error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays} days ago`;
  }
}

/**
 * Create a notification for a user
 * @param {string} userId - Patient ID
 * @param {object} notificationData - Notification details
 * @returns {Promise<object>} Created notification
 */
async function createNotification(userId, notificationData) {
  const {
    title,
    description,
    type = 'info',
    iconName = 'notifications',
    iconColor = '#3B82F6',
    relatedId = null
  } = notificationData;

  try {
    const result = await db.query(`
      INSERT INTO notifications (patient_id, title, description, type, icon_name, icon_color, related_id, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
      RETURNING id, title, description, type, icon_name, icon_color, related_id, created_at
    `, [userId, title, description, type, iconName, iconColor, relatedId]);

    const notification = result.rows[0];

    // Try to send push notification
    try {
      await sendPushNotification(userId, {
        title,
        body: description,
        data: {
          type,
          relatedId,
          notificationId: notification.id
        }
      });
    } catch (pushError) {
      console.error('Failed to send push notification:', pushError);
      // Don't fail the whole operation if push fails
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}

/**
 * Send push notification to user's device
 */
async function sendPushNotification(userId, notification) {
  try {
    // Get patient's push token from database
    const result = await db.query(
      'SELECT push_token FROM patients WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].push_token) {
      console.log('No push token found for patient:', userId);
      return;
    }

    const pushToken = result.rows[0].push_token;

    // Send using Expo Push Notification service
    const message = {
      to: pushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      priority: 'high',
      channelId: 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    
    if (responseData.data && responseData.data.status === 'error') {
      console.error('Push notification error:', responseData.data.message);
    } else {
      console.log('Push notification sent successfully to patient:', userId);
    }
  } catch (error) {
    console.error('Send push notification error:', error);
    throw error;
  }
}

/**
 * POST /api/notifications/test
 * Send a test notification (for testing purposes)
 */
async function sendTestNotification(req, res) {
  try {
    const userId = req.user.id;

    const notification = await createNotification(userId, {
      title: 'Test Notification from Backend',
      description: 'This is a test notification from the Healthy Smiles backend!',
      type: 'info',
      iconName: 'notifications',
      iconColor: '#34D399'
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      notification
    });
  } catch (err) {
    console.error('Send test notification error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification'
    });
  }
}

module.exports = { 
  getNotifications, 
  updateNotification, 
  createNotification,
  sendPushNotification,
  sendTestNotification
};
