import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiAlertCircle, FiBarChart2, FiBook, FiCheckCircle, FiEdit3,
  FiGlobe, FiLayers, FiMoon, FiPlus, FiRefreshCcw, FiSun,
  FiTrash2, FiUsers, FiVideo, FiX, FiTrendingUp, FiAward
} from "react-icons/fi";
import AdminSidebar from "../components/admin/AdminSidebar";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const initialCourse  = { title: "", description: "", category: "", price: 0, isPublished: true, thumbnail: null, outcomes: "" };
const initialChapter = { courseId: "", title: "", order: 1 };
const initialVideo   = { courseId: "", chapterId: "", title: "", description: "", order: 1, video: null };

/* ─── tiny shared atoms ─── */
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] ${className}`}>
      {children}
    </div>
  );
}

function IconBtn({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--text-soft)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text-main)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyState({ t }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-soft)] p-8 text-center text-sm font-semibold text-[var(--text-dim)]">
      {t("noDataYet")}
    </div>
  );
}

function PanelHeader({ title, action }) {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
      <h2 className="text-lg font-black text-[var(--text-main)]">{title}</h2>
      {action}
    </div>
  );
}

function CourseSelect({ value, courses, t, onChange, required = false }) {
  return (
    <select className="input-ui w-full" value={value} onChange={e => onChange(e.target.value)} required={required}>
      <option value="">{t("selectCourse")}</option>
      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
    </select>
  );
}

function StatusPill({ live, t }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${live ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
      {live ? t("statusLive") : t("statusDraft")}
    </span>
  );
}

function CourseThumb({ course }) {
  return (
    <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)]">
      {course.thumbnail
        ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
        : <div className="flex h-full items-center justify-center text-[var(--text-dim)]"><FiBook size={14} /></div>}
    </div>
  );
}

function ModalWrapper({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] sm:max-w-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
          <div className="h-1 w-10 rounded-full bg-[var(--border-soft)] mx-auto sm:hidden absolute top-3 left-1/2 -translate-x-1/2" />
          <div />
          <IconBtn onClick={onClose}><FiX size={16} /></IconBtn>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── main page ─── */
export default function AdminDashboardPage() {
  const { isAdmin, token } = useAuth();
  const { t, language, setLanguage, theme, setTheme } = useSettings();
  const location = useLocation();
  const [activeTab,      setActiveTab]      = useState(location.state?.activeTab || "analytics");
  const [analytics,      setAnalytics]      = useState(null);
  const [courses,        setCourses]        = useState([]);
  const [users,          setUsers]          = useState([]);
  const [chapters,       setChapters]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [message,        setMessage]        = useState("");
  const [error,          setError]          = useState("");
  const [deletingId,     setDeletingId]     = useState("");
  const [modal,          setModal]          = useState("");
  const [editingCourseId,setEditingCourseId]= useState("");
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [newPassword,    setNewPassword]    = useState("");
  const [courseForm,     setCourseForm]     = useState(initialCourse);
  const [chapterForm,    setChapterForm]    = useState(initialChapter);
  const [videoForm,      setVideoForm]      = useState(initialVideo);

  const tab = activeTab.replace("admin-", "");
  const adminUsers   = useMemo(() => users.filter(u => u.role === "admin"),  [users]);
  const studentUsers = useMemo(() => users.filter(u => u.role !== "admin"),  [users]);

  const metrics = useMemo(() => [
    { label: t("monthlyRevenue"),  value: `$${analytics?.revenue || 0}`,                      icon: FiTrendingUp, color: "from-indigo-500 to-violet-500" },
    { label: t("activeStudents"),  value: String(analytics?.activeUsers || users.length),     icon: FiUsers,      color: "from-violet-500 to-purple-500" },
    { label: t("courses"),         value: String(courses.length),                             icon: FiBook,       color: "from-purple-500 to-pink-500" },
    { label: t("videos"),          value: String(analytics?.topLikedVideos?.length || 0),     icon: FiVideo,      color: "from-pink-500 to-rose-500" },
  ], [analytics, courses.length, t, users.length]);

  const tabs = [
    { id: "analytics", label: t("analytics"), icon: FiBarChart2 },
    { id: "courses",   label: t("courses"),   icon: FiBook },
    { id: "chapters",  label: t("chapters"),  icon: FiLayers },
    { id: "videos",    label: t("videos"),    icon: FiVideo },
    { id: "users",     label: t("users"),     icon: FiUsers },
  ];

  async function refresh() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [a, c, u] = await Promise.all([
        apiFetch("/admin/analytics", { token }),
        apiFetch("/courses", { token }),
        apiFetch("/admin/users", { token }),
      ]);
      setAnalytics(a); setCourses(c); setUsers(u);
    } catch (err) { setError(t(err.message) || err.message); }
    finally { setLoading(false); }
  }

  async function loadChapters(courseId) {
    if (!courseId) { setChapters([]); return; }
    try { const d = await apiFetch(`/courses/${courseId}`, { token }); setChapters(d.chapters || []); }
    catch { setChapters([]); }
  }

  useEffect(() => { refresh(); }, [token]);
  useEffect(() => { loadChapters(videoForm.courseId); }, [videoForm.courseId]);
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(""); setError(""); }, 3500);
    return () => clearTimeout(t);
  }, [message, error]);

  function closeModal() {
    setModal(""); setEditingCourseId(""); setSelectedUser(null); setNewPassword("");
    setCourseForm(initialCourse); setChapterForm(initialChapter); setVideoForm(initialVideo);
  }

  function openCourseModal(course) {
    if (course) {
      setEditingCourseId(course._id);
      setCourseForm({ title: course.title || "", description: course.description || "", category: course.category || "", price: course.price || 0, isPublished: course.isPublished !== false, thumbnail: null, outcomes: Array.isArray(course.outcomes) ? course.outcomes.join("\n") : "" });
    } else {
      setCourseForm(initialCourse); setEditingCourseId("");
    }
    setModal("course");
  }

  async function handleSaveCourse(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", courseForm.title); fd.append("description", courseForm.description);
      fd.append("category", courseForm.category); fd.append("price", courseForm.price);
      fd.append("isPublished", String(courseForm.isPublished));
      if (courseForm.outcomes) fd.append("outcomes", JSON.stringify(courseForm.outcomes.split("\n").map(s => s.trim()).filter(Boolean)));
      if (courseForm.thumbnail) fd.append("thumbnail", courseForm.thumbnail);
      if (editingCourseId) { await apiFetch(`/admin/courses/${editingCourseId}`, { method: "PUT", token, body: fd }); setMessage(t("successUpdated")); }
      else { await apiFetch("/admin/courses", { method: "POST", token, body: fd }); setMessage(t("successAdded")); }
      closeModal(); refresh();
    } catch (err) { setError(t(err.message) || err.message); }
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm(t("confirmDelete", { title: t("courseLabelShort") }))) return;
    setDeletingId(id);
    try { await apiFetch(`/admin/courses/${id}`, { method: "DELETE", token }); setMessage(t("successDeleted")); refresh(); }
    catch (err) { setError(t(err.message) || err.message); }
    finally { setDeletingId(""); }
  }

  async function handleSaveChapter(e) {
    e.preventDefault();
    try {
      await apiFetch(`/admin/courses/${chapterForm.courseId}/chapters`, { method: "POST", token, body: { title: chapterForm.title, order: Number(chapterForm.order) } });
      setMessage(t("successAdded")); closeModal(); loadChapters(chapterForm.courseId); refresh();
    } catch (err) { setError(t(err.message) || err.message); }
  }

  async function handleDeleteChapter(id) {
    if (!window.confirm(t("confirmDelete", { title: t("chapters") }))) return;
    try { await apiFetch(`/admin/chapters/${id}`, { method: "DELETE", token }); setMessage(t("successDeleted")); loadChapters(chapterForm.courseId || videoForm.courseId); }
    catch (err) { setError(t(err.message) || err.message); }
  }

  async function handleSaveVideo(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", videoForm.title); fd.append("description", videoForm.description); fd.append("order", videoForm.order);
      if (videoForm.video) fd.append("video", videoForm.video);
      await apiFetch(`/admin/chapters/${videoForm.chapterId}/videos`, { method: "POST", token, body: fd });
      setMessage(t("successAdded")); closeModal(); loadChapters(videoForm.courseId);
    } catch (err) { setError(t(err.message) || err.message); }
  }

  async function handleDeleteVideo(id) {
    if (!window.confirm(t("confirmDelete", { title: t("videos") }))) return;
    try { await apiFetch(`/admin/videos/${id}`, { method: "DELETE", token }); setMessage(t("successDeleted")); loadChapters(videoForm.courseId); }
    catch (err) { setError(t(err.message) || err.message); }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    if (newPassword.length !== 6) { setError(t("ERR_PASSWORD_SHORT")); return; }
    try { await apiFetch(`/admin/users/${selectedUser._id}/password`, { method: "PUT", token, body: { newPassword } }); setMessage(t("passwordUpdatedSuccess")); closeModal(); }
    catch (err) { setError(t(err.message) || err.message); }
  }

  async function handleAssignCourse(e) {
    e.preventDefault();
    if (!selectedUser || !courseForm.courseId) return;
    try { await apiFetch("/admin/assign-course", { method: "POST", token, body: { userId: selectedUser._id, courseId: courseForm.courseId } }); setMessage(t("successAdded")); closeModal(); }
    catch (err) { setError(t(err.message) || err.message); }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-5">
        <Card className="max-w-sm w-full p-8 text-center shadow-xl">
          <FiAlertCircle className="mx-auto mb-4 text-4xl text-red-500" />
          <h1 className="mb-5 text-xl font-black text-[var(--text-main)]">{t("adminOnlyText")}</h1>
          <Link to="/courses" className="primary-btn w-full">{t("goCourses")}</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main — mobile: clear 72px topbar; desktop: clear 72px sidebar */}
      <main className="lg:pl-72 pt-[72px] lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">

          {/* ── Page header ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-dim)]">{t("operationsCenter")}</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text-main)] sm:text-3xl">{t("adminDashboard")}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-1">
                {["uz", "ru"].map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${language === lang ? "bg-[var(--text-main)] text-[var(--bg)] shadow-sm" : "text-[var(--text-soft)] hover:text-[var(--text-main)]"}`}>
                    <FiGlobe size={12} /> {lang}
                  </button>
                ))}
              </div>
              <IconBtn onClick={() => setTheme(theme === "light" ? "dark" : "light")} title={theme === "light" ? t("dark") : t("light")}>
                {theme === "light" ? <FiMoon size={15} /> : <FiSun size={15} />}
              </IconBtn>
              <IconBtn onClick={refresh} title={t("refresh") || "Refresh"}>
                <FiRefreshCcw size={15} className={loading ? "animate-spin" : ""} />
              </IconBtn>
            </div>
          </div>

          {/* ── Toast ── */}
          {(message || error) && (
            <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${error ? "border-red-500/20 bg-red-500/8 text-red-500" : "border-emerald-500/20 bg-emerald-500/8 text-emerald-600"}`}>
              {error ? <FiAlertCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
              {error || message}
            </div>
          )}

          {/* ── Metrics ── */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {metrics.map(m => {
              const Icon = m.icon;
              return (
                <Card key={m.label} className="p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white shadow-lg`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-dim)] leading-tight">{m.label}</p>
                  <strong className="mt-1 block text-2xl font-black text-[var(--text-main)]">{m.value}</strong>
                </Card>
              );
            })}
          </div>

          {/* ── Tab bar ── */}
          <div className="sticky top-[72px] lg:top-4 z-30">
            <div className="flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)]/95 p-1.5 backdrop-blur-xl shadow-lg no-scrollbar">
              {tabs.map(tb => {
                const Icon = tb.icon;
                const active = tab === tb.id;
                return (
                  <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${active ? "bg-[var(--text-main)] text-[var(--bg)] shadow-sm" : "text-[var(--text-soft)] hover:bg-[var(--surface)] hover:text-[var(--text-main)]"}`}>
                    <Icon size={14} /> {tb.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Analytics ── */}
          {tab === "analytics" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="shadow-sm">
                <PanelHeader title={t("topCourses")} />
                <div className="p-4 space-y-2">
                  {(analytics?.topCourses || []).map((c, i) => (
                    <div key={c._id || i} className="flex items-center gap-3 rounded-xl bg-[var(--surface-sunken)] px-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--border-soft)] text-xs font-black text-[var(--text-dim)]">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{c.title}</span>
                      <span className="shrink-0 text-xs font-bold text-[var(--text-dim)]">{c.views || 0} {t("viewsLabel")}</span>
                    </div>
                  ))}
                  {!analytics?.topCourses?.length && <EmptyState t={t} />}
                </div>
              </Card>
              <Card className="shadow-sm">
                <PanelHeader title={t("topUsers")} />
                <div className="p-4 space-y-2">
                  {(analytics?.mostActiveUsers || []).map((u, i) => (
                    <div key={`${u.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-[var(--surface-sunken)] px-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-black text-white">{u.name?.charAt(0) || "?"}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{u.name}</span>
                      <span className="shrink-0 text-xs font-bold text-[var(--text-dim)]">{u.total} {t("lessons")}</span>
                    </div>
                  ))}
                  {!analytics?.mostActiveUsers?.length && <EmptyState t={t} />}
                </div>
              </Card>
            </div>
          )}

          {/* ── Courses ── */}
          {tab === "courses" && (
            <Card className="overflow-hidden shadow-sm">
              <PanelHeader title={t("courses")} action={
                <button onClick={() => openCourseModal()} className="primary-btn !rounded-xl !px-4 !py-2 text-sm">
                  <FiPlus /> {t("createCourse")}
                </button>
              } />
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[var(--surface-sunken)]">
                    <tr className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                      <th className="px-5 py-3">{t("courseLabel")}</th>
                      <th className="px-5 py-3">{t("category")}</th>
                      <th className="px-5 py-3">{t("priceField")}</th>
                      <th className="px-5 py-3">{t("status")}</th>
                      <th className="px-5 py-3 text-right">{t("management")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-soft)]">
                    {courses.map(c => (
                      <tr key={c._id} className="hover:bg-[var(--surface-sunken)] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <CourseThumb course={c} />
                            <span className="font-bold text-sm">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[var(--text-soft)]">{c.category}</td>
                        <td className="px-5 py-3.5 text-sm font-bold">${c.price || 0}</td>
                        <td className="px-5 py-3.5"><StatusPill live={c.isPublished !== false} t={t} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-2">
                            <IconBtn onClick={() => openCourseModal(c)}><FiEdit3 size={14} /></IconBtn>
                            <IconBtn onClick={() => handleDeleteCourse(c._id)} disabled={deletingId === c._id} className="hover:border-red-500/30 hover:text-red-500"><FiTrash2 size={14} /></IconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!courses.length && <div className="p-5"><EmptyState t={t} /></div>}
              </div>
              {/* Mobile cards */}
              <div className="lg:hidden p-4 space-y-3">
                {courses.map(c => (
                  <div key={c._id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-3">
                    <div className="flex gap-3 items-start">
                      <CourseThumb course={c} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{c.title}</p>
                        <p className="text-xs text-[var(--text-dim)] mt-0.5">{c.category} · ${c.price || 0}</p>
                        <div className="mt-1.5"><StatusPill live={c.isPublished !== false} t={t} /></div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => openCourseModal(c)} className="secondary-btn flex-1 !rounded-xl !py-2 text-xs"><FiEdit3 size={13} /> {t("edit")}</button>
                      <button onClick={() => handleDeleteCourse(c._id)} disabled={deletingId === c._id} className="secondary-btn flex-1 !rounded-xl !py-2 text-xs hover:!text-red-500"><FiTrash2 size={13} /> {t("delete")}</button>
                    </div>
                  </div>
                ))}
                {!courses.length && <EmptyState t={t} />}
              </div>
            </Card>
          )}

          {/* ── Chapters ── */}
          {tab === "chapters" && (
            <Card className="shadow-sm">
              <PanelHeader title={t("chapters")} action={
                <button onClick={() => setModal("chapter")} className="primary-btn !rounded-xl !px-4 !py-2 text-sm">
                  <FiPlus /> {t("addChapter")}
                </button>
              } />
              <div className="p-4 space-y-4">
                <CourseSelect value={chapterForm.courseId} courses={courses} t={t} onChange={v => { setChapterForm(p => ({ ...p, courseId: v })); loadChapters(v); }} />
                <div className="space-y-2">
                  {chapters.map(ch => (
                    <div key={ch._id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] px-4 py-3">
                      <div>
                        <p className="font-bold text-sm">{ch.order}. {ch.title}</p>
                        <p className="text-xs text-[var(--text-dim)] mt-0.5">{ch.videos?.length || 0} {t("videos")}</p>
                      </div>
                      <IconBtn onClick={() => handleDeleteChapter(ch._id)} className="hover:border-red-500/30 hover:text-red-500"><FiTrash2 size={14} /></IconBtn>
                    </div>
                  ))}
                  {!chapters.length && <EmptyState t={t} />}
                </div>
              </div>
            </Card>
          )}

          {/* ── Videos ── */}
          {tab === "videos" && (
            <Card className="shadow-sm">
              <PanelHeader title={t("videos")} action={
                <button onClick={() => setModal("video")} className="primary-btn !rounded-xl !px-4 !py-2 text-sm">
                  <FiPlus /> {t("uploadVideo")}
                </button>
              } />
              <div className="p-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <CourseSelect value={videoForm.courseId} courses={courses} t={t} onChange={v => setVideoForm(p => ({ ...p, courseId: v, chapterId: "" }))} />
                  <select className="input-ui w-full" value={videoForm.chapterId} onChange={e => setVideoForm(p => ({ ...p, chapterId: e.target.value }))} disabled={!videoForm.courseId}>
                    <option value="">{t("selectChapter")}</option>
                    {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  {(chapters.find(ch => ch._id === videoForm.chapterId)?.videos || []).map(v => (
                    <div key={v._id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] px-4 py-3">
                      <div>
                        <p className="font-bold text-sm">{v.title}</p>
                        <p className="text-xs text-[var(--text-dim)] mt-0.5">{t("orderField")}: {v.order}</p>
                      </div>
                      <IconBtn onClick={() => handleDeleteVideo(v._id)} className="hover:border-red-500/30 hover:text-red-500"><FiTrash2 size={14} /></IconBtn>
                    </div>
                  ))}
                  {!chapters.find(ch => ch._id === videoForm.chapterId)?.videos?.length && <EmptyState t={t} />}
                </div>
              </div>
            </Card>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="space-y-4">
              {[
                { title: t("adminRole"),   users: adminUsers,   label: t("admin") },
                { title: t("studentRole"), users: studentUsers, label: t("student") },
              ].map(section => (
                <Card key={section.title} className="overflow-hidden shadow-sm">
                  <PanelHeader title={`${section.title} (${section.users.length})`} />
                  {/* Desktop */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[var(--surface-sunken)]">
                        <tr className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                          <th className="px-5 py-3">{section.label}</th>
                          <th className="px-5 py-3">{t("email")}</th>
                          <th className="px-5 py-3">{t("registrationDate")}</th>
                          <th className="px-5 py-3 text-right">{t("management")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-soft)]">
                        {section.users.map(u => (
                          <tr key={u._id} className="hover:bg-[var(--surface-sunken)] transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-black">
                                  {u.name?.charAt(0) || "?"}
                                </div>
                                <span className="font-bold text-sm">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-[var(--text-soft)]">{u.email}</td>
                            <td className="px-5 py-3.5 text-sm text-[var(--text-dim)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setSelectedUser(u); setCourseForm({ courseId: "" }); setModal("assign"); }} className="primary-btn !rounded-xl !px-3 !py-1.5 text-xs">{t("assignCourse") || "Kurs qo'shish"}</button>
                                <button onClick={() => { setSelectedUser(u); setModal("user"); }} className="secondary-btn !rounded-xl !px-3 !py-1.5 text-xs">{t("changePassword")}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!section.users.length && <div className="p-5"><EmptyState t={t} /></div>}
                  </div>
                  {/* Mobile */}
                  <div className="lg:hidden p-4 space-y-3">
                    {section.users.map(u => (
                      <div key={u._id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-3">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-black">
                            {u.name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{u.name}</p>
                            <p className="text-xs text-[var(--text-dim)] truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedUser(u); setCourseForm({ courseId: "" }); setModal("assign"); }} className="primary-btn flex-1 !rounded-xl !py-2 text-xs">{t("assignCourse") || "Kurs qo'shish"}</button>
                          <button onClick={() => { setSelectedUser(u); setModal("user"); }} className="secondary-btn flex-1 !rounded-xl !py-2 text-xs">{t("changePassword")}</button>
                        </div>
                      </div>
                    ))}
                    {!section.users.length && <EmptyState t={t} />}
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ── Modals ── */}
      {modal && (
        <ModalWrapper onClose={closeModal}>
          {modal === "course" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[var(--text-main)]">{editingCourseId ? t("edit") : t("createCourse")}</h2>
              <form onSubmit={handleSaveCourse} className="space-y-3">
                <input className="input-ui w-full" placeholder={t("titleField")} value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} required />
                <textarea className="textarea-ui w-full min-h-24" placeholder={t("descriptionField")} value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input-ui w-full" placeholder={t("category")} value={courseForm.category} onChange={e => setCourseForm(p => ({ ...p, category: e.target.value }))} required />
                  <input className="input-ui w-full" type="number" placeholder={t("priceField")} value={courseForm.price} onChange={e => setCourseForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <textarea className="textarea-ui w-full min-h-20" placeholder={t("outcomesLabel")} value={courseForm.outcomes} onChange={e => setCourseForm(p => ({ ...p, outcomes: e.target.value }))} />
                <input className="input-ui w-full" type="file" accept="image/*" onChange={e => setCourseForm(p => ({ ...p, thumbnail: e.target.files?.[0] || null }))} />
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text-soft)] cursor-pointer">
                  <input type="checkbox" checked={courseForm.isPublished} onChange={e => setCourseForm(p => ({ ...p, isPublished: e.target.checked }))} />
                  {t("publishedField")}
                </label>
                <button className="primary-btn w-full" type="submit">{editingCourseId ? t("update") : t("createCourseBtn")}</button>
              </form>
            </div>
          )}

          {modal === "chapter" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[var(--text-main)]">{t("addChapter")}</h2>
              <form onSubmit={handleSaveChapter} className="space-y-3">
                <CourseSelect value={chapterForm.courseId} courses={courses} t={t} onChange={v => setChapterForm(p => ({ ...p, courseId: v }))} required />
                <input className="input-ui w-full" placeholder={t("chapterTitle")} value={chapterForm.title} onChange={e => setChapterForm(p => ({ ...p, title: e.target.value }))} required />
                <input className="input-ui w-full" type="number" placeholder={t("orderField")} value={chapterForm.order} onChange={e => setChapterForm(p => ({ ...p, order: e.target.value }))} required />
                <button className="primary-btn w-full" type="submit">{t("addChapterBtn")}</button>
              </form>
            </div>
          )}

          {modal === "video" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[var(--text-main)]">{t("uploadVideo")}</h2>
              <form onSubmit={handleSaveVideo} className="space-y-3">
                <CourseSelect value={videoForm.courseId} courses={courses} t={t} onChange={v => setVideoForm(p => ({ ...p, courseId: v, chapterId: "" }))} required />
                <select className="input-ui w-full" value={videoForm.chapterId} onChange={e => setVideoForm(p => ({ ...p, chapterId: e.target.value }))} required>
                  <option value="">{t("selectChapter")}</option>
                  {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.title}</option>)}
                </select>
                <input className="input-ui w-full" placeholder={t("videoTitleText")} value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} required />
                <textarea className="textarea-ui w-full min-h-20" placeholder={t("descriptionField")} value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))} />
                <input className="input-ui w-full" type="number" placeholder={t("orderField")} value={videoForm.order} onChange={e => setVideoForm(p => ({ ...p, order: e.target.value }))} required />
                <input className="input-ui w-full" type="file" accept="video/*" onChange={e => setVideoForm(p => ({ ...p, video: e.target.files?.[0] || null }))} required />
                <button className="primary-btn w-full" type="submit">{t("uploadVideoBtn")}</button>
              </form>
            </div>
          )}

          {modal === "user" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[var(--text-main)]">{t("changePassword")}</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <p className="text-sm font-semibold text-[var(--text-soft)]">{selectedUser?.name} · {selectedUser?.email}</p>
                <input className="input-ui w-full" type="password" placeholder={t("newPassword")} value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} maxLength={6} required />
                <button className="primary-btn w-full" type="submit">{t("update")}</button>
              </form>
            </div>
          )}

          {modal === "assign" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[var(--text-main)]">{t("assignCourse") || "Kurs biriktirish"}</h2>
              <form onSubmit={handleAssignCourse} className="space-y-3">
                <p className="text-sm font-semibold text-[var(--text-soft)]">{selectedUser?.name} · {selectedUser?.email}</p>
                <CourseSelect value={courseForm.courseId} courses={courses} t={t} onChange={v => setCourseForm(p => ({ ...p, courseId: v }))} required />
                <button className="primary-btn w-full" type="submit">{t("assignCourse") || "Biriktirish"}</button>
              </form>
            </div>
          )}
        </ModalWrapper>
      )}
    </div>
  );
}
