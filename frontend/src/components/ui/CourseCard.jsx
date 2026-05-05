import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { HiOutlineStar, HiOutlineEye, HiOutlineUsers } from "react-icons/hi";
import { FiArrowUpRight, FiTag } from "react-icons/fi";

export default function CourseCard({ course }) {
  const { t } = useSettings();
  const id = course?._id || course?.id;
  const isFree = !course.price || course.price === 0;
  const instructorLabel = course?.createdBy?.name || course?.instructor || t("userFallback");

  return (
    <Link 
      to={`/courses/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-[var(--border-soft)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-strong)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] hover:border-[var(--accent)]/30"
    >
      {/* Thumbnail with Overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-sunken)]">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[var(--accent)]/20 to-indigo-500/20">
            <span className="text-4xl font-black text-[var(--accent)] opacity-20">{(course.category || "C").slice(0, 1)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
        
        {/* Badges */}
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
            <FiTag className="text-[var(--accent)]" /> {course.category || "General"}
          </span>
          {isFree && (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20">
              {t("free")}
            </span>
          )}
        </div>

        {/* Floating Price Tag */}
        {!isFree && (
          <div className="absolute right-5 top-5">
            <span className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-xs font-black text-[var(--bg)] shadow-xl shadow-[var(--accent)]/30">
              ${course.price?.toLocaleString()}
            </span>
          </div>
        )}

        {/* View Arrow on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
            <FiArrowUpRight className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-7">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((v) => (
                <HiOutlineStar 
                  key={v} 
                  className={`text-[11px] ${Math.round(course.rating || 5) >= v ? "fill-current" : "opacity-30"}`} 
                />
              ))}
            </div>
            <span className="text-xs font-black text-[var(--text-main)] ml-1">{course.rating?.toFixed(1) || "5.0"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-dim)]">
            <HiOutlineUsers className="text-sm" />
            <span className="text-[10px] font-bold">{course.views || 0} {t("viewsLabel").toLowerCase()}</span>
          </div>
        </div>

        <h3 className="mb-3 text-lg font-black leading-tight text-[var(--text-main)] line-clamp-2 transition-colors group-hover:text-[var(--accent)]">
          {course.title}
        </h3>

        <p className="mb-8 text-xs font-medium leading-relaxed text-[var(--text-dim)] line-clamp-2">
          {course.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border-soft)] pt-7">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-indigo-500 p-[1.5px] shadow-lg">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--surface-strong)] text-[11px] font-black text-[var(--text-main)] uppercase">
                {instructorLabel.charAt(0)}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.1em]">{t("instructor")}</span>
              <span className="text-xs font-black text-[var(--text-main)] line-clamp-1">{instructorLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-[var(--surface-sunken)] px-3 py-1.5 border border-[var(--border-soft)] transition-colors group-hover:border-[var(--accent)]/30">
            <HiOutlineEye className="text-[var(--text-dim)] group-hover:text-[var(--accent)]" />
            <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-tighter">{t("preview")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
