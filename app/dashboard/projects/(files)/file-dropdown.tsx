import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadFile } from "./actions";
import { useProject } from "@/context/project-context";
import { toast } from "sonner";

type FileDropdownProps = {
  onFileUploaded: (filePath: string) => void;
};

const FileDropdown: React.FC<FileDropdownProps> = ({ onFileUploaded }) => {
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const { project } = useProject();

  const handleNewButtonClick = () => {
    setIsNewDropdownOpen(!isNewDropdownOpen);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.ms-powerpoint", // PPT
      "image/jpeg",
      "image/png",
      "video/mp4",
      "audio/mpeg",
      "application/vnd.ms-excel", // XLS
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed types: PDF, DOCX, PPT, JPEG, PNG, MP4, MP3, XLS, XLSX.");
      return;
    }

    try {
      if (!project?.id) {
        throw new Error("Project ID is not available.");
      }
      console.log("Project ID being passed to uploadFile:", project.id);
      const filePath = await uploadFile(file, project.id);

      onFileUploaded(filePath);
      toast.success("File uploaded successfully.");
    } catch (error: unknown) {
      let errorMessage = "Upload failed.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }

    event.target.value = "";
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
    <>
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
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            File Upload
          </DropdownMenuItem>
        </DropdownMenuContent>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />
      </DropdownMenu>
    </>
  );
};

export default FileDropdown;
