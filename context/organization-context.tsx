"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Organization,
  OrganizationContextType,
} from "@/types/selected-organization";
import { useUser } from "@/context/user-context";

const OrganizationContext = createContext<OrganizationContextType>({
  selectedOrg: null,
  setSelectedOrg: () => { },
  organizations: [],
  setOrganizations: () => { }, 
  loading: false,
});

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClient();
  const { user, loading: userLoading } = useUser();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userLoading || !user || hasFetched.current) return;
    hasFetched.current = true;

    const fetchOrganizations = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("organization_members")
          .select("organizations!inner(id, name, description, created_by)")
          .eq("user_id", user.id);

        if (supabaseError) {
          console.error("Error fetching organizations:", supabaseError);
          setError(supabaseError);
          setOrganizations([]);
          return;
        }

        if (!data) {
          setOrganizations([]);
          return;
        }

        const extractedOrganizations: Organization[] = data.flatMap(
          (entry) => entry.organizations
        );
        setOrganizations(extractedOrganizations);
      } catch (err) {
        const e = err as Error;
        console.error("Unexpected error fetching organizations:", e);
        setError(e);
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user, userLoading, supabase]);

  useEffect(() => {
    const storedOrg = localStorage.getItem("selectedOrg");
    if (!storedOrg) return;

    try {
      setSelectedOrg(JSON.parse(storedOrg));
    } catch (e) {
      console.error("Error parsing selectedOrg from localStorage:", e);
      localStorage.removeItem("selectedOrg");
    }
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      localStorage.setItem("selectedOrg", JSON.stringify(selectedOrg));
    } else {
      localStorage.removeItem("selectedOrg");
    }
  }, [selectedOrg]);

  const contextValue: OrganizationContextType = {
    selectedOrg,
    setSelectedOrg,
    organizations,
    setOrganizations, 
    loading,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          Error fetching organizations: {error.message}
        </div>
      )}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
