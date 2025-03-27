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
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers([]);
      setNoResults(false);
      return;
    }

    const filtered = users
      .filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setFilteredUsers(filtered);
    setNoResults(filtered.length === 0);
  }, [searchQuery, users]);

  const handleSelectUser = async (selectedUser: User) => {
    if (!selectedUser || !currentUser) return;

    setSearchQuery(selectedUser.name);
    const conversationId = await startConversation(currentUser.id, selectedUser.id, projectId);

    if (conversationId) {
      setSelectedMessage(conversationId);
      setSearchQuery(""); // Clear search after selection
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

      {searchQuery && noResults && (
        <div className="text-muted-foreground text-center p-2">No users found</div>
      )}
    </div>
  );
};

export default UserSearch;
