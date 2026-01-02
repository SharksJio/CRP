'use client';

import { useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

// Icon components
const InvoiceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PaymentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function FeesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = apiClient.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadData(currentUser);
    }
  }, []);

  const loadData = async (currentUser: User) => {
    setLoading(true);
    try {
      const invoicesData = await apiClient.getInvoices({ schoolId: currentUser.schoolId, limit: 100 });
      setInvoices(invoicesData.invoices || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await apiClient.createInvoice({
        schoolId: user.schoolId,
        studentId: formData.studentId,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes,
      });
      setShowInvoiceForm(false);
      setFormData({});
      if (user) loadData(user);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);

    try {
      const result = await apiClient.createPayment({
        invoiceId: selectedInvoice.id,
        amount: parseFloat(formData.paymentAmount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
      });
      
      alert(`Payment recorded successfully! Receipt Number: ${result.receipt?.receipt_number}`);
      
      setShowPaymentForm(false);
      setSelectedInvoice(null);
      setFormData({});
      if (user) loadData(user);
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 mt-1">Manage invoices, payments, and receipts</p>
        </div>
        <button
          onClick={() => setShowInvoiceForm(true)}
          className="btn-filled inline-flex items-center gap-2 bg-success-500 hover:bg-success-600"
        >
          <PlusIcon />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <InvoiceIcon />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Invoices</h3>
          <p className="text-3xl font-bold text-primary-600">{invoices.length}</p>
          <p className="text-sm text-gray-400 mt-1">All time records</p>
        </div>

        <div className="metric-card">
          <div className="w-12 h-12 bg-warning-50 text-warning-600 rounded-2xl flex items-center justify-center mb-4">
            <ClockIcon />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending</h3>
          <p className="text-3xl font-bold text-warning-600">${totalPending.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">{pendingCount} invoices pending</p>
        </div>

        <div className="metric-card">
          <div className="w-12 h-12 bg-success-50 text-success-600 rounded-2xl flex items-center justify-center mb-4">
            <CheckIcon />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Paid</h3>
          <p className="text-3xl font-bold text-success-600">${totalPaid.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">{paidCount} invoices paid</p>
        </div>
      </div>

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <div className="dialog-overlay" onClick={() => setShowInvoiceForm(false)}>
          <div className="dialog-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Invoice</h2>
              <button
                onClick={() => { setShowInvoiceForm(false); setFormData({}); }}
                className="btn-icon"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId || ''}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    placeholder="Enter student UUID"
                    className="input-field"
                  />
                  <p className="form-helper">Enter the unique student identifier</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="input-field pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Add any notes about this invoice..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => { setShowInvoiceForm(false); setFormData({}); }}
                  className="btn-outlined"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-filled bg-success-500 hover:bg-success-600"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </div>
                  ) : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="dialog-overlay" onClick={() => { setShowPaymentForm(false); setSelectedInvoice(null); }}>
          <div className="dialog-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
              <button
                onClick={() => { setShowPaymentForm(false); setSelectedInvoice(null); setFormData({}); }}
                className="btn-icon"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Invoice Summary */}
            <div className="card-filled p-4 mb-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Invoice</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount Due</p>
                  <p className="text-xl font-bold text-primary-600">
                    ${parseFloat(selectedInvoice.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Payment Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedInvoice.amount}
                      value={formData.paymentAmount || ''}
                      onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                      required
                      className="input-field pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={formData.paymentMethod || ''}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    required
                    className="select-field"
                  >
                    <option value="">Select method</option>
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="upi">📱 UPI</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction ID (optional)</label>
                  <input
                    type="text"
                    value={formData.transactionId || ''}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="input-field"
                    placeholder="Enter transaction reference..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => { setShowPaymentForm(false); setSelectedInvoice(null); setFormData({}); }}
                  className="btn-outlined"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-filled bg-success-500 hover:bg-success-600"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </div>
                  ) : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="card">
        <div className="p-4 border-b border-outline-variant">
          <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="empty-state py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <InvoiceIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices yet</h3>
            <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
            <button onClick={() => setShowInvoiceForm(true)} className="btn-tonal">
              <PlusIcon />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="table-container border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Student</th>
                  <th>Due Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <InvoiceIcon />
                        </div>
                        <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar-sm">
                          {invoice.student_first_name?.charAt(0)}{invoice.student_last_name?.charAt(0)}
                        </div>
                        <span>{invoice.student_first_name} {invoice.student_last_name}</span>
                      </div>
                    </td>
                    <td>
                      {new Date(invoice.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ${parseFloat(invoice.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`
                        ${invoice.status === 'paid' ? 'status-success' : 
                          invoice.status === 'pending' ? 'status-warning' : 
                          'status-error'}
                      `}>
                        {invoice.status === 'paid' && <CheckIcon />}
                        {invoice.status === 'pending' && <ClockIcon />}
                        <span className="capitalize">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="text-center">
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => { setSelectedInvoice(invoice); setShowPaymentForm(true); }}
                          className="btn-tonal text-sm py-2"
                        >
                          <PaymentIcon />
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
