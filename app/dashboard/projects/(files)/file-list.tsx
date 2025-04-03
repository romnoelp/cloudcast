import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FileList = () => {
  return (
    <div className="w-full h-[740px] overflow-auto">
      <Card className="h-full"> 
        <CardHeader>
          <CardTitle>Files</CardTitle> 
        </CardHeader>
        <CardContent className="overflow-auto"> 
          <div>File List Content</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileList;