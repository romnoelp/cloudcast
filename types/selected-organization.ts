"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Organization, OrganizationContextType } from "@/types/selected-organization";
import { useUser } from "@/context/user-context";

// 1. Provide a default value (even if it's an empty state)
const OrganizationContext = createContext<OrganizationContextType>({
    selectedOrg: null,
    setSelectedOrg: () => {}, // Empty function as placeholder
    organizations:,
    loading: false,
});

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const supabase = createClient();
    const { user, loading: userLoading } = useUser();
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    // 2. Initialize organizations as an empty array
    const [organizations, setOrganizations] = useState<Organization>();
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false); // Prevent multiple fetch calls
    const [error, setError] = useState<Error | null>(null); // State for errors

    useEffect(() => {
        if (userLoading || !user || hasFetched.current) return;
        hasFetched.current = true;

        const fetchOrganizations = async () => {
            setLoading(true);
            setError(null); // Clear any previous errors

            try {
                const { data, error: supabaseError } = await supabase
                    .from("organization_members")
                    .select("organizations!inner(id, name, description, created_by)");

                if (supabaseError) {
                    console.error("Error fetching organizations:", supabaseError);
                    setError(supabaseError); // Set the error state
                    setOrganizations(); // Ensure it's an empty array on error
                } else {
                    if (data) {
                        // 3. Correctly extract and flatten the organizations
                        const extractedOrganizations: Organization= data.flatMap(
                            (entry) => entry.organizations
                        );
                        setOrganizations(extractedOrganizations);
                    } else {
                        setOrganizations(); // Ensure it's an empty array if data is null
                    }
                }
            } catch (err) {
                const e = err as Error;
                console.error("Unexpected error fetching organizations:", e);
                setError(e); // Set the error state
                setOrganizations(); // Ensure it's an empty array on exception
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, [user, userLoading]);

    // Load and Save selectedOrg to localStorage
    useEffect(() => {
        const storedOrg = localStorage.getItem("selectedOrg");
        if (storedOrg) {
            try {
                setSelectedOrg(JSON.parse(storedOrg));
            } catch (e) {
                console.error("Error parsing selectedOrg from localStorage:", e);
                localStorage.removeItem("selectedOrg"); // Consider removing invalid data
            }
        }
    },);

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
        loading,
    };

    return (
        <OrganizationContext.Provider value={contextValue}>
            {children}
            {/* Render error message if there is an error */}
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

export type Organization = {
    id: string;
    name: string;
    description: string;
    created_by: string;
};

export type OrganizationContextType = {
    selectedOrg: Organization | null;
    setSelectedOrg: (org: Organization) => void;
    organizations: Organization;
    loading: boolean;
};