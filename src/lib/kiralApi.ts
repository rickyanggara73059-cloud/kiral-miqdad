const KIRAL_API_URL =
  "https://script.google.com/macros/s/AKfycbx0B-o7XrthRLKUPJXvbM09JqGF6cYQNCMhVD5bOou50DXvpqev-rTPzSycSMzlUsDY/exec";

export type KiralProject = {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function getKiralProjects(): Promise<KiralProject[]> {
  const response = await fetch(`${KIRAL_API_URL}?action=projects`);

  if (!response.ok) {
    throw new Error(`API KIRAL gagal: HTTP ${response.status}`);
  }

  const result: ApiResponse<KiralProject[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || "API KIRAL mengembalikan error.");
  }

  return result.data ?? [];
}

export async function createKiralProject(data: {
  name: string;
  category: string;
  location?: string;
  status?: string;
  description?: string;
}): Promise<KiralProject> {
  const response = await fetch(KIRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "createProject",
      data,
    }),
  });

  if (!response.ok) {
    throw new Error(`API KIRAL gagal: HTTP ${response.status}`);
  }

  const result: ApiResponse<KiralProject> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(
      result.message || "Gagal membuat proyek di database KIRAL."
    );
  }

  return result.data;
}

export type KiralDocument = {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  type: "PDF" | "DOC" | "DOCX";
  size: string;
  date: string;
  drive_url: string;
};

export async function getKiralDocuments(): Promise<KiralDocument[]> {
  const response = await fetch(`${KIRAL_API_URL}?action=documents`);

  if (!response.ok) {
    throw new Error(`API KIRAL gagal: HTTP ${response.status}`);
  }

  const result: ApiResponse<KiralDocument[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || "API KIRAL mengembalikan error.");
  }

  return result.data ?? [];
}
export type KiralDocumentUpload = {
  project_id: string;
  name: string;
  type: "PDF" | "DOC" | "DOCX";
  base64: string;
};

export async function uploadKiralDocument(
  data: KiralDocumentUpload
): Promise<KiralDocument> {
  const response = await fetch(KIRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "uploadDocument",
      data,
    }),
  });

  if (!response.ok) {
    throw new Error(`API KIRAL gagal: HTTP ${response.status}`);
  }

  const result: ApiResponse<KiralDocument> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(
      result.message || "Upload dokumen ke Google Drive gagal."
    );
  }

  return result.data;
}
export async function deleteKiralDocument(documentId: string): Promise<void> {
  const response = await fetch(KIRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "deleteDocument",
      data: {
        id: documentId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API KIRAL gagal: HTTP ${response.status}`);
  }

  const result: ApiResponse<{ id: string; message: string }> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Gagal menghapus dokumen dari database KIRAL."
    );
  }
}

export async function getKiralDashboard(): Promise<{
  projects: KiralProject[];
  documents: KiralDocument[];
}> {
  const response = await fetch(`${KIRAL_API_URL}?action=dashboard`);

  if (!response.ok) {
    throw new Error(`API KIRAL gagal: HTTP ${response.status}`);
  }

  const result: ApiResponse<{
    projects: KiralProject[];
    documents: KiralDocument[];
  }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(
      result.message || "API Dashboard KIRAL mengembalikan error."
    );
  }

  return result.data;
}