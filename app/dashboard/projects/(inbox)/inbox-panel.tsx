"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import ChatInput from "./chat-input";

const InboxPanel = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[700px] w-full rounded-lg border mt-4"
    >
      <ResizablePanel
        defaultSize={20}
        minSize={5}
        maxSize={15}
        onResize={(size) => setIsMinimized(size <= 6)}
      >
        <div className="flex h-full items-center justify-center p-4 transition-all">
          <span className="font-semibold">{isMinimized ? "S" : "Sidebar"}</span>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={80} minSize={70}>
        <div className="flex h-full flex-col">
          <span className="font-semibold mb-2 p-6">Messages</span>

          <ScrollArea className="flex-grow w-full rounded-md overflow-auto" />

          <div className="border-t bg-background p-2">
            <ChatInput />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default InboxPanel;
