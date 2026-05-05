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

      <div className="mt-12 space-y-12">
        {/* SLEEK HORIZONTAL FILTERS */}
        <div className="space-y-6">
          {/* Main Filter Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 group">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent)] transition-colors" />
              <input 
                className="w-full bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-main)] rounded-[1.5rem] py-4 pl-12 pr-4 text-sm focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all placeholder:text-[var(--text-dim)]/40 shadow-sm"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filter Pills Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Pricing Pill */}
              <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-2xl border border-[var(--border-soft)] shadow-sm">
                {[
                  { id: "", label: t("allPrices") },
                  { id: "free", label: t("free") },
                  { id: "paid", label: t("paid") }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPricing(p.id)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                      pricing === p.id 
                        ? "bg-[var(--text-main)] text-[var(--bg)] shadow-md" 
                        : "text-[var(--text-dim)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Rating Pill */}
              <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-2xl border border-[var(--border-soft)] shadow-sm">
                {[
                  { id: "", label: t("allLabel") },
                  { id: "3", label: "3+" },
                  { id: "4", label: "4+" },
                  { id: "5", label: "5" }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setMinRating(r.id)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                      minRating === r.id 
                        ? "bg-[var(--text-main)] text-[var(--bg)] shadow-md" 
                        : "text-[var(--text-dim)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    {r.id && <FiStar className={minRating === r.id ? "fill-current" : "text-amber-500"} />}
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Reset Button */}
              {(category || pricing || minRating || query) && (
                <button 
                  onClick={clearFilters}
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title={t("cancel")}
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {/* Categories Pill Bar - Scrollable */}
          <div className="relative overflow-hidden">
            <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              <button
                onClick={() => setCategory("")}
                className={`flex-none px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  !category 
                    ? "bg-[var(--accent)] text-white border-transparent shadow-lg shadow-[var(--accent)]/20" 
                    : "bg-[var(--surface)] text-[var(--text-soft)] border-[var(--border-soft)] hover:border-[var(--text-dim)]"
                }`}
              >
                {t("allCategories")}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex-none px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    category === c 
                      ? "bg-[var(--accent)] text-white border-transparent shadow-lg shadow-[var(--accent)]/20" 
                      : "bg-[var(--surface)] text-[var(--text-soft)] border-[var(--border-soft)] hover:border-[var(--text-dim)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Fade effect for scroll */}
            <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent pointer-events-none" />
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
