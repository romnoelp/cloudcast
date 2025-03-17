"use client";

import { useState, useRef } from "react"; 
import { Check, ChevronsUpDown, PlusCircle, Copy } from "lucide-react"; 
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
import { useOrganization } from "@/context/organization-context";
import { createClient } from "@/lib/supabase/client";

const generateJoinCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

const TeamSwitcher: React.FC = () => {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false); 
  const { role, user } = useUser();
  const { selectedOrg, setSelectedOrg, organizations, setOrganizations } = useOrganization();
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [generatedJoinCode] = useState(generateJoinCode());
  const [loading, setLoading] = useState(false);
  const generatedJoinCodeRef = useRef<HTMLInputElement>(null); 

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    setLoading(true);

    try {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgName,
            description,
            created_by: user?.id,
            join_code: generatedJoinCode, 
          },
        ])
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      const { error: memberError } = await supabase
        .from("organization_members")
        .insert([
          {
            organization_id: orgData.id,
            user_id: user?.id,
            role: "admin",
            status: "approved",
          },
        ]);

      if (memberError) {
        throw memberError;
      }

      const { data: updatedOrganizations, error: fetchError } = await supabase
        .from("organization_members")
        .select("organizations!inner(id, name, description, created_by, join_code)") 
        .eq("user_id", user?.id);

      if (fetchError) {
        throw fetchError;
      }

      const extractedOrganizations = updatedOrganizations.flatMap(
        (entry) => entry.organizations
      );

      setOrganizations(extractedOrganizations);
      setSelectedOrg(orgData); 

      toast.success("Organization created successfully!");
      setShowDialog(false);
      setOrgName("");
      setDescription("");
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization.");
    }

    setLoading(false);
  };



  const handleJoinOrganization = async () => {
    if (!joinCode.trim()) {
      toast.error("Join code is required.");
      return;
    }

    setLoading(true);

    try {
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, description, created_by")
        .eq("join_code", joinCode)
        .single();

      if (orgError || !org) {
        toast.error("Invalid join code.");
        setLoading(false);
        return;
      }

      const { data: existingRequest, error: requestError } = await supabase
        .from("organization_members")
        .select("status")
        .eq("organization_id", org.id)
        .eq("user_id", user?.id)
        .single();

      if (existingRequest) {
        toast.warning(
          existingRequest.status === "approved"
            ? `You are already a member of ${org.name}.`
            : `You have already requested to join ${org.name}.`
        );
        setLoading(false);
        return;
      }

      if (requestError && requestError.code !== "PGRST116") {
        throw requestError;
      }

      const { error: memberError } = await supabase
        .from("organization_members")
        .insert([
          {
            organization_id: org.id,
            user_id: user?.id,
            role: "employee",
            status: "pending",
          },
        ]);

      if (memberError) {
        throw memberError;
      }

      toast.success(`Request to join ${org.name} sent!`);
      setShowDialog(false);
      setJoinCode("");
    } catch (error) {
      console.error("Error joining organization:", error);
      toast.error("Failed to join organization.");
    }

    setLoading(false);
  };

  const handleCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedJoinCode);
      toast.success("Join code copied to clipboard!");
    } catch {
      toast.error("Failed to copy join code.");
    }
  };



  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[200px] flex items-center justify-between px-3 py-2"
          >
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${selectedOrg?.id || "organization"}.png`}
                  alt="Organization Avatar"
                />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {selectedOrg?.name ? selectedOrg.name.charAt(0).toUpperCase() : "O"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {selectedOrg ? selectedOrg.name : "Select Organization"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto opacity-50 h-4 w-4" />
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
                      setIsJoining(role !== "admin");
                      setShowDialog(true);
                    }}
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isJoining ? "Join Organization" : "Create Organization"}
          </DialogTitle>
          <DialogDescription>
            {isJoining
              ? "Enter a valid join code to join an organization."
              : "Set up a new organization."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 pb-4">
          {isJoining ? (
            <>
              <Label htmlFor="join-code">Join Code</Label>
              <Input
                id="join-code"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </>
          ) : (
            <>
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
              <div className="flex items-center space-x-2">
                <Label htmlFor="generated-join-code">Generated Join Code</Label>
                <Input
                  id="generated-join-code"
                  value={generatedJoinCode}
                  readOnly
                  ref={generatedJoinCodeRef}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={handleCopyJoinCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={
              isJoining ? handleJoinOrganization : handleCreateOrganization
            }
            disabled={loading}
          >
            {loading ? "Processing..." : isJoining ? "Join" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamSwitcher;