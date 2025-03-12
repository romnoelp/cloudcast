"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, PlusCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUser } from "@/context/user-context";
import { useOrganization } from "@/context/organization-context";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/types/organization";

const generateJoinCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

const TeamSwitcher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const { user, role } = useUser();
  const { selectedOrg, setSelectedOrg, organizations } = useOrganization();
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState(generateJoinCode());
  const supabase = createClient();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied!");
  };

  return (
    <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn("w-[200px] justify-between")}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${selectedOrg?.id || "organization"}.png`}
                alt="Org"
              />
              <AvatarFallback>O</AvatarFallback>
            </Avatar>
            {selectedOrg ? selectedOrg.name : "Select Organization"}
            <ChevronsUpDown className="ml-auto opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search organizations..." />
            <CommandList>
              <CommandEmpty>No organizations found.</CommandEmpty>
              {organizations.length > 0 && (
                <CommandGroup heading="Organizations">
                  {organizations.map((org) => (
                    <CommandItem
                      key={org.id}
                      onSelect={() => {
                        setSelectedOrg(org);
                        setOpen(false);
                      }}
                      className="text-sm"
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${org.id}.png`}
                          alt={org.name}
                        />
                        <AvatarFallback>
                          {org.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {org.name}
                      {selectedOrg?.id === org.id && (
                        <Check className="ml-auto text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowOrgDialog(true);
                    }}
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    {role === "admin" ? "Create Organization" : "Join Organization"}
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>Set up a new organization.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            placeholder="Acme Inc."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Label htmlFor="org-desc">Description</Label>
          <Input
            id="org-desc"
            placeholder="Short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Label htmlFor="join-code">Join Code</Label>
          <div className="relative flex items-center">
            <Input id="join-code" value={joinCode} disabled className="pr-10" />
            <Button size="icon" variant="ghost" onClick={handleCopyCode}>
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowOrgDialog(false)}>
            Cancel
          </Button>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamSwitcher;