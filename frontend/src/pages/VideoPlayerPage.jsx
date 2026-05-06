import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { HiLockClosed, HiCheckCircle, HiOutlinePlay } from "react-icons/hi";
import { FiClipboard, FiX, FiCheck, FiArrowLeft, FiArrowRight } from "react-icons/fi";

function calcQuestionTime(question, options) {
  const qLen = question.length;
  const optsLen = options.reduce((s, o) => s + o.length, 0);
  return Math.max(10, 10 + Math.floor(qLen / 40) * 3 + Math.floor(optsLen / 80) * 2);
}

function QuizTimer({ timeLeft, totalTime }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = totalTime > 0 ? timeLeft / totalTime : 0;
  const offset = circ * (1 - fill);
  const color = timeLeft > totalTime * 0.5 ? "#6366f1" : timeLeft > totalTime * 0.25 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="48" height="48" className="shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
      <circle
        cx="24" cy="24" r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: "stroke-dashoffset 0.95s linear, stroke 0.4s" }}
      />
      <text x="24" y="29" textAnchor="middle" fill={color} fontSize="12" fontWeight="900" fontFamily="system-ui,sans-serif">
        {timeLeft}
      </text>
    </svg>
  );
}

export default function VideoPlayerPage() {
  const { videoId } = useParams();
  const { token } = useAuth();
  const { t, autoplayVideo } = useSettings();
  const playerRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [comment, setComment] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/courses/videos/${videoId}/open`, { method: "POST", token })
      .then((data) => { setPayload(data); setError(""); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, videoId]);

  useEffect(() => {
    if (payload?.progress?.lastTime && playerRef.current) {
      playerRef.current.currentTime = payload.progress.lastTime;
    }
  }, [payload]);

  useEffect(() => {
    if (!payload) return;
    const chapterId = payload.video.chapterId;
    setQuiz(null); setQuizResult(null); setSubmitted(false);
    setSubmitResult(null); setSelectedAnswers([]); setCurrentQIdx(0);
    Promise.all([
      apiFetch(`/quiz/chapters/${chapterId}`, { token }),
      apiFetch(`/quiz/chapters/${chapterId}/result`, { token })
    ]).then(([q, r]) => { setQuiz(q); setQuizResult(r); }).catch(() => {});
  }, [payload?.video?.chapterId, token]);

  // Per-question timer
  useEffect(() => {
    if (!showQuiz || submitted || !quiz || quiz.questions.length === 0) return;
    const q = quiz.questions[currentQIdx];
    const t = calcQuestionTime(q.question, q.options);
    setTotalTime(t);
    setTimeLeft(t);

    let remaining = t;
    const interval = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentQIdx((ci) => (ci < quiz.questions.length - 1 ? ci + 1 : ci));
        }, 600);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showQuiz, submitted, currentQIdx, quiz]);

  function openQuiz() {
    setShowQuiz(true);
    setSubmitted(false);
    setSubmitResult(null);
    setSelectedAnswers([]);
    setCurrentQIdx(0);
  }

  async function saveProgress(forceComplete = false) {
    if (!playerRef.current) return;
    try {
      const updatedProgress = await apiFetch(`/courses/videos/${videoId}/progress`, {
        method: "POST", token,
        body: { lastTime: Math.floor(playerRef.current.currentTime), watched: forceComplete }
      });
      if (forceComplete) {
        const freshData = await apiFetch(`/courses/videos/${videoId}/open`, { method: "POST", token });
        setPayload(freshData);
      } else {
        setPayload((prev) => ({ ...prev, progress: updatedProgress }));
      }
    } catch (err) { console.error("Progress save failed:", err); }
  }

  async function react(type) {
    const data = await apiFetch(`/courses/videos/${videoId}/reaction`, { method: "POST", token, body: { type } });
    setPayload((prev) => ({ ...prev, video: { ...prev.video, ...data }, reaction: type }));
  }

  async function handleQuizSubmit() {
    try {
      const chapterId = payload.video.chapterId;
      const answers = quiz.questions.map((_, i) => selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1);
      const result = await apiFetch(`/quiz/chapters/${chapterId}/submit`, {
        method: "POST", token, body: { answers }
      });
      setSubmitResult(result);
      setSubmitted(true);
      setQuizResult({ score: result.score, total: result.total, passed: result.passed });
    } catch (err) { console.error("Quiz submit error:", err); }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    const created = await apiFetch(`/courses/videos/${videoId}/comments`, {
      method: "POST", token,
      body: { text: comment, parentCommentId: replyTarget?._id || null }
    });
    setPayload((prev) => ({ ...prev, comments: [created, ...prev.comments] }));
    setComment(""); setReplyTarget(null);
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5rem)] page-bg flex items-center justify-center p-6">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-8 py-6 text-center text-red-400 backdrop-blur-md">
          <svg className="mx-auto mb-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="font-bold">{t(error) || error}</p>
          <Link to="/courses" className="mt-4 inline-block text-xs font-bold uppercase tracking-widest hover:underline">{t("backToCatalog")}</Link>
        </div>
      </div>
    );
  }

  if (loading || !payload) {
    return (
      <div className="min-h-[calc(100vh-5rem)] page-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
          <p className="text-sm font-black text-[var(--text-dim)] uppercase tracking-widest">{t("videoLoading")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-5rem)] page-bg p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-8 xl:grid-cols-[1fr_400px]">

            {/* Main Video */}
            <div className="space-y-6">
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-black shadow-2xl">
                <div className="aspect-video w-full">
                  <video
                    className="h-full w-full object-contain"
                    ref={playerRef}
                    src={payload.video.videoUrl}
                    controls
                    autoPlay={autoplayVideo}
                    onPause={() => saveProgress(false)}
                    onEnded={() => saveProgress(true)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3 lg:max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em]">{t("currentLesson")}</span>
                    {payload.progress?.watched && <HiCheckCircle className="text-emerald-500" />}
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)] sm:text-4xl">{payload.video.title}</h1>
                  <p className="text-sm font-medium leading-relaxed text-[var(--text-dim)]">{payload.video.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className={`flex items-center gap-2 rounded-2xl border px-6 py-3 text-xs font-black uppercase transition-all ${
                      payload.reaction === "like" ? "bg-rose-500 border-transparent text-white" : "bg-[var(--surface)] border-[var(--border-soft)] text-[var(--text-main)] hover:border-rose-500/50"
                    }`}
                    onClick={() => react("like")}
                  >
                    <svg className="h-4 w-4" fill={payload.reaction === "like" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t("like")}
                  </button>
                  <button
                    className={`flex items-center gap-2 rounded-2xl border px-6 py-3 text-xs font-black uppercase transition-all ${
                      payload.reaction === "dislike" ? "bg-slate-700 border-transparent text-white" : "bg-[var(--surface)] border-[var(--border-soft)] text-[var(--text-main)] hover:border-slate-500"
                    }`}
                    onClick={() => react("dislike")}
                  >
                    <svg className="h-4 w-4" fill={payload.reaction === "dislike" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                    {t("dislike")}
                  </button>
                  <button
                    className={`flex items-center gap-2 rounded-2xl px-8 py-3 text-xs font-black uppercase shadow-xl transition-all ${
                      payload.progress?.watched ? "bg-emerald-500 text-[var(--bg)]" : "bg-[var(--accent)] text-[var(--bg)] hover:scale-105 active:scale-95"
                    }`}
                    onClick={() => saveProgress(true)}
                  >
                    <HiCheckCircle className="text-lg" />
                    {payload.progress?.watched ? t("completed") : t("markCompleted")}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="flex h-[600px] flex-col overflow-hidden rounded-[2.5rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-2xl">
                <div className="border-b border-[var(--border-soft)] p-8">
                  <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">{t("courseContent")}</h2>
                  <div className="mt-2 h-1.5 w-12 rounded-full bg-[var(--accent)]" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {payload.course.chapters.map((chapter) => {
                    const isCurrentChapter = String(chapter._id) === String(payload.video.chapterId);
                    return (
                      <div key={chapter._id} className="mb-6">
                        <h3 className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">{chapter.title}</h3>
                        <div className="space-y-1">
                          {chapter.videos.map((v) => {
                            const isCurrent = v._id === payload.video._id;
                            const isLocked = v.locked;
                            const isWatched = v.progress?.watched;
                            return (
                              <div key={v._id} className="relative">
                                {isLocked ? (
                                  <div className="flex cursor-not-allowed items-center gap-4 rounded-2xl px-4 py-3 opacity-40 grayscale">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-sunken)]">
                                      <HiLockClosed className="text-sm" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-bold text-[var(--text-main)]">{v.title}</p>
                                      <p className="text-[9px] font-bold text-[var(--text-dim)] uppercase">{t("locked")}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <Link
                                    to={`/videos/${v._id}`}
                                    className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                                      isCurrent
                                        ? "bg-[var(--accent)] text-[var(--bg)] shadow-lg shadow-[var(--accent)]/30"
                                        : "text-[var(--text-soft)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-main)]"
                                    }`}
                                  >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isCurrent ? "bg-white/20" : "bg-[var(--surface-sunken)] text-[var(--accent)]"}`}>
                                      {isWatched ? <HiCheckCircle /> : isCurrent ? <HiOutlinePlay className="animate-pulse" /> : <span className="text-[10px] font-black">{v.order}</span>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className={`truncate text-xs font-bold ${isCurrent ? "text-[var(--bg)]" : ""}`}>{v.title}</p>
                                      <p className={`text-[9px] font-bold uppercase ${isCurrent ? "text-[var(--bg)]/70" : "text-[var(--text-dim)]"}`}>
                                        {isWatched ? t("completed") : t("lessonsLabel")}
                                      </p>
                                    </div>
                                  </Link>
                                )}
                              </div>
                            );
                          })}

                          {isCurrentChapter && quiz && quiz.questions.length > 0 && (
                            <button
                              onClick={openQuiz}
                              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all mt-1 ${
                                quizResult?.passed
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  : "bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20"
                              }`}
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600/20">
                                {quizResult?.passed ? <HiCheckCircle className="text-emerald-400" /> : <FiClipboard size={14} />}
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <p className="text-xs font-bold">{t("chapterQuiz")}</p>
                                <p className="text-[9px] font-bold uppercase">
                                  {quizResult
                                    ? `${quizResult.score}/${quizResult.total} — ${quizResult.passed ? t("quizPassed") : t("retryHint")}`
                                    : `${quiz.questions.length} ${t("questions")}`}
                                </p>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              <div className="flex h-[450px] flex-col overflow-hidden rounded-[2.5rem] border border-[var(--border-soft)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border-soft)] p-8">
                  <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">{t("comments")}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {payload.comments.length === 0 ? (
                    <p className="text-center text-xs font-bold text-[var(--text-dim)] py-10 uppercase tracking-tighter">{t("noCommentsYet")}</p>
                  ) : (
                    payload.comments.map((item) => (
                      <div className="rounded-2xl bg-[var(--surface-sunken)] p-4 border border-[var(--border-soft)]" key={item._id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-black text-[var(--bg)]">
                            {item.userId?.name?.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black text-[var(--text-main)]">{item.userId?.name}</span>
                        </div>
                        <p className="text-xs text-[var(--text-soft)] leading-relaxed">{item.text}</p>
                        <button className="mt-2 text-[9px] font-black uppercase text-[var(--accent)] hover:underline" onClick={() => setReplyTarget(item)}>{t("writeReply")}</button>
                      </div>
                    ))
                  )}
                </div>
                <form className="p-6 bg-[var(--surface-sunken)]" onSubmit={addComment}>
                  {replyTarget && (
                    <div className="mb-2 flex items-center justify-between text-[9px] font-bold text-[var(--accent)] uppercase">
                      <span>{t("replyToComment", { name: replyTarget.userId?.name })}</span>
                      <button type="button" onClick={() => setReplyTarget(null)}>X</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-[var(--surface)] border border-[var(--border-soft)] rounded-xl px-4 py-2 text-xs focus:border-[var(--accent)] outline-none"
                      placeholder={t("commentPlaceholder")}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="primary-btn !py-2 !px-4 !text-[10px]" type="submit">{t("submitComment")}</button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && quiz && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="relative w-full sm:max-w-lg max-h-[96vh] sm:max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xl flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border-soft)] shrink-0">
              <div>
                <h2 className="text-base font-black text-[var(--text-main)]">{t("chapterQuiz")}</h2>
                <p className="text-[10px] text-[var(--text-dim)] font-bold mt-0.5">{t("quizPassScore")}</p>
              </div>
              <button onClick={() => setShowQuiz(false)} className="p-2 rounded-xl hover:bg-[var(--surface-sunken)] text-[var(--text-dim)] transition-colors">
                <FiX size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-5">
                {!submitted ? (
                  <>
                    {/* Timer + progress */}
                    <div className="flex items-center gap-3 mb-6">
                      <QuizTimer timeLeft={timeLeft} totalTime={totalTime} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[var(--text-dim)]">
                            {t("quizQuestion")} {currentQIdx + 1} {t("quizOf")} {quiz.questions.length}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
                            timeLeft === 0 ? "bg-red-500/15 text-red-400" : timeLeft <= totalTime * 0.3 ? "bg-amber-500/15 text-amber-400" : "bg-[var(--surface-sunken)] text-[var(--text-dim)]"
                          }`}>
                            {timeLeft === 0 ? t("quizTimeUpMsg") : `${timeLeft}s`}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${((currentQIdx + 1) / quiz.questions.length) * 100}%`,
                              background: "linear-gradient(90deg, #6366f1, #8b5cf6)"
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-5">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-black mt-0.5">
                          {currentQIdx + 1}
                        </span>
                        <p className="text-sm font-bold text-[var(--text-main)] leading-snug pt-0.5">
                          {quiz.questions[currentQIdx].question}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2.5">
                        {quiz.questions[currentQIdx].options.map((opt, oi) => {
                          const selected = selectedAnswers[currentQIdx] === oi;
                          return (
                            <button
                              key={oi}
                              onClick={() => {
                                const updated = [...selectedAnswers];
                                updated[currentQIdx] = oi;
                                setSelectedAnswers(updated);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold border-2 transition-all text-left ${
                                selected
                                  ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                  : "bg-[var(--surface-sunken)] border-[var(--border-soft)] text-[var(--text-soft)] hover:border-indigo-500/40 hover:bg-[var(--surface)]"
                              }`}
                            >
                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black ${
                                selected ? "border-white/30 bg-white/20 text-white" : "border-[var(--border-soft)] text-[var(--text-dim)]"
                              }`}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {selected && <FiCheck size={14} className="shrink-0 opacity-80" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dot navigation */}
                    <div className="flex items-center justify-center gap-1.5 mb-5">
                      {quiz.questions.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentQIdx(i)}
                          className={`rounded-full transition-all duration-200 ${
                            i === currentQIdx
                              ? "w-5 h-2 bg-indigo-500"
                              : selectedAnswers[i] !== undefined
                                ? "w-2 h-2 bg-emerald-400"
                                : "w-2 h-2 bg-[var(--border-soft)] hover:bg-[var(--text-dim)]"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-2">
                      {currentQIdx > 0 ? (
                        <button
                          onClick={() => setCurrentQIdx((i) => i - 1)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-soft)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--surface)] transition-colors"
                        >
                          <FiArrowLeft size={14} /> {t("quizPrevBtn")}
                        </button>
                      ) : <div />}
                      <div className="flex-1" />
                      {currentQIdx < quiz.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQIdx((i) => i + 1)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                        >
                          {t("quizNextBtn")} <FiArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={handleQuizSubmit}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-black uppercase tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                        >
                          <FiCheck size={14} /> {t("submitQuiz")}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Result view */
                  <div className="text-center space-y-6 py-4">
                    <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                      submitResult.passed ? "bg-emerald-500/10" : "bg-rose-500/10"
                    }`}>
                      {submitResult.passed ? "🎉" : "😓"}
                    </div>
                    <div>
                      <p className={`text-3xl font-black ${submitResult.passed ? "text-emerald-400" : "text-rose-400"}`}>
                        {submitResult.score}/{submitResult.total}
                      </p>
                      <p className="text-lg font-black text-[var(--text-main)] mt-1">
                        {submitResult.passed ? t("quizPassedMsg") : t("quizFailedMsg")}
                      </p>
                      <p className="text-sm text-[var(--text-dim)] mt-1">
                        {Math.round((submitResult.score / submitResult.total) * 100)}% {t("correctPercent")}
                      </p>
                    </div>

                    <div className="space-y-3 text-left">
                      {quiz.questions.map((q, qi) => {
                        const userAns = selectedAnswers[qi];
                        const correctAns = submitResult.correctAnswers[qi];
                        const isCorrect = userAns === correctAns;
                        return (
                          <div key={qi} className={`rounded-xl p-4 border ${isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                            <div className="flex items-start gap-2 mb-2">
                              {isCorrect ? <FiCheck className="text-emerald-400 shrink-0 mt-0.5" size={14} /> : <FiX className="text-rose-400 shrink-0 mt-0.5" size={14} />}
                              <p className="text-xs font-bold text-[var(--text-main)]">{q.question}</p>
                            </div>
                            <div className="pl-5 space-y-1">
                              {!isCorrect && userAns !== undefined && userAns >= 0 && (
                                <p className="text-[10px] text-rose-400 font-bold">{t("yourAnswer")}: {q.options[userAns] ?? "—"}</p>
                              )}
                              <p className="text-[10px] text-emerald-400 font-bold">{t("correctAnswer")}: {q.options[correctAns]}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      {!submitResult.passed && (
                        <button
                          onClick={() => { setSubmitted(false); setSubmitResult(null); setSelectedAnswers([]); setCurrentQIdx(0); }}
                          className="flex-1 py-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-soft)] text-sm font-black text-[var(--text-main)] hover:bg-[var(--surface)] transition-colors"
                        >
                          {t("retryQuiz")}
                        </button>
                      )}
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-black hover:opacity-90 transition-opacity"
                      >
                        {t("closeBtn")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
