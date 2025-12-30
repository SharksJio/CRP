'use client';

import { useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

export default function CommunicationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>('notifications');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

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
      const notifData = await apiClient.getNotifications({ schoolId: currentUser.schoolId, limit: 100 });
      setNotifications(notifData.notifications || []);

      const announcementData = await apiClient.getAnnouncements({ schoolId: currentUser.schoolId, limit: 100 });
      setAnnouncements(announcementData.announcements || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await apiClient.createNotification({
        schoolId: user.schoolId,
        userId: formData.userId || user.id,
        type: formData.type || 'general',
        title: formData.title,
        message: formData.message,
        priority: formData.priority || 'normal',
      });
      setShowForm(false);
      setFormData({});
      if (user) loadData(user);
    } catch (error) {
      console.error('Failed to create notification:', error);
      alert('Failed to create notification');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const result = await apiClient.createAnnouncement({
        schoolId: user.schoolId,
        createdBy: user.id,
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience || 'all',
      });
      
      // Auto-publish the announcement
      if (result.announcement?.id) {
        await apiClient.publishAnnouncement(result.announcement.id);
      }
      
      setShowForm(false);
      setFormData({});
      if (user) loadData(user);
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert('Failed to create announcement');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Communication</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + New {activeTab === 'notifications' ? 'Notification' : 'Announcement'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'notifications' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'notifications' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'announcements' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'announcements' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Announcements ({announcements.length})
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              Create {activeTab === 'notifications' ? 'Notification' : 'Announcement'}
            </h2>
            <form onSubmit={activeTab === 'notifications' ? handleCreateNotification : handleCreateAnnouncement}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {activeTab === 'notifications' ? 'Message' : 'Content'}
                </label>
                <textarea
                  value={activeTab === 'notifications' ? formData.message || '' : formData.content || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [activeTab === 'notifications' ? 'message' : 'content']: e.target.value 
                  })}
                  required
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormData({}); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {activeTab === 'notifications' ? (
          notifications.length === 0 ? (
            <p>No notifications found.</p>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div key={notif.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #ecf0f1',
                  opacity: notif.is_read ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>{notif.title}</h3>
                      <p style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>{notif.message}</p>
                      <small style={{ color: '#95a5a6' }}>
                        {new Date(notif.created_at).toLocaleString()} • {notif.type} • Priority: {notif.priority}
                      </small>
                    </div>
                    {!notif.is_read && (
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        backgroundColor: '#3498db', 
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          announcements.length === 0 ? (
            <p>No announcements found.</p>
          ) : (
            <div>
              {announcements.map((announcement) => (
                <div key={announcement.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #ecf0f1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>{announcement.title}</h3>
                      <p style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>{announcement.content}</p>
                      <small style={{ color: '#95a5a6' }}>
                        {new Date(announcement.created_at).toLocaleString()} • Target: {announcement.target_audience}
                      </small>
                    </div>
                    {announcement.is_published && (
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        backgroundColor: '#2ecc71', 
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        Published
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
