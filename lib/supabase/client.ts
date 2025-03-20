import "client-only";
import { createBrowserClient } from "@supabase/ssr";
import {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";

// ✅ Use `const` instead of `let` for Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Keep track of the notification channel to avoid duplicate subscriptions
let notificationChannel: RealtimeChannel | null = null;

/**
 * Returns a singleton instance of the Supabase client.
 */
export const createClient = () => supabase;

/**
 * Defines a strict type for notifications received in real-time.
 */
type RealtimeNotificationPayload = RealtimePostgresInsertPayload<{
  id: string;
  user_id: string;
  type: "project_invite" | "task_assignment"; 
  message: string;
  is_read: boolean;
  created_at: string;
  sender_id?: string;
  project_id?: string;
  data?: Record<string, unknown>;
}>;

/**
 * Subscribes to real-time notifications for a specific user.
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (payload: RealtimeNotificationPayload) => void
) => {
  if (!userId || notificationChannel) return;

  notificationChannel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload as RealtimeNotificationPayload);
      }
    )
    .subscribe();
};

/**
 * Unsubscribes from the notifications channel when the component unmounts.
 */
export const unsubscribeFromNotifications = () => {
  if (notificationChannel) {
    supabase.removeChannel(notificationChannel);
    notificationChannel = null;
  }
};
