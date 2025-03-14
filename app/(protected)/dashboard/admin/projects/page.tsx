"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "@/context/organization-context";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import ProjectList from "@/components/projects/project-list";
import CreateProjectModal from "@/components/projects/create-project-modal";

const ProjectsPage = () => {
  const { selectedOrg } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const supabaseClient = createClient();

  useEffect(() => {
    if (!selectedOrg) {
      setLoading(false);
      return;
    }
    fetchProjects();
  }, [selectedOrg]);

  const fetchProjects = async () => {
    setLoading(true);
    if (!selectedOrg) {
      setLoading(false);
      return;
    }
    const response = await fetch(
      `/api/projects?organizationId=${selectedOrg.id}`
    );
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const data = await response.json();
    setProjects(data);
    setLoading(false);
  };

  const deleteProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return;
    }
    fetchProjects();
  };

  const archiveProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (!response.ok) {
      return;
    }
    fetchProjects();
  };

  const activateProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    if (!response.ok) {
      return;
    }
    fetchProjects();
  };

  const createProject = async (name: string, description: string) => {
    if (!selectedOrg) {
      return;
    }

    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      return;
    }

    if (!session || !session.user) {
      return;
    }

    const userId = session.user.id;
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        description: description,
        organization_id: selectedOrg.id,
        created_by: userId,
      }),
    });

    if (!response.ok) {
      console.error("Error creating project:", response.statusText);
      return;
    }

    setOpenModal(false);
    fetchProjects();
  };

  if (!selectedOrg) {
    return (
      <div className="flex justify-center items-center h-full">
        Please select an organization first.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  return (
    <div>
      <Button onClick={() => setOpenModal(true)}>Create Project</Button>
      {projects.length > 0 && (
        <ProjectList
          projects={projects}
          deleteProject={deleteProject}
          archiveProject={archiveProject}
          activateProject={activateProject}
        />
      )}
      <CreateProjectModal
        open={openModal}
        onOpenChange={setOpenModal}
        onCreate={createProject}
      />
    </div>
  );
};

export default ProjectsPage;
