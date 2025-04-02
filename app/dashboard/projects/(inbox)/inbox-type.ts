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
  lastMessageContent: string | null;
  lastMessageSenderId: string | null;
  lastMessageSenderName: string | null;
};

export type User = {
  id: string;
  name: string;
  avatar_url: string; 
  email: string;
  role: string;
};

export type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  conversation_id: string; 
  sender?: {
    id: string;
    name: string;
    avatar_url: string;
  };
};

export type SupabaseConversationRow = {
  id: string;
  type: "dm" | "group";
  name: string | null;
  conversation_members: {
    users: {
      id: string;
      name: string;
      avatar_url: string;
    }[]; 
  }[];
  messages: {
    content: string;
    sender_id: string;
    created_at: string;
    sender: { 
      id: string;
      name: string;
      avatar_url: string;
    }[];
  }[];
};