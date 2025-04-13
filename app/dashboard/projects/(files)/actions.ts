"use server";

import { createClient } from "@/lib/supabase/server";

export const uploadFile = async (file: File, projectId: string) => {
  const supabase = await createClient();
  if (!file) throw new Error("No file provided.");

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "image/jpeg",
    "image/png",
    "video/mp4",
    "audio/mpeg",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Allowed types: PDF, DOCX, PPT, JPEG, PNG, MP4, MP3, XLS, XLSX."
    );
  }

  const filePath = `uploads/${projectId}/${file.name}`;

  const { data: storageData, error: storageError } = await supabase.storage
    .from("project-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (storageError) {
    console.error("Storage upload error:", storageError);
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase.from("files").insert([
    {
      project_id: projectId,
      file_path: storageData.path,
      file_name: file.name,
      file_size: file.size,
    },
  ]);

  if (dbError) {
    console.error("Database insert error:", dbError);
    await supabase.storage.from("project-files").remove([filePath]);
    throw new Error(dbError.message);
  }

  return storageData.path;
};

export async function fetchFiles(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("files")
    .select("id, project_id, file_path, file_name, file_size, upload_time")
    .eq("project_id", projectId)
    .order("upload_time", { ascending: false });

  if (error) {
    console.error("Error fetching files:", error);
    return [];
  }

  return data;
}

export async function deleteFile(fileId: string, filePath: string) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("project-files")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (dbError) {
    console.error("Database delete error:", dbError);
    throw new Error(dbError.message);
  }
}

export async function sendPdfTextToAI(extractedText: string) {
  const aiServerUrl = process.env.NEXT_PUBLIC_AI_SERVER_URL;

  if (!aiServerUrl) {
    console.error("❌ AI server URL is not defined in environment variables.");
    return { success: false, error: "AI server URL is not configured." };
  }

  if (!extractedText) {
    return { success: false, error: "No text provided to send." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 

    const response = await fetch(aiServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", 
      },
      body: JSON.stringify({ text: extractedText }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        "❌ Failed to send text to AI server:",
        response.status,
        response.statusText
      );
      let errorMessage = `Failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage += `: ${errorData.error}`;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    console.log("✅ Text sent to AI server successfully:", data);
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. The AI processing might be taking longer than expected.' };
    }
    console.error('❌ Error sending text to AI server:', error);
    return { success: false, error: 'Network error while sending text' };
  }
}
