import "client-only";
import { createBrowserClient } from "@supabase/ssr";
import {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
  RealtimePostgresDeletePayload,
} from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Keep track of active channels to avoid duplicates
let notificationChannel: RealtimeChannel | null = null;
let tasksChannel: RealtimeChannel | null = null;

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

/**
 * Defines a strict type for task updates in real-time.
 */
export type RealtimeTaskPayload =
  | (RealtimePostgresInsertPayload<{ id: string; title: string; status: string }> & {
      eventType: "INSERT";
    })
  | (RealtimePostgresUpdatePayload<{ id: string; title: string; status: string }> & {
      eventType: "UPDATE";
    })
  | (RealtimePostgresDeletePayload<{ id: string }> & {
      eventType: "DELETE";
    });

/**
 * Subscribes to real-time task updates within a project.
 */
export const subscribeToTasks = (
  projectId: string,
  callback: (payload: RealtimeTaskPayload) => void
) => {
  if (!projectId || tasksChannel) return;

  tasksChannel = supabase
    .channel(`tasks:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // ✅ INSERT, UPDATE, DELETE
        schema: "public",
        table: "tasks",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        console.log("📡 Realtime Task Event Received:", payload); // ✅ Debugging Log

        const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
        callback({ ...payload, eventType } as RealtimeTaskPayload);
      }
    )
    .subscribe();
};

/**
 * Unsubscribes from real-time task updates.
 */
export const unsubscribeFromTasks = () => {
  if (tasksChannel) {
    supabase.removeChannel(tasksChannel);
    tasksChannel = null;
  }
};
