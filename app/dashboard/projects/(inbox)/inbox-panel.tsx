"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import { useProject } from "@/context/project-context"; 
import Sidebar from "./sidebar";
import MessageView from "./message-view"; 


const InboxPanel = () => {
  const { project } = useProject();
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[700px] w-full rounded-lg border mt-4"
    >
      <ResizablePanel
        defaultSize={24}
        minSize={4}
        maxSize={24}
        onResize={(size) => setIsMinimized(size <= 6)}
      >
        <Sidebar
          isMinimized={isMinimized}
          setSelectedMessage={setSelectedMessage}
          selectedMessage={selectedMessage}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={80} minSize={70}>
      <MessageView 
  selectedMessage={selectedMessage} 
  setSelectedMessage={setSelectedMessage} 
  projectId={project?.id ?? ""} 
/>

      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default InboxPanel;
