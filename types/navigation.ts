export type NavLink = {
  name: string;
  href: string;
};

export type Role = "admin" | "product-manager" | "employee";

export const roleToLinks: Record<Role, NavLink[]> = {
  admin: [
    { name: "Overview", href: "/dashboard/admin" },
    { name: "Users", href: "/dashboard/users" }, 
    { name: "Projects", href: "/dashboard/projects" }, 
  ],
  "product-manager": [
    { name: "Overview", href: "/dashboard/product-manager" },
    { name: "Users", href: "/dashboard/users" }, 
    { name: "Projects", href: "/dashboard/projects" }, 
  ],
  employee: [
    { name: "Overview", href: "/dashboard/employee" },
    { name: "Projects", href: "/dashboard/projects" }, 
  ],
};
