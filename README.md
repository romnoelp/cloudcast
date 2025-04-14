
# CloudCast

CloudCast, a platform that combines the best of Discord, Jira, and Google Drive into a powerful knowledge management and collaboration tool designed for professional and software development environments. Built with organization in mind, it offers seamless project creation, structured task management, team messaging, and role-based separation of concerns—all within an intuitive, project-focused workspace. Stay aligned, assign tasks, share knowledge, and communicate effortlessly, everything your team needs, all in one place.


## Tech Stack 
- Front and Backend : Next JS 
- Database and Authentication : Supabase 
- AI/LLM Integration : Ollama + qwen0.5b


## Roadmap

### Google OAuth JWT-Based Authentication 

This section of code demonstrates how to implement Google Sign-in functionality using Supabase Auth in a JavaScript application.

```javascript
const signInWithGoogle = async () => {
  setIsLoading(true);
  setSignInError(null);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    toast.error("There was an error logging in with Google.");
    setSignInError(error?.message || "An unexpected error occurred.");
  } finally {
    setIsLoading(false);
  }
};
```

### Role-Based Redirection and Cookie Setting

This code snippet demonstrates how to redirect a user to a specific dashboard based on their role and how to set a cookie containing the user's role.

```javascript
const roleToDashboard = {
  admin: "/dashboard/admin",
  "product-manager": "/dashboard/product-manager",
  employee: "/dashboard/employee",
};

const response = NextResponse.redirect(new URL(roleToDashboard[role], request.nextUrl));
response.cookies.set("userRole", role, { httpOnly: true, secure: true });
```

### Organization Actions 
#### Creation 
This code snippet demonstrates how to create a new organization and immediately assign the user who created it as the administrator within a Supabase database.

```javascript
await supabase.from("organizations").insert([{ name: orgName, join_code: generatedJoinCode }]);
await supabase.from("organization_members").insert([{ organization_id: orgId, user_id: userId, role: "admin" }]);
```

#### Joining 

This code snippet demonstrates how a user can attempt to join an existing organization using a provided join code. It first retrieves the organization based on the join code and then creates a new entry in the `organization_members` table with the user's ID, the organization's ID, and a default "pending" status with an "employee" role.

```javascript
const { data: org } = await supabase.from("organizations").select().eq("join_code", joinCode).single();
await supabase.from("organization_members").insert([{ organization_id: org.id, user_id: userId, role: "employee", status: "pending" }]);
```

#### Fetching User Data and Handling User Acceptance

This section of code demonstrates how to fetch user data for a selected organization and how to handle the acceptance of a user into that organization.

```javascript
const fetchUserData = useCallback(async () => {
  if (!selectedOrg) return;
  setLoading(true);
  const data = await fetchUsers(selectedOrg.id);
  setUsers(data || []);
  setLoading(false);
}, [selectedOrg]);

const handleAcceptUser = async (userId: string, userName: string) => {
  try {
    await acceptUser(userId, selectedOrg?.id as string);
    toast.success(`${userName} accepted successfully!`);
    fetchUserData();
  } catch (error) {
    console.error("Error accepting user:", error);
    toast.error(`Failed to accept ${userName}.`);
  }
};
```

### Project Actions 
#### Fetching data

This section of code demonstrates how to fetch project data for a selected organization, handle the opening of a specific project to view its details, and manage the archiving/unarchiving (status change) of projects.

```javascript
const fetchProjectsData = useCallback(async () => {
  if (!selectedOrg) return;
  setLoading(true);
  try {
    const fetchedProjects = await fetchProjects(selectedOrg.id);
    const filteredProjects = role === "admin"
      ? fetchedProjects
      : fetchedProjects.filter((project) => project.status !== "archived");

    setProjects(filteredProjects);
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Failed to fetch projects.");
  } finally {
    setLoading(false);
  }
}, [selectedOrg, role]);

useEffect(() => {
  fetchProjectsData();
}, [fetchProjectsData, role]);
```


#### Opening
```javascript
const handleOpenProject = async (projectId: string) => {
  try {
    const projectDetails = await fetchProjectDetails(projectId);
    if (!projectDetails) {
      toast.error("Project not found.");
      return;
    }
    // Set project details (e.g., in context or state)
  } catch {
    toast.error("Failed to load project details.");
  }
};
```

#### Status change
```javascript
const handleStatusChange = async (projectId: string, isArchived: boolean) => {
  if (!selectedOrg || role !== "admin") return;
  try {
    const newStatus = isArchived ? "active" : "archived";
    await updateProjectStatus(projectId, newStatus, selectedOrg.id);
    fetchProjectsData();
    toast.success(`Project ${isArchived ? "activated" : "archived"} successfully!`);
  } catch (error) {
    toast.error(`Failed to ${isArchived ? "activate" : "archive"} project.`);
  }
};
```

### Project Details

#### Fetching Detailed Project Data, Tasks, and Users
This section of code demonstrates how to asynchronously fetch detailed information for a specific project, along with its associated tasks and users.

```javascript
const getProjectData = async () => {
  setLoading(true);

  const projectData = await fetchProjectDetails(projectId);
  if (!projectData) {
    toast.error("Project not found.");
    setLoading(false);
    return;
  }

  setProject(projectData);

  const taskData = await fetchTasksForProject(projectId);
  setTasks(taskData || []);

  const userData = await fetchUsersInProject(projectId);
  setUsers(userData || []);

  setLoading(false);
};

useEffect(() => {
  getProjectData();
}, [projectId]);
```

#### Fetching Initial Conversations and Subscribing to Real-time Updates

