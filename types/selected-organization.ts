export type Organization = {
  id: string;
  name: string;
  description: string;
  created_by: string;
};

export type OrganizationContextType = {
  selectedOrg: Organization | null;
  setSelectedOrg: (org: Organization) => void;
  organizations: Organization[];
  loading: boolean;
};
