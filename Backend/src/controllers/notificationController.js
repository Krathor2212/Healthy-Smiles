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

module.exports = { getNotifications, updateNotification };
