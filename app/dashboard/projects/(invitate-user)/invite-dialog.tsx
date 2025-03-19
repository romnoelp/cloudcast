"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InviteDialogProps } from "./invite-type"; // ✅ Import types

const ROLES = ["employee", "product-manager"] as const;

const InviteDialog: React.FC<InviteDialogProps> = ({
    isDialogOpen,
    setIsDialogOpen,
    users,
    projectId,
    inviteUserToProject,
}) => {
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedRole, setSelectedRole] = useState<"employee" | "product-manager">("employee");

    const handleInvite = async () => {
        if (!selectedUser) return toast.error("Please select a user!");
        if (!selectedRole) return toast.error("Please select a role!");

        try {
            await inviteUserToProject({ userId: selectedUser, projectId, role: selectedRole });
            toast.success("User invited successfully!");
            setIsDialogOpen(false);
            setSelectedUser("");
            setSelectedRole("employee");
        } catch (error) {
            console.error("Error inviting user:", error);
            toast.error("Failed to invite user.");
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Users to Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* User Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="user" className="text-right">User</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as typeof ROLES[number])}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={!selectedUser || !selectedRole}>Send Invite</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InviteDialog;
