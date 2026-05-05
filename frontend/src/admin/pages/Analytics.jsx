import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiActivity, FiUsers, FiDollarSign, FiBook, FiEye } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

const Analytics = () => {
  const { t, language } = useSettings();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/analytics', { token })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 animate-reveal">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const stats = [
    {
      label: language === 'ru' ? 'Активных студентов' : 'Faol talabalar',
      value: data?.activeUsers ?? '—',
      icon: FiUsers,
      color: 'text-blue-500',
    },
    {
      label: language === 'ru' ? 'Общий доход' : 'Umumiy daromad',
      value: data?.revenue ? `$${data.revenue.toLocaleString()}` : '$0',
      icon: FiDollarSign,
      color: 'text-emerald-500',
    },
    {
      label: language === 'ru' ? 'Топ-курсов' : 'Top kurslar',
      value: data?.topCourses?.length ?? '—',
      icon: FiBook,
      color: 'text-violet-500',
    },
    {
      label: language === 'ru' ? 'Топ видео' : 'Top videolar',
      value: data?.topLikedVideos?.length ?? '—',
      icon: FiActivity,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-reveal">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-[var(--surface-strong)] border border-[var(--border-soft)] p-3 md:p-6 rounded-lg md:rounded-xl">
            <div className="flex items-center gap-2 md:gap-4">
              <div className={`p-2 md:p-3 bg-[var(--surface)] rounded-lg border border-[var(--border-soft)] ${item.color}`}>
                <item.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[var(--text-dim)] text-[9px] md:text-xs font-medium uppercase tracking-wider truncate">{item.label}</p>
                <p className="text-lg md:text-2xl font-bold text-[var(--text-main)] mt-0.5">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Courses */}
        <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-[var(--text-main)] mb-4">
            {language === 'ru' ? 'Топ курсов' : 'Top kurslar'}
          </h2>
          {!data?.topCourses?.length ? (
            <p className="text-xs text-[var(--text-dim)] py-4 text-center">
              {language === 'ru' ? 'Данных нет' : 'Ma\'lumot yo\'q'}
            </p>
          ) : (
            <div className="space-y-3">
              {data.topCourses.map((course, i) => (
                <div key={course._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-black text-[var(--text-dim)] w-4 shrink-0">{i + 1}</span>
                    <span className="text-xs md:text-sm text-[var(--text-main)] truncate">{course.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <FiEye size={12} className="text-[var(--text-dim)]" />
                    <span className="text-xs font-bold text-[var(--text-soft)]">{course.views ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Active Users */}
        <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-[var(--text-main)] mb-4">
            {language === 'ru' ? 'Активные студенты' : 'Faol talabalar'}
          </h2>
          {!data?.mostActiveUsers?.length ? (
            <p className="text-xs text-[var(--text-dim)] py-4 text-center">
              {language === 'ru' ? 'Данных нет' : 'Ma\'lumot yo\'q'}
            </p>
          ) : (
            <div className="space-y-3">
              {data.mostActiveUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[10px] font-black text-indigo-400">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs md:text-sm text-[var(--text-main)] truncate">{u.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-dim)] shrink-0">
                    {u.total} {language === 'ru' ? 'видео' : 'video'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Liked Videos */}
        <div className="lg:col-span-2 bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-[var(--text-main)] mb-4">
            {language === 'ru' ? 'Популярные видео' : 'Mashhur videolar'}
          </h2>
          {!data?.topLikedVideos?.length ? (
            <p className="text-xs text-[var(--text-dim)] py-4 text-center">
              {language === 'ru' ? 'Данных нет' : 'Ma\'lumot yo\'q'}
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-soft)]">
              {data.topLikedVideos.map((video, i) => (
                <div key={video._id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-black text-[var(--text-dim)] w-4 shrink-0">{i + 1}</span>
                    <span className="text-xs md:text-sm text-[var(--text-main)] truncate">{video.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--text-dim)]">
                    <span className="text-emerald-500 font-bold">+{video.likes ?? 0}</span>
                    <span className="text-rose-400 font-bold">-{video.dislikes ?? 0}</span>
                    <span>{video.views ?? 0} {language === 'ru' ? 'просм.' : 'ko\'r.'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
