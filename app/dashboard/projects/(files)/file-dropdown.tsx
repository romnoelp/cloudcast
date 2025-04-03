import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FileDropdown = () => {
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const handleNewButtonClick = () => {
    setIsNewDropdownOpen(!isNewDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newButtonRef.current && !newButtonRef.current.contains(event.target as Node)) {
        setIsNewDropdownOpen(false);
      }
    };
    if (isNewDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNewDropdownOpen]);

  return (
    <DropdownMenu open={isNewDropdownOpen} onOpenChange={setIsNewDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={newButtonRef}
          className="w-full justify-start p-6 text-base"
          onClick={handleNewButtonClick}
        >
          <Plus className="mr-2 h-5 w-5" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>New Folder</DropdownMenuItem>
        <DropdownMenuItem>File Upload</DropdownMenuItem>
        <DropdownMenuItem>Folder Upload</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileDropdown;