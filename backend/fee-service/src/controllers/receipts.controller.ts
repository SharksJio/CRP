import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/receipts
 * Get payment receipts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { paymentId, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT pr.*, p.amount, p.payment_method, i.invoice_number, i.student_id
      FROM payment_receipts pr
      LEFT JOIN payments p ON pr.payment_id = p.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (paymentId) {
      query += ` AND pr.payment_id = $${paramCount}`;
      params.push(paymentId);
      paramCount++;
    }

    query += ` ORDER BY pr.generated_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      receipts: result.rows,
    });
  } catch (error: any) {
    console.error('Get receipts error:', error);
    res.status(500).json({
      error: 'Failed to fetch receipts',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/receipts/:id
 * Get a specific receipt by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT pr.*, p.amount, p.payment_method, p.payment_date, p.transaction_id,
              i.invoice_number, i.amount as invoice_amount, i.due_date,
              s.first_name as student_first_name, s.last_name as student_last_name,
              sc.name as school_name, sc.address as school_address
       FROM payment_receipts pr
       LEFT JOIN payments p ON pr.payment_id = p.id
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN students s ON i.student_id = s.id
       LEFT JOIN schools sc ON i.school_id = sc.id
       WHERE pr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Receipt not found',
      });
    }

    res.json({
      receipt: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      error: 'Failed to fetch receipt',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/receipts/number/:receiptNumber
 * Get a receipt by receipt number
 */
router.get('/number/:receiptNumber', async (req: Request, res: Response) => {
  try {
    const { receiptNumber } = req.params;

    const result = await pool.query(
      `SELECT pr.*, p.amount, p.payment_method, p.payment_date, p.transaction_id,
              i.invoice_number, i.amount as invoice_amount, i.due_date,
              s.first_name as student_first_name, s.last_name as student_last_name,
              sc.name as school_name, sc.address as school_address
       FROM payment_receipts pr
       LEFT JOIN payments p ON pr.payment_id = p.id
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN students s ON i.student_id = s.id
       LEFT JOIN schools sc ON i.school_id = sc.id
       WHERE pr.receipt_number = $1`,
      [receiptNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Receipt not found',
      });
    }

    res.json({
      receipt: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get receipt by number error:', error);
    res.status(500).json({
      error: 'Failed to fetch receipt',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/receipts/:id/regenerate
 * Regenerate a receipt (update receipt URL)
 */
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receiptUrl } = req.body;

    const result = await pool.query(
      `UPDATE payment_receipts 
       SET receipt_url = $1, generated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [receiptUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Receipt not found',
      });
    }

    res.json({
      message: 'Receipt regenerated successfully',
      receipt: result.rows[0],
    });
  } catch (error: any) {
    console.error('Regenerate receipt error:', error);
    res.status(500).json({
      error: 'Failed to regenerate receipt',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/receipts/:id/download
 * Generate and download receipt as text (placeholder for PDF generation)
 */
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT pr.*, p.amount, p.payment_method, p.payment_date, p.transaction_id,
              i.invoice_number, i.amount as invoice_amount, i.due_date,
              s.first_name as student_first_name, s.last_name as student_last_name,
              sc.name as school_name, sc.address as school_address, sc.contact_email, sc.contact_phone
       FROM payment_receipts pr
       LEFT JOIN payments p ON pr.payment_id = p.id
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN students s ON i.student_id = s.id
       LEFT JOIN schools sc ON i.school_id = sc.id
       WHERE pr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Receipt not found',
      });
    }

    const receipt = result.rows[0];

    // Generate simple text receipt (in production, this would be a PDF)
    const receiptText = `
========================================
         PAYMENT RECEIPT
========================================

Receipt Number: ${receipt.receipt_number}
Date: ${new Date(receipt.generated_at).toLocaleDateString()}

----------------------------------------
School Information
----------------------------------------
${receipt.school_name}
${receipt.school_address}
Email: ${receipt.contact_email}
Phone: ${receipt.contact_phone}

----------------------------------------
Student Information
----------------------------------------
Name: ${receipt.student_first_name} ${receipt.student_last_name}

----------------------------------------
Payment Details
----------------------------------------
Invoice Number: ${receipt.invoice_number}
Invoice Amount: $${parseFloat(receipt.invoice_amount).toFixed(2)}
Payment Amount: $${parseFloat(receipt.amount).toFixed(2)}
Payment Method: ${receipt.payment_method}
Payment Date: ${new Date(receipt.payment_date).toLocaleDateString()}
Transaction ID: ${receipt.transaction_id || 'N/A'}

========================================
       Thank you for your payment!
========================================
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${receipt.receipt_number}.txt"`);
    res.send(receiptText);
  } catch (error: any) {
    console.error('Download receipt error:', error);
    res.status(500).json({
      error: 'Failed to download receipt',
      details: error.message,
    });
  }
});

export default router;
