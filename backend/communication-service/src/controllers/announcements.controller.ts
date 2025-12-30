import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/announcements
 * Get announcements for a school
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, limit = 20 } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        error: 'schoolId is required',
      });
    }

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name 
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.school_id = $1 AND a.is_published = true
       ORDER BY a.published_at DESC
       LIMIT $2`,
      [schoolId, Number(limit)]
    );

    res.json({
      count: result.rows.length,
      announcements: result.rows,
    });
  } catch (error: any) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      error: 'Failed to fetch announcements',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/announcements
 * Create a new announcement
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, createdBy, title, content, targetAudience = 'all', isPublished = false } = req.body;

    if (!schoolId || !title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: schoolId, title, content',
      });
    }

    const publishedAt = isPublished ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO announcements (school_id, created_by, title, content, target_audience, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [schoolId, createdBy, title, content, targetAudience, isPublished, publishedAt]
    );

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      error: 'Failed to create announcement',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/announcements/:id
 * Get a specific announcement
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name 
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Announcement not found',
      });
    }

    res.json({
      announcement: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      error: 'Failed to fetch announcement',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/v1/announcements/:id/publish
 * Publish an announcement
 */
router.patch('/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE announcements SET is_published = true, published_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Announcement not found',
      });
    }

    res.json({
      message: 'Announcement published successfully',
      announcement: result.rows[0],
    });
  } catch (error: any) {
    console.error('Publish announcement error:', error);
    res.status(500).json({
      error: 'Failed to publish announcement',
      details: error.message,
    });
  }
});

export default router;
