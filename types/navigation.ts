export type NavLink = {
  name: string;
  href: string;
};

export const roleToLinks: Record<string, NavLink[]> = {
  admin: [
    { name: "Overview", href: "/dashboard/admin/" },
    { name: "Users", href: "/dashboard/admin/users" },
    { name: "Projects", href: "/dashboard/admin/projects" },
    { name: "File Storage", href: "/dashboard/admin/file-storage" },
    { name: "Inbox", href: "/dashboard/admin/inbox" },
  ],
  "product-manager": [
    { name: "Overview", href: "/dashboard/product-manager" },
    { name: "Users", href: "/dashboard/product-manager/users" },
    { name: "Projects", href: "/dashboard/product-manager/projects" },
    { name: "File Storage", href: "/dashboard/product-manager/file-storage" },
    { name: "Inbox", href: "/dashboard/product-manager/inbox" },
  ],
  employee: [
    { name: "Overview", href: "/dashboard/employee" },
    { name: "Projects", href: "/dashboard/employee/projects" },
    { name: "File Storage", href: "/dashboard/employee/file-storage" },
    { name: "Inbox", href: "/dashboard/employee/inbox" },
  ],
};
