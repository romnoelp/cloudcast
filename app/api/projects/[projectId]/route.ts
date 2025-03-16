// app/api/projects/[projectId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const supabase = await createClient();
  const { projectId } = params;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const supabase = await createClient();
  const { projectId } = params;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Project deleted successfully" },
    { status: 200 }
  );
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const supabase = await createClient();
  const { projectId } = params;
  const { status } = await req.json();

  if (!projectId || !status) {
    return NextResponse.json(
      { error: "Project ID and status are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Project status updated successfully" },
    { status: 200 }
  );
};