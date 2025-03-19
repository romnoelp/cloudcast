export type InviteDialogProps = {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    users: {
        id: string;
        name: string;
        avatar: string;
    }[];
    projectId: string;
    orgId: string; // ✅ Add this line
    inviteUserToProject: (data: { userId: string; projectId: string; role: "employee" | "product-manager" }) => Promise<void>;
};
