// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { Organization, OrganizationContextType } from "@/types/selected-organization";

// const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const supabase = createClient();
//   const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
//   const [organizations, setOrganizations] = useState<Organization[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrganizations = async () => {
//       const { data, error } = await supabase.from("organizations").select("*");
//       if (error) console.error("Error fetching organizations:", error);
//       else setOrganizations(data || []);

//       setLoading(false);
//     };

//     fetchOrganizations();
//   }, []);

//   return (
//     <OrganizationContext.Provider value={{ selectedOrg, setSelectedOrg, organizations, loading }}>
//       {children}
//     </OrganizationContext.Provider>
//   );
// };

// export const useOrganization = (): OrganizationContextType => {
//   const context = useContext(OrganizationContext);
//   if (!context) {
//     throw new Error("useOrganization must be used within an OrganizationProvider");
//   }
//   return context;
// };

"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Organization, OrganizationContextType } from "@/types/selected-organization";
import { useUser } from "@/context/user-context"; 

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();
  const { user, loading: userLoading } = useUser(); 
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false); // Prevent multiple fetch calls

  useEffect(() => {
    if (userLoading || !user || hasFetched.current) return;
    hasFetched.current = true; 

    const fetchOrganizations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("organization_members")
        .select("organizations!inner(id, name, description, created_by)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching organizations:", error);
        setOrganizations([]);
      } else {
        // ✅ FIX: Ensure proper extraction and flattening of organizations
        const extractedOrganizations: Organization[] = data
          .map((entry) => entry.organizations) // Get organizations field
          .flat(); // ✅ Removes any nested array structure

        setOrganizations(extractedOrganizations);
      }

      setLoading(false);
    };

    fetchOrganizations();
  }, [user, userLoading]);

  return (
    <OrganizationContext.Provider value={{ selectedOrg, setSelectedOrg, organizations, loading }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};
