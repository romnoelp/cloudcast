import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FilePreview = () => {
  return (
    <div className="w-full h-[740px] overflow-auto">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div>File Preview Content</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilePreview;