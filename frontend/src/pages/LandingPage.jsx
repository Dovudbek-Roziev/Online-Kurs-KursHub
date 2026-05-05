import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiOutlineArrowRight, HiOutlinePlay, HiOutlineShieldCheck, HiOutlineSparkles } from "react-icons/hi";

import SectionHeading from "../components/ui/SectionHeading";
import CourseCard from "../components/ui/CourseCard";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";

export default function LandingPage() {
  const { t } = useSettings();
  const { user, isAdmin } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    apiFetch("/courses")
      .then((data) => setFeaturedCourses(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setFeaturedCourses([]));
  }, []);

  const features = [
    { title: t("premiumDelivery"), description: t("premiumDeliveryText"), icon: HiOutlineSparkles },
    { title: t("structuredOutcomes"), description: t("structuredOutcomesText"), icon: HiOutlineShieldCheck },
    { title: t("operationalControl"), description: t("operationalControlText"), icon: HiOutlinePlay }
  ];


  const previewCourses = [...featuredCourses].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, user ? 3 : 2);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="shell relative py-24 lg:py-40 flex flex-col items-center text-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-zinc-500 rounded-full filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-zinc-400 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-zinc-300 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="animate-reveal">
          <span className="eyebrow mx-auto mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-strong)] border border-[var(--border-soft)] text-[var(--text-main)] text-sm font-semibold tracking-wide uppercase shadow-sm">
            <HiOutlineSparkles className="text-lg" />
            {t("modernCourseSaas")}
          </span>
        </div>
        
        <h1 className="max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.1] mb-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {t("landingTitle").split(' ').map((word, i) => (
            <span key={i} className={i % 2 !== 0 ? "text-gradient" : ""}>
              {word}{" "}
            </span>
          ))}
        </h1>
        
        <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-[var(--text-soft)] mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {t("landingText")}
        </p>

        <div className="flex flex-col sm:flex-row gap-5 items-center justify-center animate-reveal" style={{ animationDelay: '0.3s' }}>
          <Link to="/courses" className="primary-btn !py-4 !px-8 !text-base gap-2 group w-full sm:w-auto shadow-xl">
            {t("exploreCourses")}
            <HiOutlineArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
          </Link>
          {isAdmin ? (
            <Link to="/admin" className="secondary-btn !py-4 !px-8 !text-base w-full sm:w-auto hover:bg-[var(--text-main)] hover:text-[var(--bg)]">
              {t("openDashboard")}
            </Link>
          ) : null}
        </div>
      </section>



      {/* Features Section */}
      <section className="shell space-y-12 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <SectionHeading
            eyebrow={t("capabilities")}
            title={t("capabilitiesTitle")}
            description={t("capabilitiesText")}
            align="center"
          />
        </div>
        <div className="grid gap-8 md:grid-cols-3 stagger-in">
          {features.map(({ title, description, icon: Icon }) => (
            <article key={title} className="panel p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--text-main)] text-[var(--bg)] mb-6 shadow-lg">
                <Icon className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-4">{title}</h3>
              <p className="text-base leading-relaxed text-[var(--text-soft)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="shell space-y-12 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow={t("featuredLibrary")}
              title={t("featuredLibraryTitle")}
              description={t("featuredLibraryText")}
            />
          </div>
          <Link to="/courses" className="secondary-btn shrink-0">{t("browseCatalog")}</Link>
        </div>
        
        {!user ? <p className="text-sm font-medium text-[var(--text-dim)]">{t("guestLimited")}</p> : null}
        
        <div className="grid-auto">
          {previewCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
