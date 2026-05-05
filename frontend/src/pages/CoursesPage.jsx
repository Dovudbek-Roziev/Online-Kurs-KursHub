import { useEffect, useMemo, useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import CourseCard from "../components/ui/CourseCard";
import { useSettings } from "../context/SettingsContext";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiFilter, FiX, FiCheck, FiDollarSign, FiZap, FiStar } from "react-icons/fi";

export default function CoursesPage() {
  const { t } = useSettings();
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [pricing, setPricing] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (query.trim()) search.set("q", query.trim());
    if (pricing) search.set("pricing", pricing);
    if (category) search.set("category", category);
    if (minRating) search.set("minRating", minRating);
    const str = search.toString();
    return str ? `?${str}` : "";
  }, [category, minRating, pricing, query]);

  useEffect(() => {
    apiFetch("/courses/categories")
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch(`/courses${params}`, { token })
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params, token]);

  const clearFilters = () => {
    setQuery("");
    setPricing("");
    setCategory("");
    setMinRating("");
  };

  const filteredCourses = courses;

  return (
    <div className="shell pb-24 pt-12">
      <SectionHeading
        eyebrow={t("catalogEyebrow")}
        title={t("catalogTitle")}
        description={t("catalogFiltersText")}
        align="left"
      />

      <div className="mt-10 space-y-10">
        {/* FILTERS BLOCK */}
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 space-y-5 shadow-sm">

          {/* Search */}
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent)] text-base transition-colors" />
            <input
              className="w-full bg-[var(--bg)] border border-[var(--border-soft)] text-[var(--text-main)] rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all placeholder:text-[var(--text-dim)]"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-soft)]" />

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Price filter */}
              <div>
                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-2">{t("pricing")}</p>
                <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--border-soft)] rounded-xl p-1">
                  {[
                    { id: "", label: t("allPrices") },
                    { id: "free", label: t("free") },
                    { id: "paid", label: t("paid") }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPricing(p.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        pricing === p.id
                          ? "bg-[var(--accent)] text-white shadow-sm"
                          : "text-[var(--text-soft)] hover:text-[var(--text-main)] hover:bg-[var(--surface-strong)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-2">{t("minRating")}</p>
                <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--border-soft)] rounded-xl p-1">
                  {[
                    { id: "", label: t("allLabel") },
                    { id: "3", label: "3+" },
                    { id: "4", label: "4+" },
                    { id: "5", label: "5★" }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setMinRating(r.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        minRating === r.id
                          ? "bg-amber-500 text-white shadow-sm"
                          : "text-[var(--text-soft)] hover:text-[var(--text-main)] hover:bg-[var(--surface-strong)]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset */}
            {(category || pricing || minRating || query) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-all"
              >
                <FiX /> {t("cancel")}
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-3">{t("allCategories")}</p>
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setCategory("")}
                  className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    !category
                      ? "bg-[var(--accent)] text-white border-transparent shadow-md"
                      : "bg-[var(--bg)] text-[var(--text-soft)] border-[var(--border-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {t("allCategories")}
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      category === c
                        ? "bg-[var(--accent)] text-white border-transparent shadow-md"
                        : "bg-[var(--bg)] text-[var(--text-soft)] border-[var(--border-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[var(--surface)] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[16/10] w-full rounded-[2.5rem] bg-[var(--surface-sunken)] animate-pulse border border-[var(--border-soft)]" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.slice(0, visibleCount).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="h-24 w-24 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center mb-8 border border-[var(--border-soft)]">
                <FiSearch className="text-5xl text-[var(--text-dim)] opacity-20" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-3">{t("noCoursesFound")}</h3>
              <p className="text-sm text-[var(--text-dim)] max-w-sm">{t("noCoursesHint")}</p>
              <button onClick={clearFilters} className="mt-10 primary-btn !rounded-2xl !px-10">{t("viewAllCourses")}</button>
            </div>
          )}

          {visibleCount < filteredCourses.length && !loading && (
            <div className="flex justify-center pt-20">
              <button 
                onClick={() => setVisibleCount(v => v + 6)}
                className="group relative px-16 py-4 bg-[var(--text-main)] text-[var(--bg)] rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                {t("showMore")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
