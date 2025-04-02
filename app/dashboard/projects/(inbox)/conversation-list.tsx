"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Conversation } from "./inbox-type";

interface ConversationListProps {
  conversations: Conversation[];
  setSelectedMessage: (conversationId: string | null) => void;
  selectedMessage: string | null;
  isMinimized: boolean;
  userId: string; 
}

const ConversationList = ({
  conversations,
  setSelectedMessage,
  selectedMessage,
  isMinimized,
  userId, 
}: ConversationListProps) => {
  return (
    <div className="flex flex-col gap-2 h-full">
      {conversations.length > 0 ? (
        conversations.map((conversation) => {
          console.log("🔍 Conversation:", conversation);

          return isMinimized ? (
            <Avatar
              key={conversation.id}
              className={`w-12 h-12 cursor-pointer ${
                selectedMessage === conversation.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedMessage(conversation.id)}
            >
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback>
                {conversation.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Card
              key={conversation.id}
              className={`cursor-pointer transition-all p-3 rounded-lg ${
                selectedMessage === conversation.id
                  ? "bg-primary/20"
                  : "hover:bg-accent/30"
              }`}
              onClick={() => setSelectedMessage(conversation.id)}
            >
              <CardContent className="flex flex-col items-start gap-3 p-3">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
                    <AvatarFallback>
                      {conversation.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col flex-grow overflow-hidden">
                    <p className="text-sm font-semibold text-foreground">
                      {conversation.name}
                    </p>
                  </div>
                </div>
                {conversation.lastMessageContent && (
                  <p className="text-xs text-muted-foreground truncate w-full">
                    {conversation.lastMessageSenderId === userId
                      ? `You: ${conversation.lastMessageContent}`
                      : `${conversation.lastMessageContent}`} 
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <p className="text-muted-foreground text-center">No conversations found.</p>
      )}
    </div>
  );
};

export default ConversationList;