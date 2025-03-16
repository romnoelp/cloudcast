export type NavLink = {
  name: string;
  href: string;
};

export type Role = "admin" | "product-manager" | "employee";

export const roleToLinks: Record<Role, NavLink[]> = {
  admin: [
    { name: "Overview", href: "/dashboard/admin" },
    { name: "Users", href: "/dashboard/admin/users" },
    { name: "Projects", href: "/dashboard/admin/projects" },
  ],
  "product-manager": [
    { name: "Overview", href: "/dashboard/product-manager" },
    { name: "Users", href: "/dashboard/product-manager/users" },
    { name: "Projects", href: "/dashboard/product-manager/projects" },
  ],
  employee: [
    { name: "Overview", href: "/dashboard/employee" },
    { name: "Projects", href: "/dashboard/employee/projects" },
  ],
};
