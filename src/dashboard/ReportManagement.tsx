import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import "./ReportManagement.css";

import {
  getKiralProjects,
  getKiralProgress,
  createKiralProgress,
  updateKiralProgress,
  deleteKiralProgress,
  type KiralProject,
  type KiralProgress,
} from "../lib/kiralApi";

function ReportManagement() {
  const [projects, setProjects] = useState<KiralProject[]>([]);
  const [progressItems, setProgressItems] = useState<KiralProgress[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<KiralProgress | null>(null);
  const [apiStatus, setApiStatus] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState("0");

  async function loadData() {
    try {
      setLoading(true);

      const [projectData, progressData] = await Promise.all([
        getKiralProjects(),
        getKiralProgress(),
      ]);

      setProjects(projectData);
      setProgressItems(progressData);

      if (!selectedProjectId && projectData.length > 0) {
        setSelectedProjectId(projectData[0].id);
      }

      setApiStatus("Data laporan tersambung ke Supabase");
    } catch (error) {
      console.error(error);

      setApiStatus(
        error instanceof Error
          ? error.message
          : "Gagal memuat laporan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const projectProgress = useMemo(() => {
    if (!selectedProjectId) return 0;

    const items = progressItems.filter(
      (item) => item.project_id === selectedProjectId
    );

    if (items.length === 0) return 0;

    return Math.max(
      ...items.map((item) => Number(item.progress))
    );
  }, [progressItems, selectedProjectId]);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const projectItems = progressItems.filter(
    (item) => item.project_id === selectedProjectId
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setProgress("0");
    setEditingItem(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(item: KiralProgress) {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setProgress(String(item.progress));
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId) {
      alert("Pilih proyek terlebih dahulu.");
      return;
    }

    if (!title.trim()) {
      alert("Judul progress wajib diisi.");
      return;
    }

    const progressValue = Number(progress);

    if (
      !Number.isFinite(progressValue) ||
      progressValue < 0 ||
      progressValue > 100
    ) {
      alert("Progress harus berada di antara 0 sampai 100.");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        const updated = await updateKiralProgress(
          editingItem.id,
          {
            title,
            description,
            progress: progressValue,
          }
        );

        setProgressItems((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item
          )
        );
      } else {
        const created = await createKiralProgress({
          project_id: selectedProjectId,
          title,
          description,
          progress: progressValue,
        });

        setProgressItems((current) => [created, ...current]);
      }

      setShowForm(false);
      resetForm();
      setApiStatus("Progress berhasil disimpan ke Supabase.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan progress."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: KiralProgress) {
    const confirmed = window.confirm(
      `Hapus laporan "${item.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteKiralProgress(item.id);

      setProgressItems((current) =>
        current.filter((progressItem) => progressItem.id !== item.id)
      );

      setApiStatus("Progress berhasil dihapus.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus progress."
      );
    }
  }

  return (
    <div className="report-page">
      <div className="report-container">

        <button
          className="report-back"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          ← Kembali ke Dashboard
        </button>

        <header className="report-header">
          <div>
            <p className="report-eyebrow">PROJECT REPORT</p>
            <h1>Laporan & Progress</h1>
            <p>
              Pantau perkembangan pekerjaan setiap proyek
              secara terstruktur.
            </p>
          </div>

          <button
            className="report-primary-button"
            onClick={openCreateForm}
            disabled={projects.length === 0}
          >
            + Tambah Progress
          </button>
        </header>

        <section className="report-project-selector">
          <div>
            <label>Pilih Proyek</label>

            <select
              value={selectedProjectId}
              onChange={(event) =>
                setSelectedProjectId(event.target.value)
              }
            >
              {projects.length === 0 ? (
                <option value="">
                  Belum ada proyek
                </option>
              ) : (
                projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="report-project-info">
            <span>Proyek</span>
            <strong>
              {selectedProject?.name ?? "Belum dipilih"}
            </strong>
          </div>
        </section>

        <section className="report-progress-card">
          <div className="report-progress-top">
            <div>
              <span>Progress Proyek</span>
              <strong>{projectProgress}%</strong>
            </div>

            <span>
              {projectItems.length} update
            </span>
          </div>

          <div className="report-progress-track">
            <div
              className="report-progress-fill"
              style={{
                width: `${projectProgress}%`,
              }}
            />
          </div>

          <div className="report-progress-labels">
            <span>0%</span>
            <span>100%</span>
          </div>
        </section>

        <div className="report-status">
          {loading
            ? "Memuat data laporan..."
            : apiStatus}
        </div>

        <section className="report-list-card">
          <div className="report-list-header">
            <div>
              <p className="report-eyebrow">
                PROGRESS TIMELINE
              </p>
              <h2>Update Pekerjaan</h2>
            </div>

            <span>
              {projectItems.length} laporan
            </span>
          </div>

          {loading ? (
            <div className="report-empty">
              Memuat laporan...
            </div>
          ) : projectItems.length === 0 ? (
            <div className="report-empty">
              <div className="report-empty-icon">
                +
              </div>

              <h3>Belum ada laporan progress</h3>

              <p>
                Tambahkan update pekerjaan pertama
                untuk proyek ini.
              </p>

              {projects.length > 0 && (
                <button
                  className="report-secondary-button"
                  onClick={openCreateForm}
                >
                  + Tambah Progress
                </button>
              )}
            </div>
          ) : (
            <div className="report-timeline">
              {projectItems.map((item) => (
                <article
                  className="report-timeline-item"
                  key={item.id}
                >
                  <div className="report-timeline-dot" />

                  <div className="report-item-content">
                    <div className="report-item-top">
                      <div>
                        <h3>{item.title}</h3>

                        <time>
                          {new Date(
                            item.created_at
                          ).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </time>
                      </div>

                      <strong>
                        {item.progress}%
                      </strong>
                    </div>

                    {item.description && (
                      <p>{item.description}</p>
                    )}

                    <div className="report-item-progress">
                      <div>
                        <span
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="report-item-actions">
                      <button
                        onClick={() =>
                          openEditForm(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger"
                        onClick={() =>
                          handleDelete(item)
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {showForm && (
          <div className="report-modal-overlay">
            <div className="report-modal">

              <div className="report-modal-header">
                <div>
                  <p className="report-eyebrow">
                    {editingItem
                      ? "EDIT PROGRESS"
                      : "NEW PROGRESS"}
                  </p>

                  <h2>
                    {editingItem
                      ? "Edit Progress"
                      : "Tambah Progress"}
                  </h2>
                </div>

                <button
                  className="report-close"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="report-field">
                  <label>Proyek</label>

                  <select
                    value={selectedProjectId}
                    onChange={(event) =>
                      setSelectedProjectId(
                        event.target.value
                      )
                    }
                    disabled={Boolean(editingItem)}
                  >
                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="report-field">
                  <label>Judul Progress</label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Contoh: Pekerjaan pondasi selesai"
                    required
                  />
                </div>

                <div className="report-field">
                  <label>Deskripsi</label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Jelaskan perkembangan pekerjaan..."
                    rows={4}
                  />
                </div>

                <div className="report-field">
                  <label>Progress (%)</label>

                  <div className="report-progress-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(event) =>
                        setProgress(event.target.value)
                      }
                      required
                    />

                    <span>%</span>
                  </div>
                </div>

                <div className="report-form-actions">
                  <button
                    type="button"
                    className="report-cancel-button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="report-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Menyimpan..."
                      : "Simpan Progress"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReportManagement;