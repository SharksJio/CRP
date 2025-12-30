'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, User } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const currentUser = apiClient.getCurrentUser();
    setUser(currentUser);
  }, [router]);

  const handleLogout = async () => {
    await apiClient.logout();
    router.push('/login');
  };

  if (!user) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav style={{ 
        width: '250px', 
        backgroundColor: '#2c3e50', 
        color: 'white',
        padding: '1rem'
      }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>CRP PreSchool</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Logged in as:</p>
          <p style={{ fontWeight: 'bold' }}>{user.firstName} {user.lastName}</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{user.role}</p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/dashboard" style={{ 
              color: 'white', 
              textDecoration: 'none',
              display: 'block',
              padding: '0.75rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }}>
              📊 Dashboard
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/dashboard/communication" style={{ 
              color: 'white', 
              textDecoration: 'none',
              display: 'block',
              padding: '0.75rem',
              borderRadius: '4px'
            }}>
              📢 Communication
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/dashboard/expenses" style={{ 
              color: 'white', 
              textDecoration: 'none',
              display: 'block',
              padding: '0.75rem',
              borderRadius: '4px'
            }}>
              💰 Expenses
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/dashboard/fees" style={{ 
              color: 'white', 
              textDecoration: 'none',
              display: 'block',
              padding: '0.75rem',
              borderRadius: '4px'
            }}>
              💳 Fee Management
            </Link>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '2rem',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </nav>

      {/* Main content */}
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        backgroundColor: '#ecf0f1'
      }}>
        {children}
      </main>
    </div>
  );
}
