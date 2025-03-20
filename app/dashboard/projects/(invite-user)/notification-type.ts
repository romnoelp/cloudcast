export type NotificationData = {
  projectName?: string;
  projectId?: string; 
  adminName?: string; 
  [key: string]: unknown; 
};

export type Notification = {
  id: string;
  user_id: string;
  type: "project_invite" | "task_assignment"; 
  message: string;
  is_read: boolean;
  created_at: string;
  sender_id?: string;
  project_id?: string;
  data?: Record<string, unknown>;
};

export type NotificationDropdownProps = {
  userId: string;
};
