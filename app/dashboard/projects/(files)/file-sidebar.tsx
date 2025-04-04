"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Star, Trash2 } from "lucide-react";
import FileDropdown from "./file-dropdown";

const FileSidebar = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col items-stretch">
        <FileDropdown
          onFileUploaded={(filePath) => {
            console.log("File uploaded:", filePath);
          }}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        
        <Button
          variant={activeButton === "Recent" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleButtonClick("Recent")}
        >
          <Clock className="mr-2 h-4 w-4" />
          Recent
        </Button>
        <Button
          variant={activeButton === "Starred" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleButtonClick("Starred")}
        >
          <Star className="mr-2 h-4 w-4" />
          Starred
        </Button>
        <Button
          variant={activeButton === "Trash" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleButtonClick("Trash")}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Trash
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileSidebar;