import { supabase } from "./supabase";

export type KiralProject = {
  id: string;
  code: string | null;
  name: string;
  category: string;
  location: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type KiralDocument = {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  type: "PDF" | "DOC" | "DOCX";
  size: string;
  date: string;
  storage_path: string;
};

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, index);

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function formatDocument(document: {
  id: string;
  project_id: string;
  name: string;
  type: string;
  size: number | null;
  created_at: string;
  storage_path: string;
  projects?: { name: string }[] | null;
}): KiralDocument {
  return {
    id: document.id,
    project_id: document.project_id,
    project_name: document.projects?.[0]?.name ?? "Proyek",
    name: document.name,
    type: document.type as "PDF" | "DOC" | "DOCX",
    size: formatFileSize(document.size ?? 0),
    date: document.created_at,
    storage_path: document.storage_path,
  };
}

export async function getKiralProjects(): Promise<KiralProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, code, name, category, location, status, description, created_at, updated_at"
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil proyek: ${error.message}`);
  }

  return data ?? [];
}

export async function createKiralProject(data: {
  name: string;
  category: string;
  location?: string;
  status?: string;
  description?: string;
}): Promise<KiralProject> {
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: data.name,
      category: data.category,
      location: data.location ?? "Lombok Tengah, NTB",
      status: data.status ?? "Berjalan",
      description: data.description ?? "",
    })
    .select(
      "id, code, name, category, location, status, description, created_at, updated_at"
    )
    .single();

  if (error) {
    throw new Error(`Gagal membuat proyek: ${error.message}`);
  }

  return project;
}


export async function deleteKiralProject(projectId: string): Promise<void> {
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("project_id", projectId);

  if (documentsError) {
    throw new Error(
      `Gagal mengambil dokumen proyek: ${documentsError.message}`
    );
  }

  const storagePaths = (documents ?? [])
    .map((document) => document.storage_path)
    .filter(Boolean);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("project-documents")
      .remove(storagePaths);

    if (storageError) {
      throw new Error(
        `Gagal menghapus file proyek: ${storageError.message}`
      );
    }
  }

  const { error: projectError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (projectError) {
    throw new Error(
      `Gagal menghapus proyek: ${projectError.message}`
    );
  }
}

export async function getKiralDocuments(): Promise<KiralDocument[]> {
  const { data, error } = await supabase
    .from("documents")
    .select(`
      id,
      project_id,
      name,
      type,
      size,
      storage_path,
      created_at,
      projects (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil dokumen: ${error.message}`);
  }

  return (data ?? []).map((document) =>
    formatDocument(
      document as {
        id: string;
        project_id: string;
        name: string;
        type: string;
        size: number | null;
        created_at: string;
        storage_path: string;
        projects?: { name: string }[] | null;
      }
    )
  );
}

export async function uploadKiralDocument(
  projectId: string,
  file: File
): Promise<KiralDocument> {
  const extension = file.name.split(".").pop()?.toUpperCase();

  if (!["PDF", "DOC", "DOCX"].includes(extension ?? "")) {
    throw new Error("Format yang diperbolehkan hanya PDF, DOC dan DOCX.");
  }

  const safeName = file.name
    .normalize("NFKD")
    .replace(/[^\w.\- ]/g, "")
    .replace(/\s+/g, "-");

  const uniqueName = `${crypto.randomUUID()}-${safeName}`;
  const storagePath = `${projectId}/${uniqueName}`;

  // Pastikan proyek memang ada sebelum upload file.
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(
      `Proyek tidak ditemukan: ${projectError?.message ?? "data proyek kosong"}`
    );
  }

  // Upload file ke Supabase Storage.
  const { error: uploadError } = await supabase.storage
    .from("project-documents")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(`Gagal upload file: ${uploadError.message}`);
  }

  // Simpan metadata dokumen ke database.
  const { data: document, error: databaseError } = await supabase
    .from("documents")
    .insert({
      project_id: projectId,
      name: file.name,
      type: extension,
      size: file.size,
      storage_path: storagePath,
    })
    .select("id, project_id, name, type, size, storage_path, created_at")
    .single();

  if (databaseError || !document) {
    // Rollback file jika metadata database gagal.
    await supabase.storage
      .from("project-documents")
      .remove([storagePath]);

    throw new Error(
      `File berhasil diupload tetapi metadata gagal disimpan: ${
        databaseError?.message ?? "data dokumen kosong"
      }`
    );
  }

  return {
    id: document.id,
    project_id: document.project_id,
    project_name: project.name,
    name: document.name,
    type: document.type as "PDF" | "DOC" | "DOCX",
    size: formatFileSize(document.size ?? 0),
    date: document.created_at,
    storage_path: document.storage_path,
  };
}
export async function getKiralDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("project-documents")
    .createSignedUrl(storagePath, 60 * 5);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Gagal membuat URL dokumen: ${error?.message ?? "URL tidak tersedia"}`
    );
  }

  return data.signedUrl;
}

