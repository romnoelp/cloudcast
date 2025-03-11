"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserContextType } from "@/types/user-context";
import type { User } from "@/types/user";
import type { SupabaseSession, UserRole } from "@/types/authentication";

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  session: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [session, setSession] = useState<SupabaseSession>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    setLoading(true);

    // 🔹 Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) console.error("Error getting session:", sessionError);

    setSession(session);

    if (!session?.user) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    // 🔹 Fetch user from `users` table
    const { data, error } = await supabase
      .from("users")
      .select("id, email, role, name, avatar_url")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setRole(null);
    } else {
      setUser(data);
      setRole(data.role ?? "No Role Defined");
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUser();

    // 🔹 Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, _session) => {
      setSession(_session);
      fetchUser(); // 🔄 Re-fetch user data when auth changes
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, role, session, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
