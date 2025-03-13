import type { User } from "./user";
import type { SupabaseSession, UserRole } from "./authentication";

export type UserContextType = {
  user: User | null;
  role: UserRole | null; 
  session: SupabaseSession | null; 
  loading: boolean;
};