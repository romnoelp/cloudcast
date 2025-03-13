"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserContextType } from "@/types/user-context";
import type { User } from "@/types/user";
import type { SupabaseSession, UserRole } from "@/types/authentication";
import { toast } from "sonner";

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

  const fetchUser = useCallback(
    async (session: SupabaseSession | null) => {
      setLoading(true);

      if (!session?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        toast.error("Error fetching user data. Please try again.");
        setUser(null);
        setRole(null);
      } else {
        try {
          const response = await fetch("/api/get-user-role");
          if (!response.ok) {
            throw new Error("Error fetching user role");
          }
          const { role: fetchedRole } = await response.json();
          setUser({ ...data, role: fetchedRole });
          setRole(fetchedRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole("No Role Defined");
          setUser({ ...data, role: "No Role Defined" });
        }
      }

      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUser(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        setSession(_session);
        fetchUser(_session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchUser]);

  return (
    <UserContext.Provider value={{ user, role, session, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);