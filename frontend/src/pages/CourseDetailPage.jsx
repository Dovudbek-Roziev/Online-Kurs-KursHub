import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FiPlayCircle, FiCheckCircle, FiLock, FiStar, FiEye, FiChevronRight, FiChevronDown, FiMonitor, FiClipboard, FiBookOpen } from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { t } = useSettings();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [openChapters, setOpenChapters] = useState({});

  const orderedVideos = useMemo(() => {
    const list = [];
    (course?.chapters || []).forEach((chapter) => {
      (chapter.videos || []).forEach((video) => list.push(video));
    });
    return list;
  }, [course]);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch(`/courses/${courseId}`, { token })
      .then((data) => setCourse(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId, token]);

  function requireLogin() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${courseId}` } });
      return false;
    }
    return true;
  }

  function contactAdmin() {
    if (!requireLogin()) return;
    navigate(`/chat?courseId=${courseId}`);
  }

  async function toggleBookmark() {
    if (!requireLogin()) return;
    setBusy("bookmark");
    setError("");
    try {
      const data = await apiFetch(`/courses/${courseId}/bookmark`, { method: "POST", token });
      setCourse((prev) => (prev ? { ...prev, isBookmarked: Boolean(data.bookmarked) } : prev));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function rate(value) {
    if (!requireLogin()) return;
    setBusy(`rate:${value}`);
    setError("");
    try {
      const data = await apiFetch(`/courses/${courseId}/rate`, { method: "POST", token, body: { value } });
      setCourse((prev) => (prev ? { ...prev, rating: data.rating, myRating: value } : prev));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function openVideo(video) {
    if (!requireLogin()) return;
    navigate(`/videos/${video._id}`);
  }

  function openFirstAvailable() {
    if (!requireLogin()) return;
    const first = orderedVideos.find((v) => !v.locked);
    if (!first) return;
    navigate(`/videos/${first._id}`);
  }

  function toggleChapter(id) {
    setOpenChapters(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <p className="text-xl text-[var(--text-soft)]">{error || t("ERR_COURSE_NOT_FOUND")}</p>
        <Link to="/courses" className="rounded-xl bg-[var(--surface-strong)] px-6 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--accent)] transition-colors">
          {t("backToCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24">
      {/* CLEAN PREMIUM HERO */}
      <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            
            {/* Left: Text & Actions */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-500 border border-indigo-500/20">
                  {course.category || "Development"}
                </span>
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 border border-amber-500/20">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <FiStar key={v} className={`text-xs ${Math.round(course.rating || 0) >= v ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-amber-500">{course.rating || 0}</span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-main)] tracking-tight leading-[1.1]">
                {course.title}
              </h1>
              
              <p className="text-lg text-[var(--text-soft)] leading-relaxed max-w-xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-dim)] font-medium">
                <div className="flex items-center gap-2">
                  <FiMonitor className="text-indigo-500 text-lg" />
                  <span>{orderedVideos.length} {t("lessons")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="text-emerald-500 text-lg" />
                  <span>{course.views || 0} {t("viewsLabel")}</span>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center gap-4">
                {course.price > 0 && !course.isPurchased ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button 
                      className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg)] px-8 py-4 font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto"
                      onClick={contactAdmin}
                    >
                      <FiLock className="text-xl"/> {t("buyCourse")} (${Number(course.price).toFixed(0)})
                    </button>
                  </div>
                ) : (
                  <button 
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg)] px-8 py-4 font-bold text-base rounded-2xl shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    onClick={openFirstAvailable}
                  >
                    <FiPlayCircle className="text-xl"/> {t("startLearning")}
                  </button>
                )}
                
                <button 
                  className={`px-6 py-4 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 border ${
                    course.isBookmarked 
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" 
                      : "border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--text-main)] hover:bg-[var(--bg-main)]"
                  }`}
                  onClick={toggleBookmark}
                  disabled={busy === "bookmark"}
                >
                  <FiCheckCircle className={course.isBookmarked ? "text-emerald-500 text-xl" : "text-xl"} />
                  {course.isBookmarked ? t("bookmarked") : t("bookmark")}
                </button>
              </div>
            </div>

            {/* Right: Big Video Preview (Safe, No Absolute Overlaps) */}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-[var(--border-soft)] shadow-2xl group cursor-pointer" onClick={openFirstAvailable}>
              <img 
                src={course.thumbnail || "https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&q=80"} 
                alt="Course Preview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiPlayCircle className="text-white text-5xl ml-1" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT AREA */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] items-start">
          
          {/* LEFT: About & Instructor */}
          <div className="space-y-12">
            
            {/* What you'll learn */}
            <section className="bg-[var(--surface)] border border-[var(--border-soft)] p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6">{t("courseIncludes")}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {(course.outcomes && course.outcomes.length > 0 ? course.outcomes : [
                  t("courseIncludes_1"),
                  t("courseIncludes_2"),
                  t("courseIncludes_3"),
                  t("courseIncludes_4")
                ]).map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FiCheckCircle className="text-[var(--accent)] text-xl mt-0.5 shrink-0" />
                    <span className="text-[var(--text-soft)] leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section className="bg-[var(--surface)] border border-[var(--border-soft)] p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--text-main)] mb-8">{t("instructor")}</h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="flex-shrink-0 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl font-bold text-white shadow-lg">
                  {(course.createdBy?.name || "A")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-main)] mb-1">
                    {course.createdBy?.name || "Admin"}
                  </h3>
                  <p className="text-sm font-bold text-[var(--accent)] mb-4">{t("leadInstructor")}</p>
                  <p className="text-base text-[var(--text-soft)] leading-relaxed max-w-2xl">
                    {t("instructorText")} {t("instructorBioSuffix")}
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT: Chapter Accordion Curriculum */}
          <div className="space-y-6">

            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-3xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-soft)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <FiBookOpen className="text-indigo-500" size={15} />
                  </div>
                  <h2 className="text-base font-black text-[var(--text-main)]">{t("courseLibrary")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--text-dim)] bg-[var(--surface-strong)] border border-[var(--border-soft)] px-2.5 py-1 rounded-full">
                    {(course.chapters || []).length} {t("chapters")}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                    {orderedVideos.length} {t("lessons")}
                  </span>
                </div>
              </div>

              {/* Chapters */}
              <div className="divide-y divide-[var(--border-soft)]">
                {(course.chapters || []).length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--surface-strong)] flex items-center justify-center">
                      <FiClipboard className="text-[var(--text-dim)]" size={20} />
                    </div>
                    <p className="text-sm text-[var(--text-dim)]">{t("lessonsSoon")}</p>
                  </div>
                ) : (
                  (course.chapters || []).map((chapter, ci) => {
                    const isOpen = openChapters[chapter._id] !== false && (ci === 0 || openChapters[chapter._id]);
                    const videos = chapter.videos || [];
                    const completedCount = videos.filter(v => v.progress?.watched).length;
                    const hasQuiz = chapter.quiz && chapter.quiz.questions?.length > 0;

                    return (
                      <div key={chapter._id}>
                        {/* Chapter header — click to expand */}
                        <button
                          type="button"
                          onClick={() => toggleChapter(chapter._id)}
                          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--surface-strong)] transition-colors"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[11px] font-black text-indigo-500">
                            {ci + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-main)] truncate">{chapter.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[var(--text-dim)]">{videos.length} {t("lessons")}</span>
                              {completedCount > 0 && (
                                <span className="text-[10px] font-bold text-emerald-500">· {completedCount}/{videos.length} ✓</span>
                              )}
                              {hasQuiz && (
                                <span className="text-[10px] font-bold text-violet-400">· Quiz</span>
                              )}
                            </div>
                          </div>
                          <FiChevronDown
                            size={15}
                            className={`shrink-0 text-[var(--text-dim)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Videos list */}
                        {isOpen && (
                          <div className="bg-[var(--surface-strong)]/50 border-t border-[var(--border-soft)]">
                            {videos.length === 0 ? (
                              <p className="px-5 py-3 text-xs text-[var(--text-dim)] italic">{t("lessonsSoon")}</p>
                            ) : (
                              videos.map((video, vi) => {
                                const isLocked = video.locked;
                                const isDone = video.progress?.watched;
                                return (
                                  <div
                                    key={video._id}
                                    onClick={() => !isLocked && openVideo(video)}
                                    className={`group flex items-center gap-3 px-5 py-3 border-b border-[var(--border-soft)] last:border-b-0 transition-colors ${
                                      isLocked
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer hover:bg-indigo-500/5"
                                    }`}
                                  >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                      isDone
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : isLocked
                                        ? "bg-[var(--surface)] text-[var(--text-dim)]"
                                        : "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                                    }`}>
                                      {isDone
                                        ? <FiCheckCircle size={14} />
                                        : isLocked
                                        ? <FiLock size={13} />
                                        : <FiPlayCircle size={14} />
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-semibold truncate ${isLocked ? "text-[var(--text-dim)]" : "text-[var(--text-main)]"}`}>
                                        {vi + 1}. {video.title}
                                      </p>
                                      {video.duration > 0 && (
                                        <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")} {t("durationLabel")}
                                        </p>
                                      )}
                                    </div>
                                    {!isLocked && (
                                      <FiChevronRight size={13} className="shrink-0 text-[var(--text-dim)] group-hover:text-indigo-400 transition-colors" />
                                    )}
                                  </div>
                                );
                              })
                            )}
                            {/* Quiz badge */}
                            {hasQuiz && (
                              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-violet-500/5 border-t border-violet-500/10">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                  <FiClipboard size={12} />
                                </div>
                                <p className="text-xs font-bold text-violet-400">{t("chapterQuiz")}</p>
                                <span className="ml-auto text-[10px] text-violet-400/70">{chapter.quiz.questions.length} {t("questions")}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Premium Rating Box */}
            <div className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--border-soft)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-strong)] p-8 shadow-xl transition-all hover:shadow-2xl hover:border-[var(--accent)]/30">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--accent)]/5 blur-3xl transition-all group-hover:bg-[var(--accent)]/10"></div>
              
              <div className="relative">
                <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">{t("rateCourseTitle") || "Kursni baholang"}</h2>
                <p className="mt-2 text-sm font-medium text-[var(--text-dim)]">
                  {t("rateCourseText") || "Fikringiz biz uchun muhim. Kursni 5 ballik tizimda baholang!"}
                </p>
                
                <div className="mt-8 flex flex-col items-center gap-6">
                  {/* Stars Container */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((v) => {
                      const isActive = (course.myRating || course.rating || 0) >= v;
                      return (
                        <button
                          key={v}
                          type="button"
                          className={`group/star relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                            isActive 
                              ? "bg-amber-400 text-[var(--bg)] shadow-[0_8px_20px_rgba(251,191,36,0.3)]" 
                              : "bg-[var(--surface-sunken)] text-[var(--text-dim)] border border-[var(--border-soft)] hover:border-amber-400/50 hover:bg-amber-400/5"
                          }`}
                          disabled={busy === `rate:${v}`}
                          onClick={() => rate(v)}
                          title={`${v} ${t("points")}`}
                        >
                          <FiStar 
                            className={`text-2xl transition-all duration-500 ${
                              isActive ? "fill-current scale-110 rotate-[360deg]" : "group-hover/star:text-amber-400 group-hover/star:scale-110"
                            }`} 
                          />
                          {busy === `rate:${v}` && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10 backdrop-blur-[1px]">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-sunken)] px-4 py-2 border border-[var(--border-soft)]">
                    <span className="text-sm font-bold text-[var(--text-main)]">
                      {course.rating?.toFixed(1) || "0.0"}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-[var(--text-dim)]"></div>
                    <span className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider">
                      {t("averageRating")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
