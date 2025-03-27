export type MessageViewProps = {
  selectedMessage: string | null;
  setSelectedMessage: (conversationId: string | null) => void;
  projectId: string;
};

export type SidebarProps = {
  isMinimized: boolean;
  setSelectedMessage: (conversationId: string | null) => void;
  selectedMessage: string | null;
};

export type Conversation = {
  id: string;
  type: "dm" | "group"; 
  name: string;
  avatar: string; 
};

export type User = {
  id: string;
  name: string;
  avatar_url: string; 
  email: string;
  role: string;
};

