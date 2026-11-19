import React, { useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useWorkspace } from '../context/WorkspaceContext';
import { ThemeMode, ViewMode } from '../types/taskflow';

export function SettingsPage() {
  const {
    workspaceName,
    currentMember,
    defaultView,
    savePreferences,
    theme,
    setTheme,
    simulationSettings,
    setSimulationSettings,
  } = useWorkspace();

  const [selectedView, setSelectedView] = useState<ViewMode>(defaultView);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences(selectedView);
    setSavedNotice(
      `Preferences saved. ${selectedView} view will apply when next opening a workspace.`
    );
  };

  return (
    <AppShell title="Settings" subtitle={workspaceName}>
      <div className="max-w-2xl space-y-6">
        {/* Workspace & Demo Member Card */}
        <section
          aria-labelledby="settings-profile-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
        >
          <h2
            id="settings-profile-heading"
            className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100"
          >
            Workspace member
          </h2>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Current demo member
              </dt>
              <dd className="mt-1 text-[16px] font-semibold text-[#172B4D] dark:text-slate-100">
                {currentMember.name}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Workspace
              </dt>
              <dd className="mt-1 text-[16px] font-semibold text-[#172B4D] dark:text-slate-100">
                {workspaceName}
              </dd>
            </div>
          </dl>
        </section>

        {/* Appearance Theme Card */}
        <section
          aria-labelledby="settings-appearance-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
        >
          <h2
            id="settings-appearance-heading"
            className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100"
          >
            Appearance
          </h2>
          <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
            Switch between light and dark workspace surfaces.
          </p>

          <div
            role="radiogroup"
            aria-label="Color theme"
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {(
              [
                {
                  value: 'light',
                  label: 'Light',
                  desc: 'Crisp pale slate canvas and white cards',
                  icon: Sun,
                },
                {
                  value: 'dark',
                  label: 'Dark',
                  desc: 'Low-glare dark slate surfaces',
                  icon: Moon,
                },
              ] as Array<{
                value: ThemeMode;
                label: string;
                desc: string;
                icon: typeof Sun;
              }>
            ).map(({ value, label, desc, icon: Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(value)}
                  className={`flex items-start gap-3 text-left min-h-[44px] p-4 rounded-lg border transition-colors ${
                    active
                      ? 'border-[#1D4ED8] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      active
                        ? 'text-[#1D4ED8] dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <span className="block text-[15px] font-semibold text-[#172B4D] dark:text-slate-100">
                      {label}
                    </span>
                    <span className="block text-[14px] text-slate-600 dark:text-slate-400">
                      {desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Preferences Form */}
        <section
          aria-labelledby="settings-prefs-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
        >
          <h2
            id="settings-prefs-heading"
            className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100"
          >
            Workspace preferences
          </h2>
          <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
            Choose the default layout used when you next open the Dashboard or a
            project workspace.
          </p>

          <form onSubmit={handleSave} className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-2">
                Default task view
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Board', 'List'] as ViewMode[]).map((mode) => {
                  const checked = selectedView === mode;
                  return (
                    <label
                      key={mode}
                      className={`flex items-start gap-3 min-h-[44px] p-4 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#1D4ED8] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="defaultView"
                        value={mode}
                        checked={checked}
                        onChange={() => {
                          setSelectedView(mode);
                          setSavedNotice(null);
                        }}
                        className="mt-1 w-4 h-4 text-[#1D4ED8] border-slate-300 dark:border-slate-600"
                      />
                      <div>
                        <span className="block text-[15px] font-semibold text-[#172B4D] dark:text-slate-100">
                          {mode}
                        </span>
                        <span className="block text-[14px] text-slate-600 dark:text-slate-400">
                          {mode === 'Board'
                            ? 'Four stage columns for visual handoffs'
                            : 'Compact rows sorted by earliest deadline'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
              >
                Save preferences
              </button>

              {savedNotice && (
                <p
                  role="status"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-emerald-700 dark:text-emerald-400"
                >
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{savedNotice}</span>
                </p>
              )}
            </div>
          </form>
        </section>

        {/* Prototype error simulation controls for testing retry paths */}
        <section
          aria-labelledby="settings-sim-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
        >
          <h2
            id="settings-sim-heading"
            className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100"
          >
            Prototype error simulation
          </h2>
          <p className="mt-1 text-[14px] text-slate-600 dark:text-slate-300">
            Enable any toggle below to simulate a single failed request on your
            next action and verify retry behavior. Each flag resets automatically
            after triggering once.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={simulationSettings.failNextLoad}
                onChange={(e) =>
                  setSimulationSettings((prev) => ({
                    ...prev,
                    failNextLoad: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#1D4ED8]"
              />
              <span className="text-[15px] text-[#172B4D] dark:text-slate-200">
                Fail next workspace load
              </span>
            </label>

            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={simulationSettings.failNextSave}
                onChange={(e) =>
                  setSimulationSettings((prev) => ({
                    ...prev,
                    failNextSave: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#1D4ED8]"
              />
              <span className="text-[15px] text-[#172B4D] dark:text-slate-200">
                Fail next task save
              </span>
            </label>

            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={simulationSettings.failNextMove}
                onChange={(e) =>
                  setSimulationSettings((prev) => ({
                    ...prev,
                    failNextMove: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#1D4ED8]"
              />
              <span className="text-[15px] text-[#172B4D] dark:text-slate-200">
                Fail next stage move
              </span>
            </label>

            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={simulationSettings.failNextComment}
                onChange={(e) =>
                  setSimulationSettings((prev) => ({
                    ...prev,
                    failNextComment: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#1D4ED8]"
              />
              <span className="text-[15px] text-[#172B4D] dark:text-slate-200">
                Fail next comment post
              </span>
            </label>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
