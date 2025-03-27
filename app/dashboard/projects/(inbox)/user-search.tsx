"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import UserList from "./user-list";
import { startConversation } from "./actions";
import { useUser } from "@/context/user-context";

type UserSearchProps = {
  users: User[];
  setSelectedMessage: (conversationId: string) => void;
  projectId: string;
};

const UserSearch = ({ users, setSelectedMessage, projectId }: UserSearchProps) => {
  const { user: currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users
      .filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleSelectUser = async (selectedUser: User) => {
    if (!selectedUser || !currentUser) return;
  
    setSearchQuery(selectedUser.name);
    const conversationId = await startConversation(currentUser.id, selectedUser.id, projectId);
  
    if (conversationId) {
      setSelectedMessage(conversationId);
    } else {
      console.error("❌ Failed to start conversation");
    }
  };
  

  return (
    <div className="relative">
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-2"
      />

      {searchQuery && filteredUsers.length > 0 && (
        <UserList users={filteredUsers} onSelectUser={handleSelectUser} />
      )}
    </div>
  );
};

export default UserSearch;
