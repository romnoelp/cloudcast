import type { User } from "./user";
import type { SupabaseSession, UserRole } from "./authentication";

export type UserContextType = {
  user: User | null;
  role: UserRole;
  session: SupabaseSession;
  loading: boolean;
};
