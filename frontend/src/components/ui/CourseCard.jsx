import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { FiArrowRight } from "react-icons/fi";
import { HiStar } from "react-icons/hi";

export default function CourseCard({ course }) {
  const { t } = useSettings();
  const id = course?._id || course?.id;
  const isFree = !course.price || course.price === 0;
  const instructorLabel = course?.createdBy?.name || course?.instructor || t("userFallback");
  const rating = course.rating?.toFixed(1) || "5.0";
  const ratingInt = Math.round(course.rating || 5);

  return (
    <Link
      to={`/courses/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 hover:border-[var(--accent)]/20"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[var(--surface-sunken)]">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10">
            <span className="text-6xl font-black text-[var(--accent)] opacity-20">
              {(course.category || "K").charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3.5 top-3.5 right-3.5 flex items-start justify-between gap-2">
          {course.category && (
            <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              {course.category}
            </span>
          )}
          {isFree ? (
            <span className="ml-auto rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30">
              {t("free")}
            </span>
          ) : (
            <span className="ml-auto rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-[var(--accent)]/30">
              ${course.price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <HiStar
                key={v}
                className={`text-xs transition-colors ${ratingInt >= v ? "text-amber-400" : "text-[var(--border-soft)]"}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-[var(--text-main)]">{rating}</span>
          <span className="text-[11px] text-[var(--text-dim)]">· {course.views || 0} {t("viewsLabel")}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-black leading-snug text-[var(--text-main)] line-clamp-2 transition-colors duration-200 group-hover:text-[var(--accent)]">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs leading-relaxed text-[var(--text-dim)] line-clamp-2">
          {course.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border-soft)] pt-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-black text-white uppercase shadow-sm">
              {instructorLabel.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">{t("instructor")}</p>
              <p className="truncate text-xs font-bold text-[var(--text-main)]">{instructorLabel}</p>
            </div>
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-black text-[var(--accent)] transition-all duration-200 group-hover:bg-[var(--accent)] group-hover:text-white group-hover:gap-2">
            {t("preview")} <FiArrowRight className="text-sm" />
          </span>
        </div>
      </div>
    </Link>
  );
}
