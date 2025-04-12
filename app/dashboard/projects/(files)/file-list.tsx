import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchFiles, deleteFile } from "./actions";
import { useProject } from "@/context/project-context";
import { createClient } from "@/lib/supabase/client";
import { formatFileSize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { debounce } from "lodash";

interface File {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  upload_time: string;
}

interface FileListProps {
  setSelectedFile: React.Dispatch<React.SetStateAction<{ file_name: string; file_path: string } | null>>; // Corrected type
}

const FileList: React.FC<FileListProps> = ({ setSelectedFile }) => {
  const [files, setFiles] = useState<File[]>([]);
  const { project } = useProject();
  const supabase = createClient();

  useEffect(() => {
    const loadInitialFiles = async () => {
      if (project?.id) {
        const initialFiles = await fetchFiles(project.id);
        setFiles(initialFiles);
      }
    };

    loadInitialFiles();
  }, [project?.id]);

  useEffect(() => {
    if (!project?.id) return;

    const channel = supabase
      .channel(`project_files:${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "files",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          const newFile = payload.new as File;
          setFiles((prevFiles) => [newFile, ...prevFiles]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, project?.id]);

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      await deleteFile(fileId, filePath);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      toast.success("File deleted successfully.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error deleting file: ${error.message}`);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  const handleDownload = (filePath: string) => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${filePath}`;
    window.open(downloadUrl, "_blank");
  };

  const debouncedSelectFile = debounce((file: File) => {
    setSelectedFile({ file_name: file.file_name, file_path: file.file_path }); // Ensure file_path is included
  }, 600);

  return (
    <div className="w-full h-full overflow-hidden">
      <Card className="h-full">
        <CardContent className="h-full">
          <ScrollArea className="h-full w-full">
            <div className="grid grid-cols-2 gap-4">
              {files.length > 0 ? (
                files.map((file) => (
                  <div key={file.id} className="w-full">
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <Card
                          className="w-full hover:bg-secondary cursor-pointer"
                          onClick={() => debouncedSelectFile(file)}
                          onDoubleClick={() => {
                            handleDownload(file.file_path);
                          }}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {file.file_name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Size: {formatFileSize(file.file_size)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Uploaded: {new Date(file.upload_time).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge>FILE</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => handleDownload(file.file_path)}>
                          Open
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleDelete(file.id, file.file_path)}>
                          Delete
                        </ContextMenuItem>
                        <ContextMenuItem>Add to Favorites</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>
                ))
              ) : (
                <div className="col-span-2">No files uploaded yet.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileList;