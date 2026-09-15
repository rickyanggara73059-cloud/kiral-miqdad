import { useEffect, useMemo, useState } from "react";
import "./DocumentManagement.css";
import {
  deleteKiralDocument,
  getKiralDocumentUrl,
  getKiralDocuments,
  getKiralProjects,
  uploadKiralDocument,
} from "../lib/kiralApi";

type DocumentItem = Awaited<ReturnType<typeof getKiralDocuments>>[number];
type ProjectItem = Awaited<ReturnType<typeof getKiralProjects>>[number];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showUpload, setShowUpload] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [uploading, setUploading] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState(
    "Memuat dokumen dari Supabase..."
  );

  async function loadDocuments() {
    try {
      setLoading(true);

      const [documentsData, projectsData] = await Promise.all([
        getKiralDocuments(),
        getKiralProjects(),
      ]);

      setDocuments(documentsData);
      setProjects(projectsData);
      setApiStatus(
        `${documentsData.length} dokumen tersimpan di Supabase`
      );
    } catch (error) {
      console.error("Gagal memuat dokumen:", error);

      setApiStatus(
        error instanceof Error
          ? error.message
          : "Gagal memuat dokumen."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !keyword ||
        document.name.toLowerCase().includes(keyword) ||
        document.project_name.toLowerCase().includes(keyword);

      const matchesProject =
        projectFilter === "all" ||
        document.project_id === projectFilter;

      const matchesType =
        typeFilter === "all" ||
        document.type === typeFilter;

      return matchesSearch && matchesProject && matchesType;
    });
  }, [documents, search, projectFilter, typeFilter]);

  async function handlePreview(document: DocumentItem) {
    try {
      const url = await getKiralDocumentUrl(document.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(
        error instanceof Error
          ? `Gagal membuka dokumen: ${error.message}`
          : "Gagal membuka dokumen."
      );
    }

    setOpenMenu(null);
  }

  async function handleDownload(document: DocumentItem) {
    try {
      const url = await getKiralDocumentUrl(document.storage_path);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert(
        error instanceof Error
          ? `Gagal mengunduh dokumen: ${error.message}`
          : "Gagal mengunduh dokumen."
      );
    }

    setOpenMenu(null);
  }

  async function handleDelete(document: DocumentItem) {
    const confirmed = window.confirm(
      `Hapus dokumen "${document.name}"?\n\nFile akan dihapus dari Supabase Storage dan metadata dokumen juga akan dihapus.`
    );

    if (!confirmed) return;

    try {
      await deleteKiralDocument(document.id);

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id)
      );

      setOpenMenu(null);
      setApiStatus(`Dokumen berhasil dihapus: ${document.name}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Gagal menghapus dokumen: ${error.message}`
          : "Gagal menghapus dokumen."
      );
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !selectedProjectId) return;

    try {
      setUploading(true);

      const uploaded = await uploadKiralDocument(
        selectedProjectId,
        file
      );

      setDocuments((current) => [uploaded, ...current]);

      setShowUpload(false);
      setSelectedProjectId("");
      setApiStatus(`Dokumen berhasil diupload: ${uploaded.name}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Upload gagal: ${error.message}`
          : "Upload dokumen gagal."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="document-management">

      {/* HEADER */}
      <header className="document-header">
        <div>
          <button
            className="document-back"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            ← Kembali ke Dashboard
          </button>

          <span className="document-eyebrow">
            DOCUMENT MANAGEMENT
          </span>

          <h1>Dokumen</h1>

          <p>
            Kelola seluruh dokumen proyek CV. Kiral Miqdad.
          </p>
        </div>

        <button
          className="document-upload-button"
          onClick={() => setShowUpload(true)}
          disabled={projects.length === 0}
        >
          + Upload Dokumen
        </button>
      </header>

      {/* STATISTICS */}
      <section className="document-stats">

        <div className="document-stat-card">
          <span>Total Dokumen</span>
          <strong>{documents.length}</strong>
          <small>Seluruh proyek</small>
        </div>

        <div className="document-stat-card">
          <span>Dokumen PDF</span>
          <strong>
            {documents.filter((item) => item.type === "PDF").length}
          </strong>
          <small>File PDF</small>
        </div>

        <div className="document-stat-card">
          <span>DOC / DOCX</span>
          <strong>
            {
              documents.filter(
                (item) => item.type === "DOC" || item.type === "DOCX"
              ).length
            }
          </strong>
          <small>Dokumen kantor</small>
        </div>

        <div className="document-stat-card">
          <span>Proyek</span>
          <strong>{projects.length}</strong>
          <small>Terdaftar</small>
        </div>

      </section>

      {/* TOOLBAR */}
      <section className="document-toolbar">

        <div className="document-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Cari nama dokumen atau proyek..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
        >
          <option value="all">Semua Proyek</option>

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="all">Semua Tipe</option>
          <option value="PDF">PDF</option>
          <option value="DOC">DOC</option>
          <option value="DOCX">DOCX</option>
        </select>

      </section>

      {/* STATUS */}
      <div className="document-status">
        <span>{apiStatus}</span>

        <strong>
          {filteredDocuments.length} dokumen ditampilkan
        </strong>
      </div>

      {/* TABLE */}
      <section className="document-panel">

        <div className="document-panel-header">
          <div>
            <span className="document-panel-label">
              DOCUMENT LIBRARY
            </span>

            <h2>Semua Dokumen</h2>
          </div>
        </div>

        {loading ? (
          <div className="document-empty">
            <strong>Memuat dokumen...</strong>
            <span>Mengambil data dari Supabase.</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="document-empty">
            <div className="document-empty-icon">□</div>
            <strong>Tidak ada dokumen</strong>

            <span>
              {documents.length === 0
                ? "Belum ada dokumen yang tersimpan."
                : "Tidak ada dokumen yang sesuai dengan filter."}
            </span>
          </div>
        ) : (
          <div className="document-table-wrapper">

            <table className="document-table">

              <thead>
                <tr>
                  <th>Dokumen</th>
                  <th>Proyek</th>
                  <th>Tipe</th>
                  <th>Ukuran</th>
                  <th>Tanggal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filteredDocuments.map((document) => (

                  <tr key={document.id}>

                    <td>
                      <div className="document-name-cell">

                        <div
                          className={`document-file-icon ${document.type.toLowerCase()}`}
                        >
                          {document.type}
                        </div>

                        <div>
                          <strong>{document.name}</strong>
                          <small>
                            ID: {document.id.slice(0, 8)}...
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="document-project-name">
                        {document.project_name}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`document-type-badge ${document.type.toLowerCase()}`}
                      >
                        {document.type}
                      </span>
                    </td>

                    <td>{document.size}</td>

                    <td>{formatDate(document.date)}</td>

                    <td className="document-actions-cell">

                      <button
                        className="document-action-button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === document.id
                              ? null
                              : document.id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {openMenu === document.id && (
                        <div className="document-action-menu">

                          <button
                            onClick={() =>
                              handlePreview(document)
                            }
                          >
                            👁 Preview
                          </button>

                          <button
                            onClick={() =>
                              handleDownload(document)
                            }
                          >
                            ↓ Download
                          </button>

                          <button
                            className="danger"
                            onClick={() =>
                              handleDelete(document)
                            }
                          >
                            🗑 Hapus
                          </button>

                        </div>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div
          className="document-modal-backdrop"
          onClick={() => {
            if (!uploading) {
              setShowUpload(false);
            }
          }}
        >

          <div
            className="document-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="document-modal-header">

              <div>
                <span className="document-eyebrow">
                  DOCUMENT MANAGEMENT
                </span>

                <h2>Upload Dokumen</h2>
              </div>

              <button
                onClick={() => setShowUpload(false)}
                disabled={uploading}
              >
                ×
              </button>

            </div>

            <label>
              <span>Proyek</span>

              <select
                value={selectedProjectId}
                onChange={(event) =>
                  setSelectedProjectId(event.target.value)
                }
                disabled={uploading}
              >
                <option value="">
                  Pilih proyek...
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}

              </select>
            </label>

            <label className="document-dropzone">

              <div className="document-dropzone-icon">
                ↑
              </div>

              <strong>
                {uploading
                  ? "Mengupload dokumen..."
                  : "Pilih Dokumen"}
              </strong>

              <small>
                PDF, DOC atau DOCX
              </small>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                disabled={
                  uploading || !selectedProjectId
                }
                onChange={handleUpload}
              />

            </label>

          </div>

        </div>
      )}

    </div>
  );
}

export default DocumentManagement;
