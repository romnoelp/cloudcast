import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilePreviewProps {
  selectedFile: { file_name: string } | null;
}

const FilePreview: React.FC<FilePreviewProps> = ({ selectedFile }) => {
  return (
    <div className="w-full h-[740px] overflow-auto">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          {selectedFile ? (
            <div>
              <h3 className="text-lg font-semibold">{selectedFile.file_name}</h3>
            </div>
          ) : (
            <div>Select a file to preview</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilePreview;
