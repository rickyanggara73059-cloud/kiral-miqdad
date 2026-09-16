import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import "./Dashboard.css";
import ProjectManagement from "./ProjectManagement";
import DocumentManagement from "./DocumentManagement";
import ReportManagement from "./ReportManagement";
import { getKiralDashboard } from "../lib/kiralApi";

function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardProjects, setDashboardProjects] = useState<
    Awaited<ReturnType<typeof getKiralDashboard>>["projects"]
  >([]);

  const [dashboardDocuments, setDashboardDocuments] = useState<
    Awaited<ReturnType<typeof getKiralDashboard>>["documents"]
  >([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        const dashboardData = await getKiralDashboard();

        if (!mounted) return;

        setDashboardProjects(dashboardData.projects);
        setDashboardDocuments(dashboardData.documents);
      } catch (error) {
        console.error("Gagal memuat data Dashboard:", error);
      } finally {
        if (mounted) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  if (window.location.pathname === "/dashboard/proyek") {
    return <ProjectManagement />;
  }

  if (window.location.pathname === "/dashboard/dokumen") {
    return <DocumentManagement />;
  }

  if (window.location.pathname === "/dashboard/laporan") {
    return <ReportManagement />;
  }

  const menuItems = [
    { label: "Overview", icon: "⌂" },
    { label: "Proyek", icon: "▣" },
    { label: "Dokumen", icon: "▤" },
    { label: "Laporan", icon: "▥" },
    { label: "Pengaturan", icon: "⚙" },
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="dashboard-brand">
          <div className="dashboard-logo">
            <span>K</span>
            <span>M</span>
          </div>

          <div>
            <strong>KIRAL MIQDAD</strong>
            <small>Project Management</small>
          </div>
        </div>

        <div className="dashboard-menu-title">
          MENU UTAMA
        </div>

        <nav className="dashboard-nav">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={activeMenu === item.label ? "active" : ""}
              onClick={() => {
                if (item.label === "Proyek") {
                  window.location.href = "/dashboard/proyek";
                  return;
                }

                if (item.label === "Dokumen") {
                  window.location.href = "/dashboard/dokumen";
                  return;
                }

                setActiveMenu(item.label);
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">

          <a href="/" className="back-website">
            <span>↩</span>
            Kembali ke Website
          </a>

          <button
            className="logout-button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.replace("/login");
            }}
          >
            <span>⇥</span>
            Keluar
          </button>

        </div>

      </aside>


      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* MAIN */}
      <main className="dashboard-main">

        {/* TOPBAR */}
        <header className="dashboard-topbar">

          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="dashboard-page-title">
            <span>DASHBOARD</span>
            <h1>{activeMenu}</h1>
          </div>

          <div className="dashboard-user">

            <div className="dashboard-notification">
              ●
              <b>3</b>
            </div>

            <div className="user-avatar">
              A
            </div>

            <div className="user-info">
              <strong>Administrator</strong>
              <span>Owner</span>
            </div>

            <span className="user-arrow">⌄</span>

          </div>

        </header>


        {/* CONTENT */}
        <div className="dashboard-content">

          <div className="welcome-row">

            <div>
              <p className="eyebrow">CV. KIRAL MIQDAD</p>
              <h2>Selamat Datang di Dashboard</h2>
              <p className="welcome-text">
                Kelola proyek, dokumen dan laporan perusahaan
                dari satu tempat.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                window.location.href = "/dashboard/proyek?add=1";
              }}
            >
              + Tambah Proyek
            </button>

          </div>


          {/* STATISTICS */}
          <section className="dashboard-stats">

            <div className="stat-card">
              <div className="stat-icon green">▣</div>
              <div>
                <span>Total Proyek</span>
                <strong>{dashboardLoading ? "—" : dashboardProjects.length}</strong>
                <small>Proyek terdaftar</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">▤</div>
              <div>
                <span>Total Dokumen</span>
                <strong>{dashboardLoading ? "—" : dashboardDocuments.length}</strong>
                <small>Seluruh proyek</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">◈</div>
              <div>
                <span>Dokumen PDF</span>
                <strong>
                  {dashboardLoading
                    ? "—"
                    : dashboardDocuments.filter(
                        (document) => document.type === "PDF"
                      ).length}
                </strong>
                <small>Dokumen tersimpan</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon gold">✓</div>
              <div>
                <span>Proyek Aktif</span>
                <strong>
                  {dashboardLoading
                    ? "—"
                    : dashboardProjects.filter(
                        (project) => project.status.toLowerCase() === "berjalan"
                      ).length}
                </strong>
                <small>Sedang berjalan</small>
              </div>
            </div>

          </section>


          {/* MAIN GRID */}
          <section className="dashboard-grid">

            {/* PROJECTS */}
            <div className="dashboard-panel project-panel">

              <div className="panel-header">
                <div>
                  <span className="panel-label">PROJECT MANAGEMENT</span>
                  <h3>Proyek Terbaru</h3>
                </div>

                <button
                  className="text-button"
                  onClick={() => setActiveMenu("Proyek")}
                >
                  Lihat Semua →
                </button>
              </div>

              <div className="project-list">

                {dashboardProjects.slice(-3).reverse().map((project, index) => (
                  <div className="project-row" key={project.id}>

                    <div className={`project-number project-${index + 1}`}>
                      0{index + 1}
                    </div>

                    <div className="project-info">
                      <strong>{project.name}</strong>
                      <span>
                        {project.category} · {project.location}
                      </span>
                    </div>

                    <div className="project-documents">
                      <strong>
                        {
                          dashboardDocuments.filter(
                            (document) => document.project_id === project.id
                          ).length
                        }
                      </strong>
                      <span>Dokumen</span>
                    </div>

                    <span className="project-status">
                      {project.status}
                    </span>

                    <button className="row-arrow">
                      →
                    </button>

                  </div>
                ))}

              </div>

            </div>


            {/* DOCUMENTS */}
            <div className="dashboard-panel document-panel">

              <div className="panel-header">
                <div>
                  <span className="panel-label">DOCUMENT MANAGEMENT</span>
                  <h3>Dokumen Terbaru</h3>
                </div>

                <button
                  className="text-button"
                  onClick={() => setActiveMenu("Dokumen")}
                >
                  Lihat Semua →
                </button>
              </div>

              <div className="document-list">

                {dashboardDocuments.slice(-4).reverse().map((document) => (
                  <div className="document-row" key={document.id}>

                    <div className={`file-icon ${document.type.toLowerCase()}`}>
                      {document.type}
                    </div>

                    <div className="document-info">
                      <strong>{document.name}</strong>
                      <span>{document.project_name}</span>
                    </div>

                    <div className="document-date">
                      {document.date}
                    </div>

                    <button className="dashboard-document-menu">
                      ⋮
                    </button>

                  </div>
                ))}

              </div>

            </div>

          </section>


          {/* QUICK ACTION */}
          <section className="quick-actions">

            <div className="quick-heading">
              <span className="panel-label">AKSES CEPAT</span>
              <h3>Apa yang ingin Anda lakukan?</h3>
            </div>

            <div className="quick-grid">

              <button onClick={() => setActiveMenu("Proyek")}>
                <span>+</span>
                <div>
                  <strong>Buat Proyek Baru</strong>
                  <small>Tambahkan proyek konstruksi</small>
                </div>
                <b>→</b>
              </button>

              <button onClick={() => setActiveMenu("Dokumen")}>
                <span>↑</span>
                <div>
                  <strong>Upload Dokumen</strong>
                  <small>PDF, DOC dan DOCX</small>
                </div>
                <b>→</b>
              </button>

              <button onClick={() => setActiveMenu("Laporan")}>
                <span>▥</span>
                <div>
                  <strong>Lihat Laporan</strong>
                  <small>Progress dan dokumentasi proyek</small>
                </div>
                <b>→</b>
              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;





