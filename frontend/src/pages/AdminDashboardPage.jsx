import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiAlertCircle,
  FiBarChart2,
  FiBook,
  FiCheckCircle,
  FiEdit3,
  FiGlobe,
  FiLayers,
  FiMoon,
  FiPlus,
  FiRefreshCcw,
  FiSun,
  FiTrash2,
  FiUsers,
  FiVideo,
  FiX
} from "react-icons/fi";
import AdminSidebar from "../components/admin/AdminSidebar";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const initialCourse = {
  title: "",
  description: "",
  category: "",
  price: 0,
  isPublished: true,
  thumbnail: null,
  outcomes: ""
};

const initialChapter = { courseId: "", title: "", order: 1 };
const initialVideo = { courseId: "", chapterId: "", title: "", description: "", order: 1, video: null };

function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--text-main)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function AdminDashboardPage() {
  const { isAdmin, token } = useAuth();
  const { t, language, setLanguage, theme, setTheme } = useSettings();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "analytics");
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [modal, setModal] = useState("");
  const [editingCourseId, setEditingCourseId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [chapterForm, setChapterForm] = useState(initialChapter);
  const [videoForm, setVideoForm] = useState(initialVideo);

  const normalizedTab = activeTab.replace("admin-", "");
  const adminUsers = useMemo(() => users.filter((user) => user.role === "admin"), [users]);
  const studentUsers = useMemo(() => users.filter((user) => user.role !== "admin"), [users]);

  const metrics = useMemo(
    () => [
      { label: t("monthlyRevenue"), value: `$${analytics?.revenue || 0}`, icon: FiBarChart2 },
      { label: t("activeStudents"), value: String(analytics?.activeUsers || users.length), icon: FiUsers },
      { label: t("courses"), value: String(courses.length), icon: FiBook },
      { label: t("videos"), value: String(analytics?.topLikedVideos?.length || 0), icon: FiVideo }
    ],
    [analytics, courses.length, t, users.length]
  );

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [analyticsData, courseData, userData] = await Promise.all([
        apiFetch("/admin/analytics", { token }),
        apiFetch("/courses", { token }),
        apiFetch("/admin/users", { token })
      ]);
      setAnalytics(analyticsData);
      setCourses(courseData);
      setUsers(userData);
    } catch (err) {
      setError(t(err.message) || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourseChapters(courseId) {
    if (!courseId) {
      setChapters([]);
      return;
    }
    try {
      const data = await apiFetch(`/courses/${courseId}`, { token });
      setChapters(data.chapters || []);
    } catch (err) {
      setChapters([]);
      setError(t(err.message) || err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  useEffect(() => {
    if (!message && !error) return;
    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, error]);

  useEffect(() => {
    loadCourseChapters(videoForm.courseId);
  }, [videoForm.courseId]);

  function closeModal() {
    setModal("");
    setEditingCourseId("");
    setSelectedUser(null);
    setNewPassword("");
    setCourseForm(initialCourse);
    setChapterForm(initialChapter);
    setVideoForm(initialVideo);
  }

  function openCourseModal(course) {
    if (course) {
      setEditingCourseId(course._id);
      setCourseForm({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        price: course.price || 0,
        isPublished: course.isPublished !== false,
        thumbnail: null,
        outcomes: Array.isArray(course.outcomes) ? course.outcomes.join("\n") : ""
      });
    } else {
      setCourseForm(initialCourse);
      setEditingCourseId("");
    }
    setModal("course");
  }

  async function handleSaveCourse(event) {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", courseForm.title);
      formData.append("description", courseForm.description);
      formData.append("category", courseForm.category);
      formData.append("price", courseForm.price);
      formData.append("isPublished", String(courseForm.isPublished));
      if (courseForm.outcomes) {
        formData.append("outcomes", JSON.stringify(courseForm.outcomes.split("\n").map((item) => item.trim()).filter(Boolean)));
      }
      if (courseForm.thumbnail) formData.append("thumbnail", courseForm.thumbnail);

      if (editingCourseId) {
        await apiFetch(`/admin/courses/${editingCourseId}`, { method: "PUT", token, body: formData });
        setMessage(t("successUpdated"));
      } else {
        await apiFetch("/admin/courses", { method: "POST", token, body: formData });
        setMessage(t("successAdded"));
      }
      closeModal();
      refresh();
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  async function handleDeleteCourse(courseId) {
    if (!window.confirm(t("confirmDelete", { title: t("courseLabelShort") }))) return;
    setDeletingId(courseId);
    try {
      await apiFetch(`/admin/courses/${courseId}`, { method: "DELETE", token });
      setMessage(t("successDeleted"));
      refresh();
    } catch (err) {
      setError(t(err.message) || err.message);
    } finally {
      setDeletingId("");
    }
  }

  async function handleSaveChapter(event) {
    event.preventDefault();
    try {
      await apiFetch(`/admin/courses/${chapterForm.courseId}/chapters`, {
        method: "POST",
        token,
        body: { title: chapterForm.title, order: Number(chapterForm.order) }
      });
      setMessage(t("successAdded"));
      closeModal();
      loadCourseChapters(chapterForm.courseId);
      refresh();
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  async function handleDeleteChapter(chapterId) {
    if (!window.confirm(t("confirmDelete", { title: t("chapters") }))) return;
    try {
      await apiFetch(`/admin/chapters/${chapterId}`, { method: "DELETE", token });
      setMessage(t("successDeleted"));
      loadCourseChapters(chapterForm.courseId || videoForm.courseId);
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  async function handleSaveVideo(event) {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", videoForm.title);
      formData.append("description", videoForm.description);
      formData.append("order", videoForm.order);
      if (videoForm.video) formData.append("video", videoForm.video);
      await apiFetch(`/admin/chapters/${videoForm.chapterId}/videos`, { method: "POST", token, body: formData });
      setMessage(t("successAdded"));
      closeModal();
      loadCourseChapters(videoForm.courseId);
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  async function handleDeleteVideo(videoId) {
    if (!window.confirm(t("confirmDelete", { title: t("videos") }))) return;
    try {
      await apiFetch(`/admin/videos/${videoId}`, { method: "DELETE", token });
      setMessage(t("successDeleted"));
      loadCourseChapters(videoForm.courseId);
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  async function handleUpdateUserPassword(event) {
    event.preventDefault();
    if (!selectedUser || !newPassword) return;
    if (newPassword.length !== 6) {
      setError(t("ERR_PASSWORD_SHORT"));
      return;
    }

    try {
      await apiFetch(`/admin/users/${selectedUser._id}/password`, {
        method: "PUT",
        token,
        body: { newPassword }
      });
      setMessage(t("passwordUpdatedSuccess"));
      closeModal();
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  async function handleAssignCourse(event) {
    event.preventDefault();
    if (!selectedUser || !courseForm.courseId) return;
    try {
      await apiFetch(`/admin/assign-course`, {
        method: "POST",
        token,
        body: { userId: selectedUser._id, courseId: courseForm.courseId }
      });
      setMessage(t("successAdded"));
      closeModal();
    } catch (err) {
      setError(t(err.message) || err.message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-5">
        <AdminCard className="max-w-md p-8 text-center">
          <FiAlertCircle className="mx-auto mb-4 text-3xl text-red-500" />
          <h1 className="mb-5 text-2xl font-bold text-[var(--text-main)]">{t("adminOnlyText")}</h1>
          <Link to="/courses" className="primary-btn w-full">{t("goCourses")}</Link>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-all duration-300">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="min-w-0 flex-1 pt-[80px] lg:pt-0 lg:pl-72 transition-all duration-300">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-10">
          <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">{t("operationsCenter")}</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-main)] sm:text-4xl">{t("adminDashboard")}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-1">
                  {["uz", "ru"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setLanguage(item)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold uppercase ${language === item ? "bg-[var(--text-main)] text-[var(--bg)]" : "text-[var(--text-soft)]"}`}
                    >
                      <FiGlobe /> {item}
                    </button>
                  ))}
                </div>
                <IconButton onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  {theme === "light" ? <FiMoon /> : <FiSun />}
                </IconButton>
                <IconButton onClick={refresh}>
                  <FiRefreshCcw className={loading ? "animate-spin" : ""} />
                </IconButton>
              </div>
            </div>

            {(message || error) && (
              <div className={`mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${error ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-green-500/30 bg-green-500/10 text-green-500"}`}>
                {error ? <FiAlertCircle /> : <FiCheckCircle />}
                {error || message}
              </div>
            )}
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <AdminCard key={metric.label} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">{metric.label}</p>
                      <strong className="mt-2 block text-3xl font-black text-[var(--text-main)]">{metric.value}</strong>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--text-main)] text-[var(--bg)]">
                      <Icon />
                    </div>
                  </div>
                </AdminCard>
              );
            })}
          </section>

          <div className="sticky top-[65px] lg:top-6 z-30 flex gap-2 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)]/90 p-2 backdrop-blur-xl shadow-lg">
            {[
              { id: "analytics", label: t("analytics"), icon: FiBarChart2 },
              { id: "courses", label: t("courses"), icon: FiBook },
              { id: "chapters", label: t("chapters"), icon: FiLayers },
              { id: "videos", label: t("videos"), icon: FiVideo },
              { id: "users", label: t("users"), icon: FiUsers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${normalizedTab === tab.id ? "bg-[var(--text-main)] text-[var(--bg)]" : "text-[var(--text-soft)] hover:bg-[var(--surface-strong)]"}`}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </div>

          {normalizedTab === "analytics" && (
            <section className="grid gap-5 lg:grid-cols-2">
              <AdminCard className="p-5">
                <h2 className="mb-4 text-lg font-black">{t("topCourses")}</h2>
                <div className="space-y-3">
                  {(analytics?.topCourses || []).map((course, index) => (
                    <div key={course._id || index} className="flex items-center justify-between rounded-xl bg-[var(--surface-sunken)] p-4">
                      <span className="min-w-0 truncate text-sm font-bold">{index + 1}. {course.title}</span>
                      <span className="text-xs font-bold text-[var(--text-dim)]">{course.views || 0} {t("viewsLabel")}</span>
                    </div>
                  ))}
                  {!analytics?.topCourses?.length && <EmptyState t={t} />}
                </div>
              </AdminCard>
              <AdminCard className="p-5">
                <h2 className="mb-4 text-lg font-black">{t("topUsers")}</h2>
                <div className="space-y-3">
                  {(analytics?.mostActiveUsers || []).map((user, index) => (
                    <div key={`${user.name}-${index}`} className="flex items-center justify-between rounded-xl bg-[var(--surface-sunken)] p-4">
                      <span className="text-sm font-bold">{user.name}</span>
                      <span className="text-xs font-bold text-[var(--text-dim)]">{user.total} {t("lessons")}</span>
                    </div>
                  ))}
                  {!analytics?.mostActiveUsers?.length && <EmptyState t={t} />}
                </div>
              </AdminCard>
            </section>
          )}

          {normalizedTab === "courses" && (
            <AdminCard className="overflow-hidden">
              <PanelTitle title={t("courses")} action={(
                <button onClick={() => openCourseModal()} className="primary-btn !rounded-xl !px-4 !py-2.5">
                  <FiPlus /> {t("createCourse")}
                </button>
              )} />
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="bg-[var(--surface-sunken)] text-xs uppercase tracking-widest text-[var(--text-dim)]">
                    <tr>
                      <th className="px-5 py-4">{t("courseLabel")}</th>
                      <th className="px-5 py-4">{t("category")}</th>
                      <th className="px-5 py-4">{t("priceField")}</th>
                      <th className="px-5 py-4">{t("status")}</th>
                      <th className="px-5 py-4 text-right">{t("management")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-soft)]">
                    {courses.map((course) => <CourseRow key={course._id} course={course} deletingId={deletingId} onEdit={openCourseModal} onDelete={handleDeleteCourse} t={t} />)}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 p-4 lg:hidden">
                {courses.map((course) => <CourseMobileCard key={course._id} course={course} deletingId={deletingId} onEdit={openCourseModal} onDelete={handleDeleteCourse} t={t} />)}
              </div>
            </AdminCard>
          )}

          {normalizedTab === "chapters" && (
            <AdminCard className="p-5">
              <PanelTitle title={t("chapters")} action={<button onClick={() => setModal("chapter")} className="primary-btn !rounded-xl !px-4 !py-2.5"><FiPlus /> {t("addChapter")}</button>} />
              <CourseSelect value={chapterForm.courseId} courses={courses} t={t} onChange={(value) => { setChapterForm((prev) => ({ ...prev, courseId: value })); loadCourseChapters(value); }} />
              <div className="mt-5 grid gap-3">
                {chapters.map((chapter) => (
                  <div key={chapter._id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-4">
                    <div>
                      <p className="font-bold">{chapter.order}. {chapter.title}</p>
                      <p className="text-xs text-[var(--text-dim)]">{chapter.videos?.length || 0} {t("videos")}</p>
                    </div>
                    <IconButton onClick={() => handleDeleteChapter(chapter._id)} className="hover:text-red-500"><FiTrash2 /></IconButton>
                  </div>
                ))}
                {!chapters.length && <EmptyState t={t} />}
              </div>
            </AdminCard>
          )}

          {normalizedTab === "videos" && (
            <AdminCard className="p-5">
              <PanelTitle title={t("videos")} action={<button onClick={() => setModal("video")} className="primary-btn !rounded-xl !px-4 !py-2.5"><FiPlus /> {t("uploadVideo")}</button>} />
              <div className="grid gap-3 md:grid-cols-2">
                <CourseSelect value={videoForm.courseId} courses={courses} t={t} onChange={(value) => setVideoForm((prev) => ({ ...prev, courseId: value, chapterId: "" }))} />
                <select className="input-ui w-full" value={videoForm.chapterId} onChange={(e) => setVideoForm((prev) => ({ ...prev, chapterId: e.target.value }))} disabled={!videoForm.courseId}>
                  <option value="">{t("selectChapter")}</option>
                  {chapters.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.title}</option>)}
                </select>
              </div>
              <div className="mt-5 grid gap-3">
                {(chapters.find((chapter) => chapter._id === videoForm.chapterId)?.videos || []).map((video) => (
                  <div key={video._id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-4">
                    <div>
                      <p className="font-bold">{video.title}</p>
                      <p className="text-xs text-[var(--text-dim)]">{t("orderField")}: {video.order}</p>
                    </div>
                    <IconButton onClick={() => handleDeleteVideo(video._id)} className="hover:text-red-500"><FiTrash2 /></IconButton>
                  </div>
                ))}
                {!chapters.find((chapter) => chapter._id === videoForm.chapterId)?.videos?.length && <EmptyState t={t} />}
              </div>
            </AdminCard>
          )}

          {normalizedTab === "users" && (
            <div className="space-y-5">
              <UserSection
                title={t("adminRole")}
                nameLabel={t("admin")}
                users={adminUsers}
                t={t}
                onPassword={(user) => { setSelectedUser(user); setModal("user"); }}
                onAssign={(user) => { setSelectedUser(user); setCourseForm({ courseId: "" }); setModal("assign"); }}
              />
              <UserSection
                title={t("studentRole")}
                nameLabel={t("student")}
                users={studentUsers}
                t={t}
                onPassword={(user) => { setSelectedUser(user); setModal("user"); }}
                onAssign={(user) => { setSelectedUser(user); setCourseForm({ courseId: "" }); setModal("assign"); }}
              />
            </div>
          )}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg)]/80 p-4 backdrop-blur-xl">
          <AdminCard className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
            <IconButton onClick={closeModal} className="absolute right-4 top-4"><FiX /></IconButton>

            {modal === "course" && (
              <ModalSection title={editingCourseId ? t("edit") : t("createCourse")}>
                <form onSubmit={handleSaveCourse} className="space-y-4">
                  <input className="input-ui w-full" placeholder={t("titleField")} value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} required />
                  <textarea className="textarea-ui w-full min-h-28" placeholder={t("descriptionField")} value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="input-ui w-full" placeholder={t("category")} value={courseForm.category} onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))} required />
                    <input className="input-ui w-full" type="number" placeholder={t("priceField")} value={courseForm.price} onChange={(e) => setCourseForm((p) => ({ ...p, price: e.target.value }))} />
                  </div>
                  <textarea className="textarea-ui w-full min-h-24" placeholder={t("outcomesLabel")} value={courseForm.outcomes} onChange={(e) => setCourseForm((p) => ({ ...p, outcomes: e.target.value }))} />
                  <input className="input-ui w-full" type="file" accept="image/*" onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.files?.[0] || null }))} />
                  <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text-soft)]">
                    <input type="checkbox" checked={courseForm.isPublished} onChange={(e) => setCourseForm((p) => ({ ...p, isPublished: e.target.checked }))} />
                    {t("publishedField")}
                  </label>
                  <button className="primary-btn w-full" type="submit">{editingCourseId ? t("update") : t("createCourseBtn")}</button>
                </form>
              </ModalSection>
            )}

            {modal === "chapter" && (
              <ModalSection title={t("addChapter")}>
                <form onSubmit={handleSaveChapter} className="space-y-4">
                  <CourseSelect value={chapterForm.courseId} courses={courses} t={t} onChange={(value) => setChapterForm((p) => ({ ...p, courseId: value }))} required />
                  <input className="input-ui w-full" placeholder={t("chapterTitle")} value={chapterForm.title} onChange={(e) => setChapterForm((p) => ({ ...p, title: e.target.value }))} required />
                  <input className="input-ui w-full" type="number" placeholder={t("orderField")} value={chapterForm.order} onChange={(e) => setChapterForm((p) => ({ ...p, order: e.target.value }))} required />
                  <button className="primary-btn w-full" type="submit">{t("addChapterBtn")}</button>
                </form>
              </ModalSection>
            )}

            {modal === "video" && (
              <ModalSection title={t("uploadVideo")}>
                <form onSubmit={handleSaveVideo} className="space-y-4">
                  <CourseSelect value={videoForm.courseId} courses={courses} t={t} onChange={(value) => setVideoForm((p) => ({ ...p, courseId: value, chapterId: "" }))} required />
                  <select className="input-ui w-full" value={videoForm.chapterId} onChange={(e) => setVideoForm((p) => ({ ...p, chapterId: e.target.value }))} required>
                    <option value="">{t("selectChapter")}</option>
                    {chapters.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.title}</option>)}
                  </select>
                  <input className="input-ui w-full" placeholder={t("videoTitleText")} value={videoForm.title} onChange={(e) => setVideoForm((p) => ({ ...p, title: e.target.value }))} required />
                  <textarea className="textarea-ui w-full min-h-24" placeholder={t("descriptionField")} value={videoForm.description} onChange={(e) => setVideoForm((p) => ({ ...p, description: e.target.value }))} />
                  <input className="input-ui w-full" type="number" placeholder={t("orderField")} value={videoForm.order} onChange={(e) => setVideoForm((p) => ({ ...p, order: e.target.value }))} required />
                  <input className="input-ui w-full" type="file" accept="video/*" onChange={(e) => setVideoForm((p) => ({ ...p, video: e.target.files?.[0] || null }))} required />
                  <button className="primary-btn w-full" type="submit">{t("uploadVideoBtn")}</button>
                </form>
              </ModalSection>
            )}

            {modal === "user" && (
              <ModalSection title={t("changePassword")}>
                <form onSubmit={handleUpdateUserPassword} className="space-y-4">
                  <p className="text-sm font-semibold text-[var(--text-soft)]">{selectedUser?.name} - {selectedUser?.email}</p>
                  <input className="input-ui w-full" type="password" placeholder={t("newPassword")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} maxLength={6} required />
                  <button className="primary-btn w-full" type="submit">{t("update")}</button>
                </form>
              </ModalSection>
            )}

            {modal === "assign" && (
              <ModalSection title={t("assignCourse") || "Kursni biriktirish"}>
                <form onSubmit={handleAssignCourse} className="space-y-4">
                  <p className="text-sm font-semibold text-[var(--text-soft)]">{selectedUser?.name} - {selectedUser?.email}</p>
                  <CourseSelect value={courseForm.courseId} courses={courses} t={t} onChange={(value) => setCourseForm((p) => ({ ...p, courseId: value }))} required />
                  <button className="primary-btn w-full" type="submit">{t("assignCourse") || "Biriktirish"}</button>
                </form>
              </ModalSection>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}

function PanelTitle({ title, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-black text-[var(--text-main)]">{title}</h2>
      {action}
    </div>
  );
}

function EmptyState({ t }) {
  return <div className="rounded-xl border border-dashed border-[var(--border-soft)] p-6 text-center text-sm font-semibold text-[var(--text-dim)]">{t("noDataYet")}</div>;
}

function CourseSelect({ value, courses, t, onChange, required = false }) {
  return (
    <select className="input-ui w-full" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{t("selectCourse")}</option>
      {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
    </select>
  );
}

function ModalSection({ title, children }) {
  return (
    <div className="space-y-5 pt-8">
      <h2 className="pr-12 text-2xl font-black text-[var(--text-main)]">{title}</h2>
      {children}
    </div>
  );
}

function CourseRow({ course, deletingId, onEdit, onDelete, t }) {
  return (
    <tr className="hover:bg-[var(--surface-sunken)]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-4">
          <CourseThumb course={course} />
          <span className="font-bold">{course.title}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-[var(--text-soft)]">{course.category}</td>
      <td className="px-5 py-4 font-bold">${course.price || 0}</td>
      <td className="px-5 py-4"><StatusPill live={course.isPublished !== false} t={t} /></td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <IconButton onClick={() => onEdit(course)}><FiEdit3 /></IconButton>
          <IconButton onClick={() => onDelete(course._id)} disabled={deletingId === course._id} className="hover:text-red-500"><FiTrash2 /></IconButton>
        </div>
      </td>
    </tr>
  );
}

function CourseMobileCard({ course, deletingId, onEdit, onDelete, t }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-4">
      <div className="flex gap-4">
        <CourseThumb course={course} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{course.title}</h3>
          <p className="text-sm text-[var(--text-dim)]">{course.category} - ${course.price || 0}</p>
          <div className="mt-2"><StatusPill live={course.isPublished !== false} t={t} /></div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit(course)} className="secondary-btn flex-1 !rounded-xl !py-2"><FiEdit3 /> {t("edit")}</button>
        <button onClick={() => onDelete(course._id)} disabled={deletingId === course._id} className="secondary-btn flex-1 !rounded-xl !py-2 hover:!text-red-500"><FiTrash2 /> {t("delete")}</button>
      </div>
    </div>
  );
}

function CourseThumb({ course }) {
  return (
    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)]">
      {course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[var(--text-dim)]"><FiBook /></div>}
    </div>
  );
}

function StatusPill({ live, t }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${live ? "border-green-500/30 bg-green-500/10 text-green-500" : "border-amber-500/30 bg-amber-500/10 text-amber-500"}`}>
      {live ? t("statusLive") : t("statusDraft")}
    </span>
  );
}

function UserSection({ title, nameLabel, users, t, onPassword, onAssign }) {
  return (
    <AdminCard className="overflow-hidden">
      <PanelTitle title={`${title} (${users.length})`} />
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left">
          <thead className="bg-[var(--surface-sunken)] text-xs uppercase tracking-widest text-[var(--text-dim)]">
            <tr>
              <th className="px-5 py-4">{nameLabel}</th>
              <th className="px-5 py-4">{t("email")}</th>
              <th className="px-5 py-4">{t("registrationDate")}</th>
              <th className="px-5 py-4 text-right">{t("management")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {users.map((user) => <UserRow key={user._id} user={user} t={t} onPassword={() => onPassword(user)} onAssign={() => onAssign(user)} />)}
          </tbody>
        </table>
        {!users.length && <div className="p-4"><EmptyState t={t} /></div>}
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {users.map((user) => <UserMobileCard key={user._id} user={user} t={t} onPassword={() => onPassword(user)} onAssign={() => onAssign(user)} />)}
        {!users.length && <EmptyState t={t} />}
      </div>
    </AdminCard>
  );
}

function UserRow({ user, t, onPassword, onAssign }) {
  return (
    <tr className="hover:bg-[var(--surface-sunken)]">
      <td className="px-5 py-4 font-bold">{user.name}</td>
      <td className="px-5 py-4 text-sm text-[var(--text-soft)]">{user.email}</td>
      <td className="px-5 py-4 text-sm text-[var(--text-dim)]">{new Date(user.createdAt).toLocaleDateString()}</td>
      <td className="px-5 py-4 text-right space-x-2">
        <button onClick={onAssign} className="primary-btn !rounded-xl !px-4 !py-2 text-xs">{t("assignCourse") || "Kurs qo'shish"}</button>
        <button onClick={onPassword} className="secondary-btn !rounded-xl !px-4 !py-2 text-xs">{t("changePassword")}</button>
      </td>
    </tr>
  );
}

function UserMobileCard({ user, t, onPassword, onAssign }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-4">
      <h3 className="font-bold">{user.name}</h3>
      <p className="mt-1 text-sm text-[var(--text-soft)]">{user.email}</p>
      <p className="mt-1 text-xs text-[var(--text-dim)]">{new Date(user.createdAt).toLocaleDateString()}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onAssign} className="primary-btn flex-1 !rounded-xl !py-2 text-xs">{t("assignCourse") || "Kurs qo'shish"}</button>
        <button onClick={onPassword} className="secondary-btn flex-1 !rounded-xl !py-2 text-xs">{t("changePassword")}</button>
      </div>
    </div>
  );
}
