"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const projects = [
  { id: "1", name: "Project Alpha", description: "AI Chatbot Development" },
  { id: "2", name: "Project Beta", description: "Cloud Automation System" },
  { id: "3", name: "Project Gamma", description: "Collaborative Whiteboard" },
  { id: "4", name: "Project Delta", description: "Blockchain Security" },
];

const ProjectsPage = () => {
  return (
    <div className="flex flex-col p-8 pt-6 space-y-4 h-full">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Project List</h2>
      </div>

      {/* Carousel & Info Card Container */}
      <div className="flex flex-row space-x-4 flex-1">
        {/* Left Panel - Carousel (Single-Card View) */}
        <Carousel className="w-1/2 h-full">
          <CarouselContent className="flex">
            {projects.map((project) => (
              <CarouselItem key={project.id} className="basis-full flex justify-center items-center">
                <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full h-60">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2" />
        </Carousel>

        {/* Right Panel - Project Details */}
        <Card className="flex-1">
          <CardContent className="p-4">
            Info for the selected project will be displayed here.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsPage;
