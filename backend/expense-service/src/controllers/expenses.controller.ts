import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/expenses
 * Get expenses for a school with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, categoryId, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT e.*, ec.name as category_name, u.first_name, u.last_name FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id LEFT JOIN users u ON e.created_by = u.id WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (schoolId) {
      query += ` AND e.school_id = $${paramCount}`;
      params.push(schoolId);
      paramCount++;
    }

    if (categoryId) {
      query += ` AND e.category_id = $${paramCount}`;
      params.push(categoryId);
      paramCount++;
    }

    if (startDate) {
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY e.expense_date DESC, e.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM expenses e WHERE 1=1';
    const countParams: any[] = [];
    let countParamNum = 1;

    if (schoolId) {
      countQuery += ` AND e.school_id = $${countParamNum}`;
      countParams.push(schoolId);
      countParamNum++;
    }

    if (categoryId) {
      countQuery += ` AND e.category_id = $${countParamNum}`;
      countParams.push(categoryId);
      countParamNum++;
    }

    if (startDate) {
      countQuery += ` AND e.expense_date >= $${countParamNum}`;
      countParams.push(startDate);
      countParamNum++;
    }

    if (endDate) {
      countQuery += ` AND e.expense_date <= $${countParamNum}`;
      countParams.push(endDate);
      countParamNum++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      count: result.rows.length,
      total: totalCount,
      expenses: result.rows,
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      error: 'Failed to fetch expenses',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/expenses/:id
 * Get a specific expense by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, ec.name as category_name, u.first_name, u.last_name 
       FROM expenses e 
       LEFT JOIN expense_categories ec ON e.category_id = ec.id 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found',
      });
    }

    res.json({
      expense: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get expense error:', error);
    res.status(500).json({
      error: 'Failed to fetch expense',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/expenses
 * Create a new expense
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, categoryId, createdBy, amount, description, receiptUrl, expenseDate } = req.body;

    if (!schoolId || !amount || !expenseDate) {
      return res.status(400).json({
        error: 'Missing required fields: schoolId, amount, expenseDate',
      });
    }

    const result = await pool.query(
      `INSERT INTO expenses (school_id, category_id, created_by, amount, description, receipt_url, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [schoolId, categoryId, createdBy, amount, description, receiptUrl, expenseDate]
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create expense error:', error);
    res.status(500).json({
      error: 'Failed to create expense',
      details: error.message,
    });
  }
});

/**
 * PUT /api/v1/expenses/:id
 * Update an expense
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, amount, description, receiptUrl, expenseDate } = req.body;

    const result = await pool.query(
      `UPDATE expenses 
       SET category_id = COALESCE($1, category_id), 
           amount = COALESCE($2, amount), 
           description = COALESCE($3, description),
           receipt_url = COALESCE($4, receipt_url),
           expense_date = COALESCE($5, expense_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [categoryId, amount, description, receiptUrl, expenseDate, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found',
      });
    }

    res.json({
      message: 'Expense updated successfully',
      expense: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update expense error:', error);
    res.status(500).json({
      error: 'Failed to update expense',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/v1/expenses/:id
 * Delete an expense
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found',
      });
    }

    res.json({
      message: 'Expense deleted successfully',
      expense: result.rows[0],
    });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      error: 'Failed to delete expense',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/expenses/reports/summary
 * Get expense summary report
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
        ec.name as category_name,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.school_id = $1
    `;
    const params: any[] = [schoolId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' GROUP BY ec.name ORDER BY total_amount DESC';

    const result = await pool.query(query, params);

    // Get total expenses
    let totalQuery = `
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount
      FROM expenses
      WHERE school_id = $1
    `;
    const totalParams: any[] = [schoolId];
    let totalParamCount = 2;

    if (startDate) {
      totalQuery += ` AND expense_date >= $${totalParamCount}`;
      totalParams.push(startDate);
      totalParamCount++;
    }

    if (endDate) {
      totalQuery += ` AND expense_date <= $${totalParamCount}`;
      totalParams.push(endDate);
      totalParamCount++;
    }

    const totalResult = await pool.query(totalQuery, totalParams);

    res.json({
      summary: {
        total_expenses: parseInt(totalResult.rows[0].total_count),
        total_amount: parseFloat(totalResult.rows[0].total_amount || 0),
        by_category: result.rows,
      },
    });
  } catch (error: any) {
    console.error('Get expense summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch expense summary',
      details: error.message,
    });
  }
});

export default router;
