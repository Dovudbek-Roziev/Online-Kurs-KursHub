import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { FiBook, FiBookmark, FiBell, FiAward, FiMessageSquare, FiTrendingUp, FiDownload, FiChevronRight, FiCheckCircle, FiAlertTriangle, FiX, FiRefreshCw } from "react-icons/fi";

export default function ProfilePage() {
  const { token } = useAuth();
  const { language, t } = useSettings();
  const lbl = (uz, ru) => language === "ru" ? ru : uz;
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([apiFetch("/profile", { token }), apiFetch("/notifications", { token })])
      .then(([profileData, notificationData]) => {
        setProfile(profileData);
        setNotifications(notificationData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  
  const averageProgress = useMemo(() => {
    if (!profile?.purchasedCourses?.length) return 0;
    return Math.round(
      profile.purchasedCourses.reduce((sum, item) => sum + Number(item.percent || 0), 0) / profile.purchasedCourses.length
    );
  }, [profile]);

  async function downloadCertificate(courseId) {
    setCertError("");
    setDownloading(courseId);
    try {
      const blob = await apiFetch(`/profile/certificate/${courseId}`, { token });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setProfile(prev => ({
        ...prev,
        certificates: prev.certificates.map(c =>
          String(c.course._id) === String(courseId) ? { ...c, alreadyIssued: true, issuedAt: c.issuedAt || new Date().toISOString() } : c
        ),
        purchasedCourses: prev.purchasedCourses.map(c =>
          String(c.course._id) === String(courseId) ? { ...c, alreadyIssued: true } : c
        ),
      }));
    } catch (err) {
      setCertError(err.message);
    } finally {
      setDownloading(null);
    }
  }

  async function markRead(notificationId) {
    await apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH", token });
    setNotifications((prev) => prev.map((item) => (item._id === notificationId ? { ...item, read: true } : item)));
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-[2rem] bg-red-500/10 p-8 text-center border border-red-500/20 backdrop-blur-xl">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border-soft)] opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-dim)] animate-pulse">{t("profileLoading")}</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: t("overview"), icon: FiTrendingUp },
    { id: "courses", label: t("myCourses"), icon: FiBook },
    { id: "bookmarks", label: t("bookmarkedCourses"), icon: FiBookmark },
    { id: "certs", label: t("certificatesSection"), icon: FiAward },
    { id: "notifications", label: t("notifications"), icon: FiBell },
    { id: "comments", label: t("yourComments"), icon: FiMessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">

      {/* certError toast */}
      {certError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-rose-600/30">
          <FiAlertTriangle size={16} />
          {certError === "ERR_CERTIFICATE_ALREADY_ISSUED"
            ? lbl("Sertifikat allaqachon berilgan", "Сертификат уже был выдан ранее")
            : certError}
          <button onClick={() => setCertError("")} className="ml-2 opacity-70 hover:opacity-100">
            <FiX size={14} />
          </button>
        </div>
      )}
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-[var(--border-soft)] bg-[var(--surface)] pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] items-center gap-16 lg:gap-24">
            
            {/* Left: Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 text-center md:text-left">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="absolute inset-0 rounded-[3rem] bg-[var(--accent)] blur-3xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative flex h-40 w-40 items-center justify-center rounded-[3rem] bg-gradient-to-br from-[var(--text-main)] to-[var(--text-soft)] text-6xl font-black text-[var(--bg)] shadow-2xl border border-white/10">
                  {(profile.user.name || "U")[0].toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[var(--accent)] bg-[var(--accent)]/5 px-4 py-1.5 rounded-xl border border-[var(--accent)]/10">{t("personalCabinet")}</span>
                  <h1 className="mt-6 text-5xl sm:text-7xl font-black text-[var(--text-main)] tracking-tighter leading-none">{profile.user.name}</h1>
                  <p className="text-[var(--text-soft)] font-medium mt-4 text-xl opacity-80">{profile.user.email}</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="px-6 py-2.5 rounded-2xl bg-[var(--surface-sunken)] border border-[var(--border-soft)] text-[11px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                    {profile.user.role === "admin" ? t("adminRole") : t("studentRole")}
                  </span>
                  <span className="px-6 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    {t("courseProgress")}: {averageProgress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-5 w-full lg:w-[480px]">
              {[
                { label: t("myCourses"), value: profile.purchasedCourses.length, icon: FiBook, color: "text-blue-500", bg: "bg-blue-500/5" },
                { label: t("savedSection"), value: profile.bookmarks.length, icon: FiBookmark, color: "text-rose-500", bg: "bg-rose-500/5" },
                { label: t("certificate"), value: profile.certificates.length, icon: FiAward, color: "text-amber-500", bg: "bg-amber-500/5" },
                { label: t("notifications"), value: unreadCount, icon: FiBell, color: "text-purple-500", bg: "bg-purple-500/5" }
              ].map((stat, i) => (
                <div key={i} className={`bg-[var(--surface-strong)]/50 backdrop-blur-2xl border border-[var(--border-soft)] p-8 rounded-[3rem] text-center shadow-sm hover:scale-[1.03] transition-all hover:border-[var(--accent)]/20 ${stat.bg}`}>
                  <stat.icon className={`mx-auto mb-4 text-2xl ${stat.color}`} />
                  <p className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-10 relative z-10">
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-2.5 bg-[var(--surface-strong)]/90 backdrop-blur-3xl border border-[var(--border-soft)] rounded-[2.5rem] shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 whitespace-nowrap px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-[var(--text-main)] text-[var(--bg)] shadow-xl scale-105" 
                  : "text-[var(--text-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-main)]"
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
              {tab.id === "notifications" && unreadCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-[var(--bg)] ml-1 shadow-lg shadow-red-500/30">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Panel */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="min-h-[500px]">
          {activeTab === "overview" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div className="space-y-8">
                {/* Active Courses */}
                <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">{t("learning")}</h2>
                    <Link to="/courses" className="text-xs font-black text-[var(--accent)] uppercase tracking-widest hover:underline">{t("navCourses")}</Link>
                  </div>
                  
                  <div className="grid gap-6">
                    {profile.purchasedCourses.length ? (
                      profile.purchasedCourses.slice(0, 3).map((item) => (
                        <div key={item.course._id} className="group relative bg-[var(--surface-sunken)] border border-[var(--border-soft)] rounded-3xl p-6 transition-all hover:border-[var(--accent)]/50 hover:shadow-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="min-w-0 flex-1 space-y-3">
                              <h3 className="text-lg font-black text-[var(--text-main)] truncate">{item.course.title}</h3>
                              <div className="flex items-center gap-4">
                                <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000" style={{ width: `${item.percent}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase">{item.percent}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <Link to={`/courses/${item.course._id}`} className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border-soft)] text-xs font-black uppercase text-[var(--text-main)] text-center hover:bg-[var(--surface-strong)] transition-all">
                                {t("viewCourse")}
                              </Link>
                              {item.eligibleCertificate && (
                                <button
                                  onClick={() => downloadCertificate(item.course._id)}
                                  disabled={downloading === item.course._id}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-[var(--bg)] text-xs font-black uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 disabled:opacity-60 transition-all"
                                >
                                  {downloading === item.course._id
                                    ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    : item.alreadyIssued ? <FiRefreshCw size={13} /> : <FiDownload size={13} />}
                                  {item.alreadyIssued ? lbl("Qayta", "Ещё раз") : t("certificate")}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-[var(--border-soft)] rounded-3xl">
                        <p className="text-sm font-bold text-[var(--text-dim)]">{t("noPurchasedCourses")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Quick Notifications */}
              <div className="space-y-6">
                <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-8 shadow-sm">
                  <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-6">{t("latestNews")}</h2>
                  <div className="space-y-4">
                    {notifications.length ? (
                      notifications.slice(0, 3).map((item) => (
                        <div key={item._id} className={`p-4 rounded-2xl border transition-all ${item.read ? 'bg-[var(--surface-sunken)] border-[var(--border-soft)]' : 'bg-[var(--accent)]/5 border-[var(--accent)]/20 shadow-sm'}`}>
                          <div className="flex justify-between gap-2 mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${item.read ? 'text-[var(--text-dim)]' : 'text-[var(--accent)]'}`}>
                              {item.read ? t("read") : t("new")}
                            </span>
                            {!item.read && (
                              <button onClick={() => markRead(item._id)} className="text-[9px] font-black uppercase text-[var(--accent)] hover:underline">
                                {t("markRead")}
                              </button>
                            )}
                          </div>
                          <p className="text-xs font-medium text-[var(--text-main)] leading-relaxed">{t(item.text) || item.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs font-bold text-[var(--text-dim)]">{t("noNotifications")}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-10">
              <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-10">{t("myCourses")}</h2>
              <div className="grid gap-6">
                {profile.purchasedCourses.length ? (
                  profile.purchasedCourses.map((item) => (
                    <div key={item.course._id} className="bg-[var(--surface-sunken)] border border-[var(--border-soft)] rounded-3xl p-8 transition-all hover:shadow-xl group">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                        <div className="h-24 w-40 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-soft)]">
                          <img src={item.course.thumbnail} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] text-[9px] font-black uppercase text-[var(--text-dim)]">{item.course.category}</span>
                            <h3 className="text-xl font-black text-[var(--text-main)] truncate">{item.course.title}</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 bg-[var(--surface)] rounded-full overflow-hidden p-0.5">
                              <div className="h-full bg-[var(--accent)] rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" style={{ width: `${item.percent}%` }}></div>
                            </div>
                            <span className="text-xs font-black text-[var(--text-main)]">{item.percent}%</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                          <Link to={`/courses/${item.course._id}`} className="flex-1 lg:flex-none px-8 py-3 rounded-2xl bg-[var(--text-main)] text-[var(--bg)] text-xs font-black uppercase text-center hover:opacity-90 transition-all">
                            {t("startLearning")}
                          </Link>
                          {item.eligibleCertificate && (
                            <button
                              onClick={() => downloadCertificate(item.course._id)}
                              disabled={downloading === item.course._id}
                              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border-2 border-emerald-500 text-emerald-500 text-xs font-black uppercase hover:bg-emerald-500 hover:text-white disabled:opacity-60 transition-all"
                            >
                              {downloading === item.course._id
                                ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                : item.alreadyIssued ? <FiRefreshCw size={13} /> : <FiAward size={13} />}
                              {item.alreadyIssued ? lbl("Qayta yuklab olish", "Скачать ещё раз") : t("certificate")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <p className="text-[var(--text-dim)] font-bold">{t("noPurchasedCourses")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-10">
              <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-10">{t("bookmarkedCourses")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.bookmarks.length ? (
                  profile.bookmarks.map((course) => (
                    <Link key={course._id} to={`/courses/${course._id}`} className="group relative bg-[var(--surface-sunken)] border border-[var(--border-soft)] rounded-[2rem] overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl">
                      <div className="aspect-video w-full">
                        <img src={course.thumbnail} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="p-6">
                        <span className="px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] text-[9px] font-black uppercase text-[var(--text-dim)]">{course.category}</span>
                        <h3 className="mt-3 text-lg font-black text-[var(--text-main)] line-clamp-2">{course.title}</h3>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-xs font-black text-[var(--accent)] uppercase">{t("preview")}</span>
                          <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 border-2 border-dashed border-[var(--border-soft)] rounded-[2.5rem]">
                    <FiBookmark className="mx-auto text-4xl text-[var(--text-dim)] opacity-20 mb-4" />
                    <p className="text-[var(--text-dim)] font-bold">{t("noSavedCourses")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "certs" && (
            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">{t("certificatesSection")}</h2>
              </div>
              <div className="grid gap-5">
                {profile.certificates.length ? (
                  profile.certificates.map(({ course, alreadyIssued, issuedAt }) => (
                    <div key={course._id} className={`relative rounded-3xl border p-7 flex flex-col md:flex-row items-center justify-between gap-7 transition-all ${
                      alreadyIssued
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-[var(--surface-sunken)] border-[var(--border-soft)] hover:border-emerald-500/30"
                    }`}>
                      {/* Left */}
                      <div className="flex items-center gap-5 min-w-0">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          alreadyIssued ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {alreadyIssued ? <FiCheckCircle /> : <FiAward />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-black text-[var(--text-main)] truncate">{course.title}</h3>
                          {alreadyIssued ? (
                            <p className="text-xs font-bold text-emerald-500 mt-1">
                              {lbl("Sertifikat olindi", "Сертификат получен")}
                              {issuedAt && ` · ${new Date(issuedAt).toLocaleDateString(language === "ru" ? "ru-RU" : "uz-UZ")}`}
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest mt-1">{t("courseCompleted")}</p>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-center gap-1.5 w-full md:w-auto">
                        <button
                          onClick={() => downloadCertificate(course._id)}
                          disabled={downloading === course._id}
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase shadow-xl shadow-emerald-600/25 hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-60 transition-all"
                        >
                          {downloading === course._id
                            ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            : alreadyIssued ? <FiRefreshCw size={14} /> : <FiDownload size={14} />}
                          {alreadyIssued ? lbl("Qayta yuklab olish", "Скачать ещё раз") : t("pdfDownload")}
                        </button>
                        {alreadyIssued && issuedAt && (
                          <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                            <FiCheckCircle size={9} />
                            {lbl("Berilgan:", "Выдан:")} {new Date(issuedAt).toLocaleDateString(language === "ru" ? "ru-RU" : "uz-UZ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-[var(--surface-sunken)] rounded-[2.5rem] border border-[var(--border-soft)]">
                    <FiAward className="mx-auto text-5xl text-[var(--text-dim)] opacity-10 mb-4" />
                    <p className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest">{t("noCertificates")}</p>
                    <p className="text-xs font-medium text-[var(--text-dim)] mt-2">{t("noCertificatesHint")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-10">
              <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-10">{t("notifications")}</h2>
              <div className="space-y-4">
                {notifications.length ? (
                  notifications.map((item) => (
                    <div key={item._id} className={`p-6 rounded-3xl border flex items-center justify-between gap-6 transition-all ${item.read ? 'bg-[var(--surface-sunken)] border-[var(--border-soft)] opacity-70' : 'bg-[var(--accent)]/5 border-[var(--accent)] shadow-sm'}`}>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.read ? 'text-[var(--text-dim)]' : 'text-[var(--accent)]'}`}>
                          {item.read ? t("read") : t("new")}
                        </span>
                        <p className="text-sm font-bold text-[var(--text-main)]">{t(item.text) || item.text}</p>
                      </div>
                      {!item.read && (
                        <button onClick={() => markRead(item._id)} className="px-6 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg)] text-[10px] font-black uppercase shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all">
                          {t("markRead")}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <p className="text-[var(--text-dim)] font-bold">{t("noNotifications")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-[2.5rem] p-10">
              <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-10">{t("yourComments")}</h2>
              <div className="grid gap-6">
                {profile.comments.length ? (
                  profile.comments.map((item) => (
                    <div key={item._id} className="bg-[var(--surface-sunken)] border border-[var(--border-soft)] rounded-3xl p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FiMessageSquare className="text-[var(--accent)]" />
                          <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest">{item.courseTitle || t("courseLabel")}</span>
                        </div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">
                          {new Date(item.createdAt).toLocaleDateString(language === "ru" ? "ru-RU" : "uz-UZ")}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] italic text-[var(--text-soft)] text-sm">
                        "{item.text}"
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[var(--text-dim)]">
                          {item.videoTitle ? t("lessonPrefix", { title: item.videoTitle }) : t("videoNotFound")}
                        </p>
                        {item.videoId && (
                          <Link to={`/videos/${item.videoId}`} className="text-xs font-black text-[var(--accent)] uppercase hover:underline">{t("viewCourse")}</Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <FiMessageSquare className="mx-auto text-4xl text-[var(--text-dim)] opacity-20 mb-4" />
                    <p className="text-[var(--text-dim)] font-bold">{t("commentsNotFound")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
