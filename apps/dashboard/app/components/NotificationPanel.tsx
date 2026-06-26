'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, X, Check, CheckCheck, Trash2, ExternalLink,
  Calendar, Filter, Clock, ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function NotificationPanel() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Connect to WebSocket events namespace
    const socket = io(`${API}/events`, {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Dashboard notifications socket connected');
    });

    socket.on('notification', (newNotif: Notification) => {
      console.log('Dashboard received real-time notification:', newNotif);
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });

      // Dispatch a custom event so other components can fetch data in real-time
      window.dispatchEvent(new CustomEvent('notification-received', { detail: newNotif }));
    });

    socket.on('disconnect', () => {
      console.log('Dashboard notifications socket disconnected');
    });

    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await fetch(`${API}/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch(`${API}/api/notifications/read-all`, { method: 'POST', credentials: 'include' });
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch(`${API}/api/notifications/${id}`, { method: 'DELETE', credentials: 'include' });
  };

  const dismissAllRead = async () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
    await fetch(`${API}/api/notifications/dismiss-all`, { method: 'POST', credentials: 'include' });
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) router.push(n.link);
    setIsOpen(false);
  };

  // Date filtering
  const filterByDate = (list: Notification[]): Notification[] => {
    if (dateFilter === 'all') return list;
    const now = new Date();
    return list.filter(n => {
      const created = new Date(n.createdAt);
      if (dateFilter === 'today') {
        return created.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return created >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return created >= monthAgo;
      }
      return true;
    });
  };

  const filtered = filterByDate(notifications);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 border border-transparent hover:border-paper-200 dark:hover:border-ink-700 transition-all duration-150 relative"
        id="notificationBell"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className="absolute w-3 h-3 rounded-full bg-coral-500 animate-ping opacity-40"></span>
            <span className="relative w-2.5 h-2.5 rounded-full bg-coral-500 shadow-[0_0_6px_rgba(244,63,94,0.6)] flex items-center justify-center">
              {unreadCount > 9 ? (
                <span className="text-[6px] font-bold text-white leading-none">9+</span>
              ) : unreadCount > 0 && unreadCount <= 9 ? (
                <span className="text-[7px] font-bold text-white leading-none">{unreadCount}</span>
              ) : null}
            </span>
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute right-0 top-full mt-2 w-96 max-h-[520px] bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-out origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-paper-100 dark:border-ink-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-coral-500/10 text-coral-600 dark:text-coral-400 px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Date Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white bg-paper-50 dark:bg-ink-800 rounded-md border border-paper-200 dark:border-ink-700 transition-all hover:border-paper-300 dark:hover:border-ink-600"
              >
                <Filter className="w-3 h-3" />
                {dateFilterLabels[dateFilter]}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-xl z-10 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {(Object.keys(dateFilterLabels) as DateFilter[]).map(key => (
                    <button
                      key={key}
                      onClick={() => { setDateFilter(key); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                        dateFilter === key
                          ? 'text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-500/10 font-semibold'
                          : 'text-paper-600 dark:text-ink-300 hover:bg-paper-50 dark:hover:bg-ink-700'
                      }`}
                    >
                      {dateFilterLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1.5 text-paper-400 dark:text-ink-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
            {notifications.some(n => n.isRead) && (
              <button
                onClick={dismissAllRead}
                title="Dismiss all read"
                className="p-1.5 text-paper-400 dark:text-ink-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-paper-400 dark:text-ink-500 hover:text-paper-700 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-800 rounded-md transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-paper-100 dark:bg-ink-800 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-paper-400 dark:text-ink-500" />
              </div>
              <p className="text-xs font-medium text-paper-500 dark:text-ink-400">
                {dateFilter !== 'all' ? 'No notifications for this period' : 'All caught up!'}
              </p>
              <p className="text-[10px] text-paper-400 dark:text-ink-500 mt-1">
                {dateFilter !== 'all' ? 'Try changing the filter' : 'New notifications will appear here'}
              </p>
            </div>
          ) : (
            filtered.map((n, idx) => (
              <div
                key={n.id}
                className={`group relative flex items-start gap-3 px-4 py-3 border-b border-paper-50 dark:border-ink-800/50 cursor-pointer transition-all duration-150 hover:bg-paper-50 dark:hover:bg-ink-800/50 ${
                  !n.isRead ? 'bg-coral-50/30 dark:bg-coral-500/5' : ''
                }`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Unread indicator */}
                {!n.isRead && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_4px_rgba(244,63,94,0.5)] flex-shrink-0" />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(n)}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-xs font-semibold truncate ${
                      !n.isRead ? 'text-paper-900 dark:text-white' : 'text-paper-600 dark:text-ink-300'
                    }`}>
                      {n.title}
                    </p>
                    {n.link && (
                      <ExternalLink className="w-3 h-3 text-paper-300 dark:text-ink-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                    !n.isRead ? 'text-paper-600 dark:text-ink-300' : 'text-paper-400 dark:text-ink-500'
                  }`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3 text-paper-300 dark:text-ink-600" />
                    <span className="text-[10px] text-paper-400 dark:text-ink-500">{formatTime(n.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 pt-0.5">
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                      title="Mark as read"
                      className="p-1 text-paper-400 dark:text-ink-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-all"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    title="Delete"
                    className="p-1 text-paper-400 dark:text-ink-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
