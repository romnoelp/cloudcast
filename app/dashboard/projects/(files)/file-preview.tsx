'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';

interface FilePreviewProps {
  selectedFile: { file_name: string; file_path: string } | null;
}

const PdfViewerClient = dynamic(
  () => import('./pdf-viewer-client'),
  { ssr: false }
);

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
              {selectedFile.file_name.toLowerCase().endsWith('.pdf') && selectedFile.file_path ? (
                <PdfViewerClient selectedFile={selectedFile} />
              ) : (
                <p>Non-PDF file preview not supported or file path missing.</p>
              )}
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