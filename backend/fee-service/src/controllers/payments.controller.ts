import { Router, Request, Response } from 'express';
import { pool } from '../main';

const router = Router();

/**
 * GET /api/v1/payments
 * Get payments with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { invoiceId, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT p.*, i.invoice_number, i.student_id
      FROM payments p 
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (invoiceId) {
      query += ` AND p.invoice_id = $${paramCount}`;
      params.push(invoiceId);
      paramCount++;
    }

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY p.payment_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      payments: result.rows,
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({
      error: 'Failed to fetch payments',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/payments/:id
 * Get a specific payment by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, i.invoice_number, i.amount as invoice_amount, i.student_id
       FROM payments p 
       LEFT JOIN invoices i ON p.invoice_id = i.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment not found',
      });
    }

    // Get receipt if exists
    const receiptResult = await pool.query(
      'SELECT * FROM payment_receipts WHERE payment_id = $1',
      [id]
    );

    res.json({
      payment: result.rows[0],
      receipt: receiptResult.rows[0] || null,
    });
  } catch (error: any) {
    console.error('Get payment error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/payments
 * Create a new payment (record a payment)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionId } = req.body;

    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields: invoiceId, amount, paymentMethod',
      });
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert payment
      const paymentResult = await client.query(
        `INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, status)
         VALUES ($1, $2, $3, $4, 'completed')
         RETURNING *`,
        [invoiceId, amount, paymentMethod, transactionId]
      );

      const payment = paymentResult.rows[0];

      // Get invoice details
      const invoiceResult = await client.query(
        'SELECT * FROM invoices WHERE id = $1',
        [invoiceId]
      );

      if (invoiceResult.rows.length === 0) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceResult.rows[0];

      // Calculate total payments for this invoice
      const totalPaymentsResult = await client.query(
        `SELECT SUM(amount) as total_paid FROM payments 
         WHERE invoice_id = $1 AND status = 'completed'`,
        [invoiceId]
      );

      const totalPaid = parseFloat(totalPaymentsResult.rows[0].total_paid || 0);

      // Update invoice status
      let newStatus = invoice.status;
      if (totalPaid >= invoice.amount) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial';
      }

      await client.query(
        'UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStatus, invoiceId]
      );

      // Generate receipt
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      const receiptResult = await client.query(
        `INSERT INTO payment_receipts (payment_id, receipt_number)
         VALUES ($1, $2)
         RETURNING *`,
        [payment.id, receiptNumber]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Payment recorded successfully',
        payment: payment,
        receipt: receiptResult.rows[0],
        invoice_status: newStatus,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({
      error: 'Failed to record payment',
      details: error.message,
    });
  }
});

/**
 * PUT /api/v1/payments/:id
 * Update a payment
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const result = await pool.query(
      `UPDATE payments 
       SET status = COALESCE($1, status),
           transaction_id = COALESCE($2, transaction_id)
       WHERE id = $3
       RETURNING *`,
      [status, transactionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment not found',
      });
    }

    res.json({
      message: 'Payment updated successfully',
      payment: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update payment error:', error);
    res.status(500).json({
      error: 'Failed to update payment',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/payments/:id/refund
 * Refund a payment
 */
router.post('/:id/refund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update payment status
      const paymentResult = await client.query(
        `UPDATE payments 
         SET status = 'refunded'
         WHERE id = $1 AND status = 'completed'
         RETURNING *`,
        [id]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('Payment not found or cannot be refunded');
      }

      const payment = paymentResult.rows[0];

      // Recalculate invoice status
      const totalPaymentsResult = await client.query(
        `SELECT SUM(amount) as total_paid FROM payments 
         WHERE invoice_id = $1 AND status = 'completed'`,
        [payment.invoice_id]
      );

      const totalPaid = parseFloat(totalPaymentsResult.rows[0].total_paid || 0);

      // Get invoice amount
      const invoiceResult = await client.query(
        'SELECT amount FROM invoices WHERE id = $1',
        [payment.invoice_id]
      );

      const invoiceAmount = parseFloat(invoiceResult.rows[0].amount);

      let newStatus = 'pending';
      if (totalPaid >= invoiceAmount) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial';
      }

      await client.query(
        'UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStatus, payment.invoice_id]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Payment refunded successfully',
        payment: paymentResult.rows[0],
        invoice_status: newStatus,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      error: 'Failed to refund payment',
      details: error.message,
    });
  }
});

export default router;
