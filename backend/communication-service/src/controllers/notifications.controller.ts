import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/notifications
 * Get notifications for a user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, schoolId, limit = 50 } = req.query;

    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (schoolId) {
      query += ` AND school_id = $${paramCount}`;
      params.push(schoolId);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(Number(limit));

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      notifications: result.rows,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/notifications
 * Create a new notification
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, userId, type, title, message, priority = 'normal' } = req.body;

    if (!schoolId || !userId || !type || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields: schoolId, userId, type, title, message',
      });
    }

    const result = await pool.query(
      `INSERT INTO notifications (school_id, user_id, type, title, message, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [schoolId, userId, type, title, message, priority]
    );

    res.status(201).json({
      message: 'Notification created successfully',
      notification: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Failed to create notification',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Notification not found',
      });
    }

    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0],
    });
  } catch (error: any) {
    console.error('Mark read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/notifications/unread/count
 * Get unread notifications count
 */
router.get('/unread/count', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
      });
    }

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      unreadCount: parseInt(result.rows[0].count),
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      details: error.message,
    });
  }
});

export default router;
