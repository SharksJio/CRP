'use client';

import { useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

// Icon components
const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const AnnouncementIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
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

export default function CommunicationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>('notifications');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
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
    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-12 bg-gray-200 rounded w-1/2" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Communication</h1>
          <p className="text-gray-500 mt-1">Manage notifications and announcements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-filled inline-flex items-center gap-2"
        >
          <PlusIcon />
          New {activeTab === 'notifications' ? 'Notification' : 'Announcement'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('notifications')}
            className={activeTab === 'notifications' ? 'tab-active' : 'tab'}
          >
            <div className="flex items-center gap-2">
              <NotificationIcon />
              Notifications
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                ${activeTab === 'notifications' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600'}`}>
                {notifications.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={activeTab === 'announcements' ? 'tab-active' : 'tab'}
          >
            <div className="flex items-center gap-2">
              <AnnouncementIcon />
              Announcements
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                ${activeTab === 'announcements' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600'}`}>
                {announcements.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="dialog-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create {activeTab === 'notifications' ? 'Notification' : 'Announcement'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setFormData({}); }}
                className="btn-icon"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={activeTab === 'notifications' ? handleCreateNotification : handleCreateAnnouncement}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="input-field"
                    placeholder="Enter title..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
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
                    className="input-field resize-none"
                    placeholder={`Enter ${activeTab === 'notifications' ? 'message' : 'content'}...`}
                  />
                </div>

                {activeTab === 'notifications' && (
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={formData.priority || 'normal'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="select-field"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                )}

                {activeTab === 'announcements' && (
                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <select
                      value={formData.targetAudience || 'all'}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="select-field"
                    >
                      <option value="all">All</option>
                      <option value="parents">Parents</option>
                      <option value="teachers">Teachers</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                )}
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
                  className="btn-filled"
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
                  ) : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card">
        {activeTab === 'notifications' ? (
          notifications.length === 0 ? (
            <div className="empty-state py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <NotificationIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
              <p className="text-gray-500 mb-4">Create your first notification to get started</p>
              <button onClick={() => setShowForm(true)} className="btn-tonal">
                <PlusIcon />
                Create Notification
              </button>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 hover:bg-surface-container-high transition-colors duration-200
                    ${notif.is_read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${notif.priority === 'urgent' ? 'bg-error-100 text-error-600' :
                        notif.priority === 'high' ? 'bg-warning-100 text-warning-600' :
                        'bg-primary-100 text-primary-600'}`}>
                      <NotificationIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900">{notif.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notif.is_read && (
                            <span className="status-info">New</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                            ${notif.priority === 'urgent' ? 'bg-error-100 text-error-700' :
                              notif.priority === 'high' ? 'bg-warning-100 text-warning-700' :
                              notif.priority === 'low' ? 'bg-gray-100 text-gray-600' :
                              'bg-primary-100 text-primary-700'}`}>
                            {notif.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{new Date(notif.created_at).toLocaleString()}</span>
                        <span className="capitalize">{notif.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          announcements.length === 0 ? (
            <div className="empty-state py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AnnouncementIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No announcements yet</h3>
              <p className="text-gray-500 mb-4">Create your first announcement to get started</p>
              <button onClick={() => setShowForm(true)} className="btn-tonal">
                <PlusIcon />
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className="p-4 hover:bg-surface-container-high transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AnnouncementIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        {announcement.is_published && (
                          <span className="status-success">Published</span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{announcement.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{new Date(announcement.created_at).toLocaleString()}</span>
                        <span className="capitalize">Target: {announcement.target_audience}</span>
                      </div>
                    </div>
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
