import React from 'react';
import { FiUser, FiLock, FiBell, FiShield, FiSave } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';

const Settings = () => {
  const { t } = useSettings();
  return (
    <div className="max-w-4xl space-y-4 md:space-y-8 pb-8 md:pb-12 animate-reveal">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-main)]">{t('navSettings') || 'Settings'}</h1>
        <p className="text-[var(--text-dim)] text-xs md:text-sm mt-1">{t('settingsText') || 'Manage your profile.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {[
              { label: t('general') || 'General', icon: FiUser, active: true },
              { label: t('security') || 'Security', icon: FiLock },
              { label: 'Notifications', icon: FiBell },
              { label: 'Permissions', icon: FiShield },
            ].map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  item.active
                  ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--surface)]'
                }`}
              >
                <item.icon size={18} />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-3 space-y-4 md:space-y-6">
          <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
            <h2 className="text-sm md:text-lg font-bold text-[var(--text-main)]">{t('general') || 'General'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-medium text-[var(--text-soft)]">{t('firstName') || 'First'}</label>
                <input type="text" defaultValue="Admin" className="w-full bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-medium text-[var(--text-soft)]">{t('lastName') || 'Last'}</label>
                <input type="text" defaultValue="KursHub" className="w-full bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-xs md:text-sm font-medium text-[var(--text-soft)]">{t('email') || 'Email'}</label>
              <input type="email" defaultValue="admin@kurshub.com" className="w-full bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="pt-2 md:pt-4 flex justify-end">
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors shadow-lg shadow-blue-600/10 whitespace-nowrap">
                <FiSave size={16} /> {t('save') || 'Save'}
              </button>
            </div>
          </div>

          <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl p-4 md:p-6 space-y-3 md:space-y-6">
            <h2 className="text-sm md:text-lg font-bold text-rose-500">{t('dangerZone') || 'Danger'}</h2>
            <p className="text-xs md:text-sm text-[var(--text-dim)]">{t('dangerWarning') || 'Be careful.'}</p>
            <div className="pt-2">
              <button className="border border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all">
                {t('reset') || 'Reset'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
