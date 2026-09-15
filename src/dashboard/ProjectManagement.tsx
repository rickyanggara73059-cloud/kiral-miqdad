import { useEffect, useState } from "react";
import "./ProjectManagement.css";
import { createKiralProject, deleteKiralDocument, getKiralDocumentUrl, getKiralDocuments, getKiralProjects, uploadKiralDocument, deleteKiralProject } from "../lib/kiralApi";

type Project = {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  description: string;
  documents: DocumentItem[];
};

type DocumentItem = {
  id: string;
  name: string;
  type: "PDF" | "DOC" | "DOCX";
  size: string;
  date: string;
  storage_path?: string;
};

const initialProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "Pembangunan Saluran Irigasi",
    category: "Infrastruktur",
    location: "Lombok Tengah, NTB",
    status: "Berjalan",
    description:
      "Pembangunan saluran irigasi untuk mendukung kebutuhan pertanian dan infrastruktur pengairan masyarakat.",
    documents: [
      {
        id: "DOC-001",
        name: "Kontrak Pembangunan Irigasi.pdf",
        type: "PDF",
        size: "2.4 MB",
        date: "11 Sep 2026",
      },
      {
        id: "DOC-002",
        name: "Gambar Kerja Irigasi.pdf",
        type: "PDF",
        size: "5.8 MB",
        date: "08 Sep 2026",
      },
      {
        id: "DOC-003",
        name: "Laporan Progres Irigasi.docx",
        type: "DOCX",
        size: "1.2 MB",
        date: "07 Sep 2026",
      },
    ],
  },
  {
    id: "PRJ-002",
    name: "Renovasi Sekolah",
    category: "Pendidikan",
    location: "Lombok Tengah, NTB",
    status: "Berjalan",
    description:
      "Renovasi ruang kelas, fasilitas sekolah dan peningkatan kualitas bangunan pendidikan.",
    documents: [
      {
        id: "DOC-004",
        name: "Kontrak Renovasi Sekolah.pdf",
        type: "PDF",
        size: "2.1 MB",
        date: "10 Sep 2026",
      },
      {
        id: "DOC-005",
        name: "RAB Renovasi Sekolah.docx",
        type: "DOCX",
        size: "980 KB",
        date: "10 Sep 2026",
      },
    ],
  },
  {
    id: "PRJ-003",
    name: "Pembangunan Puskesmas",
    category: "Kesehatan",
    location: "Lombok Tengah, NTB",
    status: "Berjalan",
    description:
      "Pembangunan fasilitas kesehatan untuk meningkatkan pelayanan kesehatan masyarakat.",
    documents: [
      {
        id: "DOC-006",
        name: "Kontrak Puskesmas.pdf",
        type: "PDF",
        size: "3.1 MB",
        date: "09 Sep 2026",
      },
      {
        id: "DOC-007",
        name: "Laporan Progres Puskesmas.docx",
        type: "DOCX",
        size: "1.4 MB",
        date: "09 Sep 2026",
      },
      {
        id: "DOC-008",
        name: "Gambar Kerja Puskesmas.pdf",
        type: "PDF",
        size: "7.2 MB",
        date: "08 Sep 2026",
      },
    ],
  },
];

