export type NavLink = {
  name: string;
  href: string;
};

export type Role = "admin" | "product-manager" | "employee";

export const roleToLinks: Record<Role, NavLink[]> = {
  admin: [
    { name: "Overview", href: "/dashboard/admin" },
    { name: "Users", href: "/dashboard/users" }, // ✅ Moved out of /admin
    { name: "Projects", href: "/dashboard/projects" }, // ✅ Moved out of /admin
  ],
  "product-manager": [
    { name: "Overview", href: "/dashboard/product-manager" },
    { name: "Users", href: "/dashboard/users" }, // ✅ Same users path
    { name: "Projects", href: "/dashboard/projects" }, // ✅ Same projects path
  ],
  employee: [
    { name: "Overview", href: "/dashboard/employee" },
    { name: "Projects", href: "/dashboard/projects" }, // ✅ Same projects path
  ],
};
