'use client';

import { useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

// Icon components
const ExpenseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default function ExpensesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      const [expensesData, categoriesData] = await Promise.all([
        apiClient.getExpenses({ schoolId: currentUser.schoolId, limit: 100 }),
        apiClient.getExpenseCategories(currentUser.schoolId),
      ]);
      setExpenses(expensesData.expenses || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await apiClient.createExpense({
        schoolId: user.schoolId,
        createdBy: user.id,
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        expenseDate: formData.expenseDate,
      });
      setShowForm(false);
      setFormData({});
      if (user) loadData(user);
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to create expense');
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

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.expense_date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Track and manage school expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-filled inline-flex items-center gap-2 bg-error-500 hover:bg-error-600"
        >
          <PlusIcon />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="w-12 h-12 bg-error-50 text-error-600 rounded-2xl flex items-center justify-center mb-4">
            <ExpenseIcon />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-error-600">${totalAmount.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">From {expenses.length} records</p>
        </div>

        <div className="metric-card">
          <div className="w-12 h-12 bg-warning-50 text-warning-600 rounded-2xl flex items-center justify-center mb-4">
            <CalendarIcon />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">This Month</h3>
          <p className="text-3xl font-bold text-warning-600">${thisMonthTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">{thisMonthExpenses.length} expenses</p>
        </div>

        <div className="metric-card">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendUpIcon />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Categories</h3>
          <p className="text-3xl font-bold text-primary-600">{categories.length}</p>
          <p className="text-sm text-gray-400 mt-1">Expense categories</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="dialog-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
              <button
                onClick={() => { setShowForm(false); setFormData({}); }}
                className="btn-icon"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    className="select-field"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Enter expense description..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={formData.expenseDate || ''}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormData({}); }}
                  className="btn-outlined"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-filled bg-error-500 hover:bg-error-600"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </div>
                  ) : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="card">
        <div className="p-4 border-b border-outline-variant">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExpenseIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
            <p className="text-gray-500 mb-4">Add your first expense to get started</p>
            <button onClick={() => setShowForm(true)} className="btn-tonal">
              <PlusIcon />
              Add Expense
            </button>
          </div>
        ) : (
          <div className="table-container border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-error-50 text-error-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CalendarIcon />
                        </div>
                        <span className="font-medium text-gray-900">
                          {new Date(expense.expense_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="chip-filled">
                        {expense.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <span className="text-gray-600">{expense.description || 'No description'}</span>
                    </td>
                    <td className="text-right">
                      <span className="text-lg font-bold text-error-600">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </span>
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
