import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/invoices
 * Get invoices with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, studentId, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT i.*, s.first_name as student_first_name, s.last_name as student_last_name,
             u.email as parent_email
      FROM invoices i 
      LEFT JOIN students s ON i.student_id = s.id 
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (schoolId) {
      query += ` AND i.school_id = $${paramCount}`;
      params.push(schoolId);
      paramCount++;
    }

    if (studentId) {
      query += ` AND i.student_id = $${paramCount}`;
      params.push(studentId);
      paramCount++;
    }

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM invoices WHERE 1=1';
    const countParams: any[] = [];
    let countParamNum = 1;

    if (schoolId) {
      countQuery += ` AND school_id = $${countParamNum}`;
      countParams.push(schoolId);
      countParamNum++;
    }

    if (studentId) {
      countQuery += ` AND student_id = $${countParamNum}`;
      countParams.push(studentId);
      countParamNum++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamNum}`;
      countParams.push(status);
      countParamNum++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      count: result.rows.length,
      total: totalCount,
      invoices: result.rows,
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/invoices/:id
 * Get a specific invoice by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, s.first_name as student_first_name, s.last_name as student_last_name,
              u.email as parent_email, u.phone as parent_phone
       FROM invoices i 
       LEFT JOIN students s ON i.student_id = s.id 
       LEFT JOIN users u ON s.parent_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    // Get payments for this invoice
    const paymentsResult = await pool.query(
      'SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC',
      [id]
    );

    res.json({
      invoice: result.rows[0],
      payments: paymentsResult.rows,
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/invoices
 * Create a new invoice
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, studentId, amount, dueDate, notes } = req.body;

    if (!schoolId || !studentId || !amount || !dueDate) {
      return res.status(400).json({
        error: 'Missing required fields: schoolId, studentId, amount, dueDate',
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO invoices (school_id, student_id, invoice_number, amount, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [schoolId, studentId, invoiceNumber, amount, dueDate, notes]
    );

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      error: 'Failed to create invoice',
      details: error.message,
    });
  }
});

/**
 * PUT /api/v1/invoices/:id
 * Update an invoice
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, dueDate, status, notes } = req.body;

    const result = await pool.query(
      `UPDATE invoices 
       SET amount = COALESCE($1, amount), 
           due_date = COALESCE($2, due_date),
           status = COALESCE($3, status),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [amount, dueDate, status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    res.json({
      message: 'Invoice updated successfully',
      invoice: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      error: 'Failed to update invoice',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/v1/invoices/:id
 * Delete an invoice
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if there are any payments for this invoice
    const paymentsCheck = await pool.query(
      'SELECT COUNT(*) FROM payments WHERE invoice_id = $1',
      [id]
    );

    if (parseInt(paymentsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete invoice with existing payments',
      });
    }

    const result = await pool.query(
      'DELETE FROM invoices WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    res.json({
      message: 'Invoice deleted successfully',
      invoice: result.rows[0],
    });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      error: 'Failed to delete invoice',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/invoices/reports/summary
 * Get invoice summary report
 */
router.get('/reports/summary', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        error: 'schoolId is required',
      });
    }

    const result = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
       FROM invoices
       WHERE school_id = $1
       GROUP BY status`,
      [schoolId]
    );

    // Get total summary
    const totalResult = await pool.query(
      `SELECT 
        COUNT(*) as total_invoices,
        SUM(amount) as total_amount
       FROM invoices
       WHERE school_id = $1`,
      [schoolId]
    );

    res.json({
      summary: {
        total_invoices: parseInt(totalResult.rows[0].total_invoices),
        total_amount: parseFloat(totalResult.rows[0].total_amount || 0),
        by_status: result.rows,
      },
    });
  } catch (error: any) {
    console.error('Get invoice summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice summary',
      details: error.message,
    });
  }
});

export default router;
