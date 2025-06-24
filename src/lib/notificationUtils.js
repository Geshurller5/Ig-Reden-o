import { supabase } from '@/lib/supabaseClient';

export const createNotificationForAllUsers = async (notificationData) => {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) throw profilesError;

    const userIds = profiles.map(p => p.id);

    if (userIds.length === 0) return { success: true };

    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      link: notificationData.link,
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    return { success: true };
  } catch (error) {
    console.error('Error creating notifications for all users:', error);
    return { success: false, error };
  }
};