function formatKiralDate(value: string): string {
  const isoMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day))
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return value;
}
function ProjectManagement() {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(() => new URLSearchParams(window.location.search).get("add") === "1");
  const [showUpload, setShowUpload] = useState(false);
  const [openDocumentMenu, setOpenDocumentMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [apiStatus, setApiStatus] = useState("Menghubungkan ke database...");

  useEffect(() => {
    Promise.all([getKiralProjects(), getKiralDocuments()])
      .then(([projectsData, documentsData]) => {
        console.log("KIRAL projects:", projectsData);
        console.log("KIRAL documents:", documentsData);
        setProjects(
          projectsData.map((project) => ({
            id: project.id,
            name: project.name,
            category: project.category,
            location: project.location,
            status: project.status,
            description: project.description,
            documents: documentsData
              .filter((document) => document.project_id === project.id)
              .map((document) => ({
                id: document.id,
                name: document.name,
                type: document.type,
                size: document.size,
                date: formatKiralDate(document.date),
                storage_path: document.storage_path,
              })),
          }))
        );

        setApiStatus(
          `Terhubung — ${projectsData.length} proyek, ${documentsData.length} dokumen dari Supabase`
        );
      })
      .catch((error) => {
        setApiStatus(
          error instanceof Error
            ? `Gagal terhubung: ${error.message}`
            : "Gagal terhubung ke database."
        );
      });
  }, []);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectCategory, setNewProjectCategory] =
    useState("Infrastruktur");

  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.category} ${project.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function addProject() {
    if (!newProjectName.trim()) return;

    try {
      const createdProject = await createKiralProject({
        name: newProjectName.trim(),
        category: newProjectCategory,
        location: "Lombok Tengah, NTB",
        status: "Berjalan",
        description: "Proyek konstruksi CV. Kiral Miqdad.",
      });

      const newProject: Project = {
        id: createdProject.id,
        name: createdProject.name,
        category: createdProject.category,
        location: createdProject.location,
        status: createdProject.status,
        description: createdProject.description,
        documents: [],
      };

      setProjects((current) => [...current, newProject]);
      setNewProjectName("");
      setShowAddProject(false);
      setApiStatus("Proyek berhasil disimpan ke Supabase");
    } catch (error) {
      setApiStatus(
        error instanceof Error
          ? `Gagal menyimpan proyek: ${error.message}`
          : "Gagal menyimpan proyek ke database."
      );
    }
  }

  async function uploadDocument(file: File) {
    if (!selectedProject) return;

    const extension = file.name.split(".").pop()?.toUpperCase();

    if (!["PDF", "DOC", "DOCX"].includes(extension || "")) {
      alert("Format yang diperbolehkan hanya PDF, DOC dan DOCX.");
      return;
    }

    try {
      const uploadedDocument = await uploadKiralDocument(
        selectedProject.id,
        file
      );

      const newDocument: DocumentItem = {
        id: uploadedDocument.id,
        name: uploadedDocument.name,
        type: uploadedDocument.type,
        size: uploadedDocument.size,
        date: uploadedDocument.date,
        storage_path: uploadedDocument.storage_path,
      };

      const updatedProject = {
        ...selectedProject,
        documents: [newDocument, ...selectedProject.documents],
      };

      setProjects((current) =>
        current.map((project) =>
          project.id === selectedProject.id ? updatedProject : project
        )
      );

      setSelectedProject(updatedProject);
      setShowUpload(false);
      setApiStatus(`Dokumen berhasil diupload: ${uploadedDocument.name}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Upload gagal: ${error.message}`
          : "Upload dokumen gagal."
      );
    }
  }

  function openProject(project: Project) {
    setSelectedProject(project);
  }

  function closeProject() {
    setSelectedProject(null);
  }

  async function previewDocument(document: DocumentItem) {
    if (!document.storage_path) {
      alert("Lokasi penyimpanan dokumen tidak tersedia.");
      return;
    }

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
  }

  async function downloadDocument(document: DocumentItem) {
    if (!document.storage_path) {
      alert("Lokasi penyimpanan dokumen tidak tersedia.");
      return;
    }

    try {
      const url = await getKiralDocumentUrl(document.storage_path);

      const link = window.document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = document.name;

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
  }
  async function handleDeleteDocument(document: DocumentItem) {
    const confirmed = window.confirm(
      `Hapus dokumen "${document.name}"?\n\nFile akan dihapus dari Supabase Storage dan datanya dihapus dari database.`
    );

    if (!confirmed) return;

    try {
      await deleteKiralDocument(String(document.id));

      if (selectedProject) {
        const updatedProject = {
          ...selectedProject,
          documents: selectedProject.documents.filter(
            (item) => item.id !== document.id
          ),
        };

        setProjects((current) =>
          current.map((project) =>
            project.id === selectedProject.id ? updatedProject : project
          )
        );

        setSelectedProject(updatedProject);
      }

      setOpenDocumentMenu(null);
      setApiStatus(`Dokumen berhasil dihapus: ${document.name}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Gagal menghapus dokumen: ${error.message}`
          : "Gagal menghapus dokumen."
      );
    }
  }

  async function handleDeleteProject(project: Project) {
    const confirmed = window.confirm(
      `Hapus proyek "${project.name}"?\n\n` +
      "Semua dokumen proyek dan file di Supabase Storage juga akan dihapus. " +
      "Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    try {
      await deleteKiralProject(project.id);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );

      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
      }

      setApiStatus(`Proyek berhasil dihapus: ${project.name}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Gagal menghapus proyek: ${error.message}`
          : "Gagal menghapus proyek."
      );
    }
  }

  return (
    <div className="project-management">

      {/* TOP HEADER */}
      <div className="pm-header">

        <div>
          <span className="pm-eyebrow">PROJECT MANAGEMENT</span>

          <h1>
            {selectedProject
              ? selectedProject.name
              : "Daftar Proyek"}
          </h1>

          <p>
            {selectedProject
              ? "Kelola informasi dan seluruh dokumen proyek."
              : "Kelola seluruh proyek konstruksi CV. Kiral Miqdad."}
          </p>

          {!selectedProject && (
            <small style={{ display: "block", marginTop: "8px", opacity: 0.7 }}>
              {apiStatus}
            </small>
          )}
        </div>

        <div className="pm-header-actions">

          {selectedProject ? (
            <>
              <button
                className="pm-secondary-button"
                onClick={closeProject}
              >
                ← Kembali
              </button>

              <button
                className="pm-primary-button"
                onClick={() => setShowUpload(true)}
              >
                ←‘ Upload Dokumen
              </button>
            </>
          ) : (
            <>
              <button
                className="pm-secondary-button"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                ← Kembali ke Dashboard
              </button>

              <button
                className="pm-primary-button"
                onClick={() => setShowAddProject(true)}
              >
                + Tambah Proyek
              </button>
            </>
          )}

        </div>
      </div>


      {/* PROJECT DETAIL */}
      {selectedProject ? (

        <div className="project-detail">

          <div className="project-detail-info">

            <div className={`project-category ${selectedProject.category.toLowerCase()}`}>
              {selectedProject.category}
            </div>

            <h2>{selectedProject.name}</h2>

            <div className="project-meta">
              <span>• {selectedProject.location}</span>
              <span>• {selectedProject.status}</span>
              <span>• {selectedProject.documents.length} Dokumen</span>
            </div>

            <p>{selectedProject.description}</p>

          </div>


          <div className="document-section">

            <div className="document-section-header">

              <div>
                <span className="pm-eyebrow">DOCUMENT MANAGEMENT</span>
                <h2>Dokumen Proyek</h2>
              </div>

              <span className="document-count">
                {selectedProject.documents.length} file
              </span>

            </div>


            {selectedProject.documents.length === 0 ? (

              <div className="empty-documents">

                <div className="empty-icon">
                  ←‘
                </div>

                <h3>Belum ada dokumen</h3>

                <p>
                  Upload kontrak, RAB, gambar kerja,
                  laporan atau dokumen proyek lainnya.
                </p>

                <button
                  className="pm-primary-button"
                  onClick={() => setShowUpload(true)}
                >
                  Upload Dokumen
                </button>

              </div>

            ) : (

              <div className="document-table">

                <div className="document-table-head">
                  <span>Dokumen</span>
                  <span>Ukuran</span>
                  <span>Tanggal</span>
                  <span></span>
                </div>

                {selectedProject.documents.map((document) => (

                  <div
                    className="document-table-row"
                    key={document.id}
                  >

                    <div className="document-name">

                      <div className={`document-file-icon ${document.type.toLowerCase()}`}>
                        {document.type}
                      </div>

                      <div>
                        <strong>{document.name}</strong>
                        <span>{document.type} Document</span>
                      </div>

                    </div>

                    <span>{document.size}</span>

                    <span>{document.date}</span>

                    <div className="document-actions">
                      <button
                        title="Preview"
                        onClick={() => previewDocument(document)}
                      >
                        👁
                      </button>

                      <button
                        title="Download"
                        onClick={() => downloadDocument(document)}
                      >
                        ←“
                      </button>

                      <div className="document-menu-wrapper">
                        <button
                          title="Menu"
                          onClick={() =>
                            setOpenDocumentMenu(
                              openDocumentMenu === document.id
                                ? null
                                : document.id
                            )
                          }
                        >
                          ⋮
                        </button>

                        {openDocumentMenu === document.id && (
                          <div className="document-menu">
                            <button
                              onClick={() =>
                                handleDeleteDocument(document)
                              }
                            >
                              🗑 Hapus Dokumen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      ) : (

        <>
          {/* SEARCH */}
          <div className="pm-toolbar">

            <div className="pm-search">
              <span>&#128269;</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari proyek..."
              />
            </div>

            <div className="pm-summary">
              {projects.length} Proyek Terdaftar
            </div>

          </div>


          {/* PROJECT CARDS */}
          <div className="project-management-grid">

            {filteredProjects.map((project, index) => (

              <article
                className="pm-project-card"
                key={project.id}
              >

                <div className="pm-project-top">

                  <div className={`pm-project-number project-color-${index + 1}`}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <span className="pm-status">
                    {project.status}
                  </span>

                </div>

                <span className="pm-project-category">
                  {project.category}
                </span>

                <h2>{project.name}</h2>

                <p>{project.location}</p>

                <div className="pm-project-footer">

                  <div>
                    <strong>{project.documents.length}</strong>
                    <span>Dokumen</span>
                  </div>

                  <div className="pm-project-actions">
                    <button
                      className="pm-manage-project-button"
                      onClick={() => openProject(project)}
                    >
                      Kelola Proyek →
                    </button>

                    <button
                      className="pm-delete-project-button"
                      onClick={() => handleDeleteProject(project)}
                    >
                      Hapus
                    </button>
                  </div>

                </div>

              </article>

            ))}

          </div>
        </>

      )}


      {/* ADD PROJECT MODAL */}
      {showAddProject && (

        <div
          className="pm-modal-backdrop"
          onClick={() => setShowAddProject(false)}
        >

          <div
            className="pm-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="pm-modal-header">
              <div>
                <span className="pm-eyebrow">PROJECT MANAGEMENT</span>
                <h2>Tambah Proyek</h2>
              </div>

              <button onClick={() => setShowAddProject(false)}>
                ×
              </button>
            </div>

            <label>
              Nama Proyek
              <input
                value={newProjectName}
                onChange={(event) =>
                  setNewProjectName(event.target.value)
                }
                placeholder="Contoh: Pembangunan Jalan Desa"
              />
            </label>

            <label>
              Kategori
              <select
                value={newProjectCategory}
                onChange={(event) =>
                  setNewProjectCategory(event.target.value)
                }
              >
                <option>Infrastruktur</option>
                <option>Pendidikan</option>
                <option>Kesehatan</option>
                <option>Gedung</option>
                <option>Lainnya</option>
              </select>
            </label>

            <div className="pm-modal-actions">

              <button
                className="pm-secondary-button"
                onClick={() => setShowAddProject(false)}
              >
                Batal
              </button>

              <button
                className="pm-primary-button"
                onClick={addProject}
              >
                Simpan Proyek
              </button>

            </div>

          </div>

        </div>

      )}


      {/* UPLOAD MODAL */}
      {showUpload && (

        <div
          className="pm-modal-backdrop"
          onClick={() => setShowUpload(false)}
        >

          <div
            className="pm-modal upload-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="pm-modal-header">
              <div>
                <span className="pm-eyebrow">DOCUMENT MANAGEMENT</span>
                <h2>Upload Dokumen</h2>
              </div>

              <button onClick={() => setShowUpload(false)}>
                ×
              </button>
            </div>

            <p className="upload-project-name">
              {selectedProject?.name}
            </p>

            <label className="upload-dropzone">

              <span className="upload-large-icon">
                ←‘
              </span>

              <strong>Pilih Dokumen</strong>

              <small>
                PDF, DOC atau DOCX
              </small>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    uploadDocument(file);
                  }
                }}
              />

            </label>

          </div>

        </div>

      )}

    </div>
  );
}

export default ProjectManagement;