This section of code demonstrates how to fetch the initial list of conversations for a logged-in user and how to set up a real-time subscription using Supabase to listen for new messages, updating the conversation list dynamically.

```javascript
useEffect(() => {
  if (!user) return;

  // Fetch initial conversations
  const loadConversations = async () => {
    try {
      const fetchedConversations = await fetchConversations(user.id);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  loadConversations();
}, [user]);

useEffect(() => {
  if (!user) return;

  // Subscribe to new message and conversation member updates
  const subscription = supabase
    .channel("conversation_updates")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async () => {
      const updatedConversations = await fetchConversations(user.id);
      setConversations(updatedConversations);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
}, [user, supabase]);
```

#### Fetching and Subscribing to Messages for a Selected Conversation with Auto-Scroll

This section of code demonstrates how to fetch initial messages for a selected conversation, subscribe to real-time updates for new messages within that specific conversation, and automatically scroll to the latest message when new messages arrive.

```javascript
useEffect(() => {
  if (!selectedMessage) return;

  const loadMessages = async () => {
    const data = await fetchMessages(selectedMessage);
    setMessages(data);
  };
  loadMessages();
}, [selectedMessage]);

useEffect(() => {
  if (!selectedMessage) return;

  // Subscribe to new messages for the selected conversation
  const channel = supabase.channel(`conversation-${selectedMessage}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedMessage}`
    }, (payload) => {
      if (payload.new) {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [selectedMessage, supabase]);

useEffect(() => {
  // Auto-scroll to the latest message when messages change
  if (scrollRef.current) {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);
```

### Tasks
#### Handling Task Creation

This code snippet demonstrates how to handle the creation of a new task, including input validation, API call, UI updates, and error handling.

```javascript
const handleCreateTask = async () => {
  if (!taskTitle || !taskDescription || !assignee) return toast.error("All fields are required!");
  setLoading(true);
  try {
    await createTask({
      title: taskTitle,
      description: taskDescription,
      assignee_id: assignee,
      project_id: projectId,
      created_by: user.id,
    });
    await fetchTasksData();
    setIsDialogOpen(false);
    toast.success("Task created!");
  } catch (error) {
    toast.error("Task creation failed.");
  } finally {
    setLoading(false);
  }
};
```

### Files
#### Fetching, Real-time Updates, Deletion, and Download of Project Files

This section of code demonstrates how to fetch initial files for a project, subscribe to real-time updates for new files, handle file deletion, and provide functionality for downloading files. It also includes a debounced function for file selection.

```javascript
// Fetch initial files
useEffect(() => {
  if (project?.id) {
    const fetchFilesData = async () => {
      const filesData = await fetchFiles(project.id);
      setFiles(filesData);
    };
    fetchFilesData();
  }
}, [project?.id]);

// Realtime updates for new files
useEffect(() => {
  if (!project?.id) return;
  const channel = supabase.channel(`project_files:${project.id}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "files", filter: `project_id=eq.${project.id}` },
      (payload) => {
        const newFile = payload.new as File;
        setFiles((prevFiles) => [newFile, ...prevFiles]);
      })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [supabase, project?.id]);

// Handle file deletion
const handleDelete = async (fileId: string, filePath: string) => {
  try {
    await deleteFile(fileId, filePath);
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    toast.success("File deleted successfully.");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Unknown error occurred.");
  }
};

// Handle file download
const handleDownload = (filePath: string) => {
  const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${filePath}`;
  window.open(downloadUrl, "_blank");
};

// Debounced file selection
const debouncedSelectFile = debounce((file: File) => {
  setSelectedFile({ file_name: file.file_name, file_path: file.file_path });
}, 600);
```


## Features
- ### Embedding Jitsi Meet with JWT Authentication

This React component, `JitsiMeet`, demonstrates how to embed a Jitsi Meet video conferencing instance within the application and pass a JWT (JSON Web Token) for authentication.

```javascript
const JitsiMeet = ({ roomName }: JitsiMeetProps) => {
  const { session } = useUser();
  const [jwtToken, setJwtToken] = useState("");

  // Set JWT token once the session is available
  useEffect(() => {
    if (session) {
      setJwtToken(session.access_token);
    }
  }, [session]);

  // Display loading if JWT token is not set
  if (!jwtToken) {
    return <div>Loading...</div>;
  }

  // Return the iframe with the JWT token
  return (
    <iframe
      src={`https://meet.jit.si/${roomName}?jwt=${jwtToken}`} // Pass JWT token in URL
      style={{ width: "100%", height: "600px", border: "0px", borderRadius: "8px" }}
      allow="camera; microphone; fullscreen; display-capture"
      title="Jitsi Video Call"
    />
  );
};
```

- ### Dark/Light Mode Switch Component

This code snippet demonstrates a React component using a `Switch` component to toggle between dark and light themes.

```javascript
<Switch
  checked={isDark}
  onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
  className="bg-[var(--muted)] border-[var(--border)]"
  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
/>
``` 

- ### Express Server (with Axios)
This snippet shows the endpoint at where a server being run in my computer locally is receiving the payload from the frontend, and that being sent to ollama through `ngrok`
```js
app.post('/api/process-pdf', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided in the request body.' });
  }

  const ollamaApiUrl = `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`;
  const ollamaPayload = {
    prompt: `Summarize the following text concisely in one or two short sentences:\n\n${text}`,
    model: 'qwen:0.5b',
    stream: false,
  };

  try {
    const response = await axios.post(ollamaApiUrl, ollamaPayload);
    res.json({ result: response.data.response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to communicate with Ollama.' });
  }
});
```  
