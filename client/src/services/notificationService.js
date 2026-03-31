import { supabase } from '../lib/supabaseClient';

/**
 * NOTIFICATION SERVICE
 * Supabase-backed real-time notification system for order alerts, price drops,
 * stock warnings, and system events.
 */

let listeners = [];
let notifications = [];

export const NOTIF_TYPES = {
  ORDER_RECEIVED:  'order_received',
  ORDER_UPDATED:   'order_updated',
  LOW_STOCK:       'low_stock',
  PRICE_ALERT:     'price_alert',
  EXPIRY_WARNING:  'expiry_warning',
  AI_INSIGHT:      'ai_insight',
  SUCCESS:         'success',
  ERROR:           'error',
  INFO:            'info',
};

const TYPE_CONFIG = {
  order_received:  { color: 'emerald', icon: '📦', label: 'New Order' },
  order_updated:   { color: 'blue',    icon: '🔄', label: 'Order Update' },
  low_stock:       { color: 'amber',   icon: '⚠️',  label: 'Low Stock' },
  price_alert:     { color: 'purple',  icon: '💰', label: 'Price Alert' },
  expiry_warning:  { color: 'rose',    icon: '⏰', label: 'Expiry Warning' },
  ai_insight:      { color: 'cyan',    icon: '🤖', label: 'AI Insight' },
  success:         { color: 'emerald', icon: '✅', label: 'Success' },
  error:           { color: 'rose',    icon: '❌', label: 'Error' },
  info:            { color: 'blue',    icon: 'ℹ️',  label: 'Info' },
};

const formatNotification = (notif) => {
  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  return {
    ...notif,
    color: config.color,
    icon: config.icon,
    label: config.label,
    timestamp: new Date(notif.created_at),
  };
};

/**
 * Fetch notifications from database
 */
export const fetchNotifications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  
  notifications = (data || []).map(formatNotification);
  listeners.forEach(fn => fn([...notifications]));
  return notifications;
};

/**
 * Add a notification to the database
 */
export const notify = async (type, title, message, options = {}) => {
  let userId = options.userId;
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      title,
      message,
    }])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) throw error;
  
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  listeners.forEach(fn => fn([...notifications]));
};

/**
 * Remove a specific notification from memory (and optionally DB)
 */
export const dismiss = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;

  notifications = notifications.filter(n => n.id !== id);
  listeners.forEach(fn => fn([...notifications]));
};

/**
 * Clear all notifications for the user
 */
export const clearAll = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;

  notifications = [];
  listeners.forEach(fn => fn([]));
};

/**
 * Subscribe to notification updates (Local listeners + Supabase Realtime)
 */
export const subscribe = (callback) => {
  listeners.push(callback);
  callback([...notifications]);

  // Handle Supabase Realtime subscription
  let channel = null;
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      channel = supabase
        .channel(`public:notifications:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newNotif = formatNotification(payload.new);
              notifications = [newNotif, ...notifications].slice(0, 20);
            } else if (payload.eventType === 'DELETE') {
              notifications = notifications.filter(n => n.id !== payload.old.id);
            } else if (payload.eventType === 'UPDATE') {
              notifications = notifications.map(n => n.id === payload.new.id ? formatNotification(payload.new) : n);
            }
            listeners.forEach(fn => fn([...notifications]));
          }
        )
        .subscribe();
    }
  });

  return () => {
    listeners = listeners.filter(l => l !== callback);
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Get current notification count (unread)
 */
export const getUnreadCount = () => notifications.filter(n => !n.read).length;

// Convenience helpers
export const notifySuccess = (title, message, targetId) => notify(NOTIF_TYPES.SUCCESS, title, message, targetId);
export const notifyError = (title, message, targetId) => notify(NOTIF_TYPES.ERROR, title, message, targetId);
export const notifyOrder = (title, message, targetId) => notify(NOTIF_TYPES.ORDER_RECEIVED, title, message, targetId);
export const notifyLowStock = (title, message, targetId) => notify(NOTIF_TYPES.LOW_STOCK, title, message, targetId);
export const notifyAI = (title, message, targetId) => notify(NOTIF_TYPES.AI_INSIGHT, title, message, targetId);
