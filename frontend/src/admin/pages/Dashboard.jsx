import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBook, FiDollarSign, FiEye, FiArrowUpRight, FiTrendingUp } from 'react-icons/fi';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const STAT_COLORS = [
  { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', ring: 'ring-indigo-500/20', dot: 'bg-indigo-500' },
  { bg: 'bg-violet-500/10', icon: 'text-violet-400', ring: 'ring-violet-500/20', dot: 'bg-violet-500' },
  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500/10', icon: 'text-amber-400', ring: 'ring-amber-500/20', dot: 'bg-amber-500' },
];

const StatCard = ({ title, value, sub, icon: Icon, trend, colorIdx }) => {
  const c = STAT_COLORS[colorIdx % STAT_COLORS.length];
  const positive = trend >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 transition-all hover:border-[var(--border-soft)] hover:shadow-lg hover:shadow-black/10">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${c.bg} ${c.ring}`}>
          <Icon size={18} className={c.icon} />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black ${
          positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          <FiTrendingUp size={9} className={positive ? '' : 'rotate-180'} />
          {positive ? '+' : ''}{trend}%
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-black text-[var(--text-main)] md:text-3xl">{value}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">{title}</p>
        {sub && <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">{sub}</p>}
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${c.dot} opacity-20 transition-opacity group-hover:opacity-60`} />
    </div>
  );
};

const Dashboard = () => {
  const { t, language } = useSettings();
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/courses', { token })
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const published = courses.filter((c) => c.isPublished).length;
  const draft = courses.length - published;

  const stats = [
    { title: t('activeUsers') || 'Faol foydalanuvchilar', value: '—', sub: t('platformUsers') || '', icon: FiUsers, trend: 0 },
    { title: t('totalCoursesLabel') || 'Jami kurslar', value: courses.length || '—', sub: `${published} aktiv · ${draft} draft`, icon: FiBook, trend: 0 },
    { title: t('revenue') || 'Daromad', value: '—', icon: FiDollarSign, trend: 0 },
    { title: t('viewsLabel') || "Ko'rishlar", value: '—', icon: FiEye, trend: 0 },
  ];

  return (
    <div className="space-y-6 animate-reveal">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} colorIdx={i} />
        ))}
      </div>

      {/* Courses table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-[var(--text-main)]">
              {language === 'ru' ? 'Все курсы' : 'Barcha kurslar'}
            </h2>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              {language === 'ru' ? `${courses.length} курсов на платформе` : `Platformada ${courses.length} ta kurs`}
            </p>
          </div>
          <Link
            to="/admin/courses"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600/10 px-3 py-1.5 text-[11px] font-bold text-indigo-400 transition-colors hover:bg-indigo-600 hover:text-white"
          >
            {language === 'ru' ? 'Все курсы' : 'Barchasi'}
            <FiArrowUpRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
          </div>
        ) : courses.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-bold text-[var(--text-dim)]">
              {language === 'ru' ? 'Курсов пока нет' : 'Hali kurs yo\'q'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface)] text-[9px] font-black uppercase tracking-[0.12em] text-[var(--text-dim)] md:text-[10px]">
                  <th className="px-5 py-3">{language === 'ru' ? 'Название' : 'Nomi'}</th>
                  <th className="hidden px-5 py-3 md:table-cell">{language === 'ru' ? 'Категория' : 'Kategoriya'}</th>
                  <th className="px-5 py-3 text-center">{language === 'ru' ? 'Цена' : 'Narx'}</th>
                  <th className="px-5 py-3 text-center">{language === 'ru' ? 'Статус' : 'Holat'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {courses.slice(0, 6).map((course) => (
                  <tr key={course._id} className="group transition-colors hover:bg-[var(--surface)]">
                    <td className="px-5 py-4">
                      <p className="max-w-[200px] truncate font-bold text-[var(--text-main)]">{course.title}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">{course.views || 0} {language === 'ru' ? 'просмотров' : "ko'rish"}</p>
                    </td>
                    <td className="hidden px-5 py-4 text-[var(--text-soft)] md:table-cell">
                      {course.category || '—'}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-[var(--text-soft)]">
                      {course.price === 0 ? (language === 'ru' ? 'Бесплатно' : 'Bepul') : `$${course.price}`}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        course.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                          : 'bg-[var(--surface-sunken)] text-[var(--text-dim)] ring-1 ring-[var(--border-soft)]'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${course.isPublished ? 'bg-emerald-400' : 'bg-[var(--text-dim)]'}`} />
                        {course.isPublished ? (language === 'ru' ? 'Активен' : 'Aktiv') : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
