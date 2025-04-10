"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/user-context"; 
import { useOrganization } from "@/context/organization-context"; 
import { fetchTasksForEmployee, Task } from "./actions";
import { DataTable } from "./data-table";

const Employee = () => {
  const { user, loading } = useUser(); 
  const { selectedOrg } = useOrganization(); 
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    console.log("User:", user); 
    console.log("Selected Org:", selectedOrg); 

    if (user && selectedOrg) {
      fetchTasksForEmployee(selectedOrg.id, user.id) 
        .then((tasksData) => {
          console.log("Fetched tasks:", tasksData);
          setTasks(tasksData);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }
  }, [user, selectedOrg]); 

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("Number of tasks:", tasks.length); 

  return (
    <div>
      <h2 className="text-2xl font-bold">Tasks in the Organization</h2>
      <DataTable data={tasks} /> 
    </div>
  );
};

export default Employee;
