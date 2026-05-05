import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Courses = () => {
  const { t } = useSettings();
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/courses', { token })
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-reveal">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div className="relative w-full md:w-96 group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder={t('searchCourses') || 'Qidirish...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl py-2 md:py-2.5 pl-10 pr-4 text-xs md:text-sm text-[var(--text-main)] focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] md:text-sm">
              <thead>
                <tr className="text-[var(--text-dim)] text-[9px] md:text-[10px] uppercase tracking-[0.1em] border-b border-[var(--border-soft)] bg-[var(--surface)] whitespace-nowrap">
                  <th className="px-3 md:px-6 py-3 md:py-4 font-black">{t('titleField') || 'Nomi'}</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-black hidden md:table-cell">{t('category') || 'Kategoriya'}</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-black text-center">{t('priceField') || 'Narx'}</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-black hidden sm:table-cell">{t('status') || 'Holat'}</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-black text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-[var(--text-dim)]">
                      Kurs topilmadi
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <tr key={course._id} className="hover:bg-[var(--surface)] transition-colors group">
                      <td className="px-3 md:px-6 py-3 md:py-5 truncate max-w-[180px]">
                        <div className="font-bold text-[var(--text-main)] truncate text-[10px] md:text-sm">{course.title}</div>
                        <div className="text-[8px] md:text-[10px] text-[var(--text-dim)] uppercase mt-0.5 font-bold tracking-wider">
                          {course.views || 0} ko'rishlar
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5 text-[var(--text-soft)] font-medium text-[10px] md:text-sm hidden md:table-cell">
                        {course.category || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5 text-[var(--text-soft)] font-bold text-[10px] md:text-sm text-center">
                        {course.price === 0 ? 'Bepul' : `$${course.price}`}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider ${
                          course.isPublished
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-[var(--surface-sunken)] text-[var(--text-dim)] border border-[var(--border-soft)]'
                        }`}>
                          {course.isPublished ? 'Aktiv' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5">
                        <div className="flex justify-center">
                          <Link
                            to={`/admin/courses/${course._id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                          >
                            <FiSettings size={12} />
                            Boshqarish
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
