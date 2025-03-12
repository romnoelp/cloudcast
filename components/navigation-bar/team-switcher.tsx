"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, LogIn, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { createClient } from "@/lib/supabase/client";

type Organization = {
  id: string;
  name: string;
  description: string;
  join_code: string;
  created_by: string;
};

const generateJoinCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

const TeamSwitcher: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [showOrgDialog, setShowOrgDialog] = React.useState(false);
  const { user, role } = useUser();
  const [orgName, setOrgName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [joinCode, setJoinCode] = React.useState(generateJoinCode());
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState<Organization | null>(
    null
  );
  const [copySuccess, setCopySuccess] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    if (user) fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase.from("organizations").select("*");
    if (error) console.error("Error fetching organizations:", error);
    else setOrganizations(data || []);
  };

  const handleCreateOrganization = async () => {
    if (!orgName || !description) return;

    const { error } = await supabase
      .from("organizations")
      .insert([
        {
          name: orgName,
          description,
          join_code: joinCode,
          created_by: user?.id,
        },
      ]);

    if (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization.");
    } else {
      fetchOrganizations();
      setShowOrgDialog(false);
      toast.success(`${orgName} has been created successfully!`);
      setOrgName("");
      setDescription("");
      setJoinCode(generateJoinCode());
    }
  };

  const handleJoinOrganization = async () => {
    if (!joinCode) return;

    const { data: org, error } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("join_code", joinCode)
      .single();

    if (error || !org) {
      console.error("Invalid join code:", error);
      toast.error("Invalid join code. Please try again.");
      return;
    }

    const { error: joinError } = await supabase
      .from("organization_members")
      .insert([
        { organization_id: org.id, user_id: user?.id, role: "employee" },
      ]);

    if (joinError) {
      console.error("Error joining organization:", joinError);
      toast.error("Failed to join organization.");
    } else {
      fetchOrganizations();
      setShowOrgDialog(false);
      toast.success(`You have joined ${org.name}!`);
      setJoinCode("");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[200px] justify-between")}>
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/organization.png`}
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

              {/* Organization List Matches Teams List */}
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

            {/* Separator before Create Organization */}
            <CommandSeparator />

            {/* Create Organization Styled to Match Reference */}
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowOrgDialog(true);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    {role === "admin"
                      ? "Create Organization"
                      : "Join Organization"}
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog for Creating or Joining Organization */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Set up a new organization with a unique join code.
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="space-y-4 py-2 pb-4">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Acme Inc."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            {/* Organization Description */}
            <div className="space-y-2">
              <Label htmlFor="org-desc">Description</Label>
              <Input
                id="org-desc"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Copyable Join Code */}
            <div className="space-y-2">
              <Label htmlFor="join-code">Join Code</Label>
              <div className="relative flex items-center">
                <Input
                  id="join-code"
                  value={joinCode}
                  disabled
                  className="pr-10 cursor-not-allowed"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              {copySuccess && (
                <p className="text-green-500 text-sm mt-1">Copied!</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowOrgDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateOrganization}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamSwitcher;
