"use client";

import Image from "next/image";
import { User } from "@/types/user";

type UserListProps = {
  users: User[];
  onSelectUser: (user: User) => void;
};

const UserList = ({ users, onSelectUser }: UserListProps) => {
  return (
    <div className="absolute left-0 w-full mt-1 bg-background border rounded-md shadow-md z-50">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent/30 rounded-md transition"
          onClick={() => onSelectUser(user)}
        >
          <Image
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
