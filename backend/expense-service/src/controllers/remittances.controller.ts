import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/remittances
 * Get remittances for a school
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, startDate, endDate, limit = 50, offset = 0 } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        error: 'schoolId is required',
      });
    }

    let query = `
      SELECT r.*, u.first_name, u.last_name 
      FROM remittances r 
      LEFT JOIN users u ON r.created_by = u.id 
      WHERE r.school_id = $1
    `;
    const params: any[] = [schoolId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND r.remittance_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND r.remittance_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY r.remittance_date DESC, r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM remittances WHERE school_id = $1';
    const countParams: any[] = [schoolId];
    let countParamNum = 2;

    if (startDate) {
      countQuery += ` AND remittance_date >= $${countParamNum}`;
      countParams.push(startDate);
      countParamNum++;
    }

    if (endDate) {
      countQuery += ` AND remittance_date <= $${countParamNum}`;
      countParams.push(endDate);
      countParamNum++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      count: result.rows.length,
      total: totalCount,
      remittances: result.rows,
    });
  } catch (error: any) {
    console.error('Get remittances error:', error);
    res.status(500).json({
      error: 'Failed to fetch remittances',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/remittances/:id
 * Get a specific remittance by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name 
       FROM remittances r 
       LEFT JOIN users u ON r.created_by = u.id 
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Remittance not found',
      });
    }

    res.json({
      remittance: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get remittance error:', error);
    res.status(500).json({
      error: 'Failed to fetch remittance',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/remittances
 * Create a new remittance
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, createdBy, amount, remittanceDate, bankDetails } = req.body;

    if (!schoolId || !amount || !remittanceDate) {
      return res.status(400).json({
        error: 'Missing required fields: schoolId, amount, remittanceDate',
      });
    }

    const result = await pool.query(
      `INSERT INTO remittances (school_id, created_by, amount, remittance_date, bank_details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [schoolId, createdBy, amount, remittanceDate, bankDetails]
    );

    res.status(201).json({
      message: 'Remittance created successfully',
      remittance: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create remittance error:', error);
    res.status(500).json({
      error: 'Failed to create remittance',
      details: error.message,
    });
  }
});

/**
 * PUT /api/v1/remittances/:id
 * Update a remittance
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, remittanceDate, bankDetails } = req.body;

    const result = await pool.query(
      `UPDATE remittances 
       SET amount = COALESCE($1, amount), 
           remittance_date = COALESCE($2, remittance_date),
           bank_details = COALESCE($3, bank_details)
       WHERE id = $4
       RETURNING *`,
      [amount, remittanceDate, bankDetails, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Remittance not found',
      });
    }

    res.json({
      message: 'Remittance updated successfully',
      remittance: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update remittance error:', error);
    res.status(500).json({
      error: 'Failed to update remittance',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/v1/remittances/:id
 * Delete a remittance
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM remittances WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Remittance not found',
      });
    }

    res.json({
      message: 'Remittance deleted successfully',
      remittance: result.rows[0],
    });
  } catch (error: any) {
    console.error('Delete remittance error:', error);
    res.status(500).json({
      error: 'Failed to delete remittance',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/remittances/reports/summary
 * Get remittance summary report
 */
router.get('/reports/summary', async (req: Request, res: Response) => {
  try {
    const { schoolId, startDate, endDate } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        error: 'schoolId is required',
      });
    }

    let query = `
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount
      FROM remittances
      WHERE school_id = $1
    `;
    const params: any[] = [schoolId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND remittance_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND remittance_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const result = await pool.query(query, params);

    res.json({
      summary: {
        total_remittances: parseInt(result.rows[0].total_count),
        total_amount: parseFloat(result.rows[0].total_amount || 0),
      },
    });
  } catch (error: any) {
    console.error('Get remittance summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch remittance summary',
      details: error.message,
    });
  }
});

export default router;
