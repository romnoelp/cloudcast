import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (file: File | null) => void;
}

export function FileUploadDialog({
  isOpen,
  onOpenChange,
  onFileSelect,
}: FileUploadDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a File</DialogTitle>
          <DialogDescription>Select a file to upload.</DialogDescription>
        </DialogHeader>

        <div className="grid w-full gap-2">
          <Label htmlFor="file">Choose a file</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.docx,.ppt,.pptx,image/*"
            className="w-full"
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileUploadDialog;
