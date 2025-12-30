import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/expense-categories
 * Get all expense categories for a school
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        error: 'schoolId is required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM expense_categories WHERE school_id = $1 ORDER BY name',
      [schoolId]
    );

    res.json({
      count: result.rows.length,
      categories: result.rows,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch expense categories',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/expense-categories
 * Create a new expense category
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, name, description } = req.body;

    if (!schoolId || !name) {
      return res.status(400).json({
        error: 'Missing required fields: schoolId, name',
      });
    }

    const result = await pool.query(
      `INSERT INTO expense_categories (school_id, name, description, is_custom)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [schoolId, name, description]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({
      error: 'Failed to create category',
      details: error.message,
    });
  }
});

/**
 * PUT /api/v1/expense-categories/:id
 * Update an expense category
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE expense_categories 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description)
       WHERE id = $3 AND is_custom = true
       RETURNING *`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Category not found or cannot be updated (system categories cannot be modified)',
      });
    }

    res.json({
      message: 'Category updated successfully',
      category: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({
      error: 'Failed to update category',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/v1/expense-categories/:id
 * Delete an expense category (only custom categories)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM expense_categories WHERE id = $1 AND is_custom = true RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Category not found or cannot be deleted (system categories cannot be deleted)',
      });
    }

    res.json({
      message: 'Category deleted successfully',
      category: result.rows[0],
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({
      error: 'Failed to delete category',
      details: error.message,
    });
  }
});

export default router;
