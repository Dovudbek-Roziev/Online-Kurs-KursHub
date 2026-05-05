import React, { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { apiFetch } from '../../api/client';

const Categories = () => {
  const { t, language } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/courses/categories')
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl space-y-4 md:space-y-8 animate-reveal">
      <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl overflow-hidden">
        <div className="p-3 md:p-6 border-b border-[var(--border-soft)] flex justify-between items-center gap-2">
          <h2 className="text-sm md:text-lg font-bold text-[var(--text-main)]">
            {t('categories') || 'Kategoriyalar'}
          </h2>
          <span className="text-[10px] md:text-xs font-medium text-[var(--text-dim)] bg-[var(--surface)] px-2 md:px-2.5 py-1 rounded-full border border-[var(--border-soft)]">
            {categories.length} {language === 'ru' ? 'категорий' : 'ta'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-14 text-center">
            <FiTag size={32} className="mx-auto text-[var(--text-dim)] mb-3" />
            <p className="text-sm font-bold text-[var(--text-dim)]">
              {language === 'ru' ? 'Категорий нет' : 'Kategoriya topilmadi'}
            </p>
            <p className="text-xs text-[var(--text-dim)] mt-1">
              {language === 'ru' ? 'Категории создаются при добавлении курсов' : 'Kategoriyalar kurs qo\'shilganda yaratiladi'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {categories.map((cat, i) => (
              <div key={i} className="p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-[var(--surface)] transition-colors">
                <div className="p-2 md:p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border-soft)] shrink-0">
                  <FiTag className="text-blue-500" size={16} />
                </div>
                <span className="text-xs md:text-sm font-medium text-[var(--text-main)] truncate">{cat}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
