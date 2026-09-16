import { useState } from "react";
import "./App.css";
import Dashboard from "./dashboard/Dashboard";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

const projects = [
  {
    title: "Pembangunan Saluran Irigasi",
    category: "Infrastruktur",
    location: "Lombok Tengah, NTB",
    image:
      "/images/projects/irigasi.jpg",
    description:
      "Pekerjaan pembangunan saluran irigasi untuk mendukung pertanian dan kesejahteraan masyarakat.",
  },
  {
    title: "Renovasi Sekolah",
    category: "Pendidikan",
    location: "Lombok Tengah, NTB",
    image:
      "/images/projects/sekolah.jpg",
    description:
      "Renovasi ruang kelas, perbaikan fasilitas dan peningkatan infrastruktur sekolah.",
  },
  {
    title: "Pembangunan Puskesmas",
    category: "Kesehatan",
    location: "Lombok Tengah, NTB",
    image:
      "/images/projects/puskesmas.jpg",
    description:
      "Pembangunan fasilitas kesehatan untuk mendukung pelayanan kesehatan masyarakat.",
  },
];

const services = [
  {
    icon: "+",
    title: "General Contractor",
    description:
      "Pelaksanaan proyek konstruksi dari persiapan hingga penyelesaian dengan pengelolaan pekerjaan yang terarah.",
    details: [
      "Pekerjaan konstruksi umum",
      "Persiapan dan pelaksanaan proyek",
      "Koordinasi tenaga dan pekerjaan",
      "Pengawasan kualitas pekerjaan",
    ],
  },
  {
    icon: "+",
    title: "Renovasi & Perbaikan",
    description:
      "Renovasi dan perbaikan bangunan untuk meningkatkan fungsi, kenyamanan, dan kondisi bangunan.",
    details: [
      "Renovasi rumah dan bangunan",
      "Perbaikan ruang dan fasilitas",
      "Perbaikan struktur dan finishing",
      "Pekerjaan pemeliharaan bangunan",
    ],
  },
  {
    icon: "+",
    title: "Supplier Material",
    description:
      "Penyediaan material dan kebutuhan proyek konstruksi dengan pilihan material yang sesuai kebutuhan.",
    details: [
      "Pengadaan material konstruksi",
      "Material sesuai kebutuhan proyek",
      "Koordinasi kebutuhan dan pengiriman",
      "Penyesuaian dengan anggaran proyek",
    ],
  },
  {
    icon: "+",
    title: "Pekerjaan Sipil",
    description:
      "Pekerjaan sipil untuk mendukung pembangunan lingkungan, fasilitas, dan infrastruktur skala kecil hingga menengah.",
    details: [
      "Pekerjaan pondasi",
      "Drainase dan saluran",
      "Pekerjaan jalan dan halaman",
      "Pekerjaan sipil lainnya",
    ],
  },
];

function ServiceIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    contractor: "🏗️",
    renovasi: "🔧",
    supplier: "📦",
    sipil: "🛣️",
  };

  return (
    <span
      role="img"
      aria-label="Ikon layanan"
      style={{
        fontSize: "24px",
        lineHeight: 1,
      }}
    >
      {icons[type] ?? "🏗️"}
    </span>
  );
}
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (window.location.pathname === "/login") {
    return <Login />;
  }

  if (window.location.pathname.startsWith("/dashboard")) {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app">

      <header className="navbar">
        <div className="container navbar-inner">

          <a href="#beranda" className="brand" onClick={closeMenu}>
            <img src="/logo/logo-kiral.png" alt="KM" className="brand-logo" />

            <div className="brand-text">
              <strong>CV. KIRAL MIQDAD</strong>
              <span>General Contractor &amp; Suplayer</span>
            </div>
          </a>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "×" : "☰"}
          </button>

          <nav className={menuOpen ? "nav nav-open" : "nav"}>
            <a href="#beranda" onClick={closeMenu}>Beranda</a>
            <a href="#tentang" onClick={closeMenu}>Tentang Kami</a>
            <a href="#layanan" onClick={closeMenu}>Layanan</a>
            <a href="#proyek" onClick={closeMenu}>Proyek</a>
            <a href="#keunggulan" onClick={closeMenu}>Keunggulan</a>
            <a href="#kontak" onClick={closeMenu}>Kontak</a>

            <a className="nav-cta" href="#kontak" onClick={closeMenu}>
               Hubungi Kami
            </a>
          </nav>

        </div>
      </header>


      <main>

        <section className="hero" id="beranda">

          <div className="hero-photo" />

          <div className="hero-overlay" />

          <div className="container hero-content">

            <div className="hero-left">

              <div className="eyebrow">
                <i />
                GENERAL CONTRACTOR &amp; SUPPLIER
              </div>

              <h1>
                Membangun
                <br />
                Dengan <span>Kualitas</span>
                <br />
                Untuk Masa Depan
              </h1>

              <p>
                CV. Kiral Miqdad hadir sebagai mitra terpercaya dalam bidang
                konstruksi dan pengadaan, dengan komitmen terhadap kualitas,
                ketepatan waktu dan hasil yang terbaik.
              </p>

              <div className="hero-buttons">
                <a href="\#proyek" className="button green">
                  Lihat Proyek Kami →
                </a>

                <a href="\#kontak" className="button outline">
                  Hubungi Kami
                </a>
              </div>

            </div>


            <div className="trust-card">

              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <div>
                  <strong>Profesional</strong>
                  <small>Tenaga ahli berpengalaman</small>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <div>
                  <strong>Berkualitas</strong>
                  <small>Mengutamakan standar mutu</small>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <div>
                  <strong>Tepat Waktu</strong>
                  <small>Sesuai jadwal yang direncanakan</small>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <div>
                  <strong>Terpercaya</strong>
                  <small>Komitmen untuk klien</small>
                </div>
              </div>

            </div>

          </div>

          <div className="hero-caption">
            Proyek Pembangunan Saluran Irigasi
            <br />
            Lombok Tengah, NTB
          </div>

        </section>


        <section className="services" id="layanan">

          <div className="container">

            <div className="section-heading centered">

              <div className="section-label">
                <i />
                LAYANAN KAMI
              </div>

              <h2>Solusi Konstruksi yang Lengkap</h2>

              <p>
                Kami menyediakan berbagai layanan konstruksi dan pengadaan
                untuk mendukung pembangunan infrastruktur dan fasilitas umum.
              </p>

            </div>


            <div className="services-grid premium-services-grid">
              {services.map((service) => {
                const isOpen = selectedService === service.title;

                return (
                  <article
                    className={`service-card premium-service-card ${isOpen ? "is-open" : ""}`}
                    key={service.title}
                  >
                    <div className="service-card-top">
                      <div className="service-icon premium-service-icon">
                        <ServiceIcon type={service.icon} />
                      </div>

                      <span className="service-number">
                        {String(services.indexOf(service) + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3>{service.title}</h3>
                    <p>{service.description}</p>

                    <button
                      type="button"
                      className="service-detail-button"
                      onClick={() =>
                        setSelectedService(isOpen ? null : service.title)
                      }
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Tutup Detail" : "Selengkapnya"}
                      <span>{isOpen ? "-" : "+"}</span>
                    </button>

                    {isOpen && (
                      <div className="service-detail">
                        <div className="service-detail-label">
                          Ruang Lingkup
                        </div>

                        <ul>
                          {service.details.map((detail) => (
                            <li key={detail}>
                              <span>+</span>
                              {detail}
                            </li>
                          ))}
                        </ul>

                        <a
                          href="#kontak"
                          onClick={() => setSelectedService(null)}
                        >
                          Konsultasikan Proyek
                          <span>+</span>
                        </a>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

          </div>

        </section>


        <section className="projects" id="proyek">

          <div className="container">

            <div className="projects-heading">

              <div>

                <div className="section-label">
                  <i />
                  PROYEK KAMI
                </div>

                <h2>Pengalaman dalam Berbagai Pekerjaan</h2>

                <p>
                  Berikut beberapa contoh proyek yang telah kami kerjakan.
                </p>

              </div>

              <a href="\#proyek" className="view-projects">
                Lihat Semua Proyek →
              </a>

            </div>


            <div className="projects-grid">

              {projects.map((project) => (
                <article className="project-card" key={project.title}>

                  <div className="project-photo">

                    <img
                      src={project.image}
                      alt={project.title}
                    />

                    <span className="category">
                      {project.category}
                    </span>

                  </div>

                  <div className="project-body">

                    <h3>{project.title}</h3>

                    <div className="location">
                      ⌖ {project.location}
                    </div>

                    <p>{project.description}</p>

                  </div>

                </article>
              ))}

            </div>

          </div>

        </section>


        <section className="about" id="tentang">

          <div className="container about-grid">

            <div className="about-photo">

              <img
                src="/images/puskesmas-tentang-kami.png"
                alt="Pekerjaan konstruksi"
              />

              <div className="about-badge">
                <strong>KM</strong>
                <span>General Contractor</span>
              </div>

            </div>


            <div className="about-text">

              <div className="section-label">
                <i />
                TENTANG KAMI
              </div>

              <h2>
                Membangun dengan
                <br />
                <span>standar profesional.</span>
              </h2>

              <p>
                CV. Kiral Miqdad merupakan perusahaan General Contractor &
                Supplier yang berkomitmen memberikan solusi konstruksi
                berkualitas dan dapat dipercaya.
              </p>

              <p>
                Kami mengutamakan profesionalisme, kualitas pekerjaan,
                ketepatan pelaksanaan dan hubungan jangka panjang dengan
                setiap klien.
              </p>

              <div className="about-points">
                <div>✓ Tenaga profesional berpengalaman</div>
                <div>✓ Mengutamakan kualitas dan keselamatan</div>
                <div>◷ Komitmen terhadap ketepatan waktu</div>
              </div>

            </div>

          </div>

        </section>


        <section className="why" id="keunggulan">

          <div className="container why-grid">

            <div>

              <div className="section-label white">
                <i />
                KENAPA KAMI
              </div>

              <h2>
                Dibangun dengan standar.
                <br />
                <span>Dijaga dengan komitmen.</span>
              </h2>

              <p>
                Setiap proyek kami kerjakan dengan perencanaan, koordinasi
                dan pengawasan yang baik untuk menghasilkan pekerjaan yang
                berkualitas.
              </p>

            </div>


            <div className="why-list">

              <div>
                <b>01</b>
                <h3>Profesional</h3>
                <p>Pelaksanaan pekerjaan terencana dan bertanggung jawab.</p>
              </div>

              <div>
                <b>02</b>
                <h3>Kualitas</h3>
                <p>Mengutamakan standar mutu dalam setiap pekerjaan.</p>
              </div>

              <div>
                <b>03</b>
                <h3>Tepat Waktu</h3>
                <p>Menjaga target pekerjaan sesuai jadwal.</p>
              </div>

              <div>
                <b>04</b>
                <h3>Terpercaya</h3>
                <p>Membangun hubungan kerja yang transparan.</p>
              </div>

            </div>

          </div>

        </section>


        <section className="contact" id="kontak">

          <div className="contact-photo" />

          <div className="contact-overlay" />

          <div className="container contact-inner">

            <div>

              <div className="section-label white">
                <i />
                HUBUNGI KAMI
              </div>

              <h2>Siap Membangun Proyek Bersama?</h2>

              <p>
                Diskusikan kebutuhan konstruksi dan pengadaan proyek Anda
                bersama tim CV. Kiral Miqdad.
              </p>

            </div>

            <a
              href="https://wa.me/6281916056202"
              target="_blank"
              rel="noreferrer"
              className="whatsapp"
            >
              Hubungi Kami Sekarang
            </a>

          </div>

        </section>

      </main>


      <footer className="footer">

        <div className="container footer-grid">

          <div className="footer-company">

            <div className="brand">

              <img src="/logo/logo-kiral.png" alt="KM" className="brand-logo" />

              <div className="brand-text">
                <strong>CV. KIRAL MIQDAD</strong>
                <span>General Contractor &amp; Suplayer</span>
              </div>

            </div>

            <p>
              Membangun dengan kualitas, ketepatan dan bersama tim
              CV. Kiral Miqdad.
            </p>

          </div>


          <div className="footer-column">

            <h4>Menu</h4>

            <a href="#beranda">Beranda</a>
            <a href="#tentang">Tentang Kami</a>
            <a href="#layanan">Layanan</a>
            <a href="#proyek">Proyek</a>
            <a href="#keunggulan">Keunggulan</a>
            <a href="#kontak">Kontak</a>

          </div>


          <div className="footer-column">

            <h4>Kontak</h4>

            <p>☎ &nbsp; +62 819 1605 6202</p>
            <p>✉ &nbsp; cvkiralmiqdad@gmail.com</p>
            <p>⌖ &nbsp; Jl. Praya - Mantang - Bidin</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Mertak Tombok - Praya</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lombok Tengah, NTB</p>

          </div>


          <div className="footer-column">

            <h4>Ikuti Kami</h4>

            <div className="social">
              <span>f</span>
              <span>?</span>
              <span>?</span>
            </div>

          </div>

        </div>


        <div className="container footer-bottom">

          <span>
            ? {new Date().getFullYear()} CV. Kiral Miqdad. All rights reserved.
          </span>

          <span>General Contractor &amp; Supplier</span>

        </div>

      </footer>

    </div>
  );
}

export default App;










