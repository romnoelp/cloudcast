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

  const fetchUser = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      toast.error("Error retrieving session. Please try again.");
    }

    setSession(session);

    if (!session?.user) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url") // Removed role from here
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      toast.error("Error fetching user data. Please try again.");
      setUser(null);
      setRole(null);
    } else {
      // Get role from cookie
      const roleCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userRole="))
        ?.split("=")[1];
      setUser({ ...data, role: (roleCookie as UserRole) || "No Role Defined" }); // Added role here
      setRole((roleCookie as UserRole) || "No Role Defined");
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, _session) => {
        setSession(_session);
        fetchUser();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, role, session, loading }}>
      {children}{" "}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);