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
