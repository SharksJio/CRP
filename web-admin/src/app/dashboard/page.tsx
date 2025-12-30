'use client';

import { useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = apiClient.getCurrentUser();
    setUser(currentUser);

    // Load basic stats
    loadStats(currentUser);
  }, []);

  const loadStats = async (currentUser: User | null) => {
    if (!currentUser) return;

    try {
      // Get notifications count
      const notificationsData = await apiClient.getNotifications({ 
        schoolId: currentUser.schoolId,
        limit: 5 
      });

      // Get recent expenses
      const expensesData = await apiClient.getExpenses({ 
        schoolId: currentUser.schoolId,
        limit: 5 
      });

      // Get invoices
      const invoicesData = await apiClient.getInvoices({ 
        schoolId: currentUser.schoolId,
        limit: 5 
      });

      setStats({
        notifications: notificationsData.count || 0,
        expenses: expensesData.count || 0,
        invoices: invoicesData.count || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Dashboard</h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Notifications Card */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📢</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Notifications</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
            {stats?.notifications || 0}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Recent notifications</p>
        </div>

        {/* Expenses Card */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Expenses</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {stats?.expenses || 0}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Recent expenses</p>
        </div>

        {/* Invoices Card */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Invoices</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>
            {stats?.invoices || 0}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Recent invoices</p>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Welcome, {user?.firstName}!</h2>
        <p style={{ marginBottom: '1rem' }}>
          This is your PreSchool Management Dashboard. Use the sidebar to navigate to different modules:
        </p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Communication:</strong> Manage notifications and announcements</li>
          <li><strong>Expenses:</strong> Track school expenses and remittances</li>
          <li><strong>Fee Management:</strong> Create invoices, record payments, and generate receipts</li>
        </ul>
      </div>
    </div>
  );
}