export async function deleteKiralDocument(documentId: string): Promise<void> {
  const { data: document, error: findError } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("id", documentId)
    .single();

  if (findError) {
    throw new Error(`Gagal menemukan dokumen: ${findError.message}`);
  }

  const { error: storageError } = await supabase.storage
    .from("project-documents")
    .remove([document.storage_path]);

  if (storageError) {
    throw new Error(`Gagal menghapus file: ${storageError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) {
    throw new Error(`Gagal menghapus data dokumen: ${deleteError.message}`);
  }
}

export async function getKiralDashboard(): Promise<{
  projects: KiralProject[];
  documents: KiralDocument[];
}> {
  const [projects, documents] = await Promise.all([
    getKiralProjects(),
    getKiralDocuments(),
  ]);

  return {
    projects,
    documents,
  };
}

export type KiralProgress = {
  id: string;
  project_id: string;
  project_name: string;
  title: string;
  description: string;
  progress: number;
  created_at: string;
  updated_at: string;
};

export async function getKiralProgress(): Promise<KiralProgress[]> {
  const { data, error } = await supabase
    .from("progress")
    .select(`
      id,
      project_id,
      title,
      description,
      progress,
      created_at,
      updated_at,
      projects (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil laporan progress: ${error.message}`);
  }

  return (data ?? []).map((item) => {
    const project = Array.isArray(item.projects)
      ? item.projects[0]
      : item.projects;

    return {
      id: item.id,
      project_id: item.project_id,
      project_name: project?.name ?? "Proyek",
      title: item.title,
      description: item.description ?? "",
      progress: Number(item.progress ?? 0),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  });
}

export async function createKiralProgress(data: {
  project_id: string;
  title: string;
  description?: string;
  progress: number;
}): Promise<KiralProgress> {
  const progressValue = Math.max(
    0,
    Math.min(100, Number(data.progress))
  );

  const { data: item, error } = await supabase
    .from("progress")
    .insert({
      project_id: data.project_id,
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      progress: progressValue,
    })
    .select(`
      id,
      project_id,
      title,
      description,
      progress,
      created_at,
      updated_at,
      projects (
        name
      )
    `)
    .single();

  if (error || !item) {
    throw new Error(
      `Gagal menyimpan progress: ${
        error?.message ?? "data progress tidak tersedia"
      }`
    );
  }

  const project = Array.isArray(item.projects)
    ? item.projects[0]
    : item.projects;

  return {
    id: item.id,
    project_id: item.project_id,
    project_name: project?.name ?? "Proyek",
    title: item.title,
    description: item.description ?? "",
    progress: Number(item.progress ?? 0),
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export async function updateKiralProgress(
  progressId: string,
  data: {
    title: string;
    description?: string;
    progress: number;
  }
): Promise<KiralProgress> {
  const progressValue = Math.max(
    0,
    Math.min(100, Number(data.progress))
  );

  const { data: item, error } = await supabase
    .from("progress")
    .update({
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      progress: progressValue,
    })
    .eq("id", progressId)
    .select(`
      id,
      project_id,
      title,
      description,
      progress,
      created_at,
      updated_at,
      projects (
        name
      )
    `)
    .single();

  if (error || !item) {
    throw new Error(
      `Gagal memperbarui progress: ${
        error?.message ?? "data progress tidak tersedia"
      }`
    );
  }

  const project = Array.isArray(item.projects)
    ? item.projects[0]
    : item.projects;

  return {
    id: item.id,
    project_id: item.project_id,
    project_name: project?.name ?? "Proyek",
    title: item.title,
    description: item.description ?? "",
    progress: Number(item.progress ?? 0),
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export async function deleteKiralProgress(
  progressId: string
): Promise<void> {
  const { error } = await supabase
    .from("progress")
    .delete()
    .eq("id", progressId);

  if (error) {
    throw new Error(
      `Gagal menghapus progress: ${error.message}`
    );
  }
}