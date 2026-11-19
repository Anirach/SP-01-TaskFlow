import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: React.ReactNode;
  workspaceKey?: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  workspaceKey,
  children,
}: AppShellProps) {
  const {
    workspaceName,
    currentMember,
    liveAnnouncement,
    announce,
    getWorkspaceScroll,
    setWorkspaceScroll,
  } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    announce('Signed out');
    navigate('/');
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Restore scroll position for workspace views
  useEffect(() => {
    if (!workspaceKey || !mainScrollRef.current) return;
    const saved = getWorkspaceScroll(workspaceKey);
    mainScrollRef.current.scrollTop = saved;
  }, [workspaceKey, getWorkspaceScroll]);

  const handleMainScroll = () => {
    if (!workspaceKey || !mainScrollRef.current) return;
    setWorkspaceScroll(workspaceKey, mainScrollRef.current.scrollTop);
  };

  // Trap Escape to close mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuBtnRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-slate-950 text-[#172B4D] dark:text-slate-100">
      {/* Screen reader live announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1D4ED8] focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <aside
        aria-label="Primary navigation"
        className="hidden md:flex md:flex-col md:w-60 md:shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-[18px] font-bold tracking-tight text-[#172B4D] dark:text-slate-100 hover:text-[#1D4ED8] dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#1D4ED8] text-white text-[14px] font-bold">
                TF
              </span>
              <span>TaskFlow</span>
            </Link>
            <p className="mt-1 text-[14px] text-slate-600 dark:text-slate-400 truncate">
              {workspaceName}
            </p>
          </div>
          <ThemeToggleButton className="-mr-2" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-lg text-[15px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400'
                    : 'text-[#172B4D] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
              Signed in as
            </p>
            <p className="text-[14px] font-semibold text-[#172B4D] dark:text-slate-100 truncate">
              {currentMember.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1D4ED8] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar (< 768px) */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <button
            ref={mobileMenuBtnRef}
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg text-[#172B4D] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <Link
            to="/"
            className="text-[17px] font-bold tracking-tight text-[#172B4D] dark:text-slate-100 whitespace-nowrap"
          >
            TaskFlow
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[14px] text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
            {currentMember.name}
          </span>
          <ThemeToggleButton className="-mr-2" />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[17px] font-bold text-[#172B4D] dark:text-slate-100">
                  TaskFlow
                </p>
                <p className="text-[14px] text-slate-600 dark:text-slate-400">
                  {workspaceName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  mobileMenuBtnRef.current?.focus();
                }}
                aria-label="Close navigation menu"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-lg text-[16px] font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400'
                        : 'text-[#172B4D] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Demo member
                </p>
                <p className="text-[15px] font-semibold text-[#172B4D] dark:text-slate-100 truncate">
                  {currentMember.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1D4ED8] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto"
      >
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-1.5">
              <ol className="flex items-center gap-2 text-[14px] text-slate-600 dark:text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.label} className="inline-flex items-center gap-2">
                    {index > 0 && (
                      <span
                        className="text-slate-400 dark:text-slate-600"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    )}
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="hover:text-[#1D4ED8] dark:hover:text-blue-400 hover:underline font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-[#172B4D] dark:text-slate-100 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[24px] font-bold leading-tight text-[#172B4D] dark:text-slate-100 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 text-[14px] text-slate-600 dark:text-slate-400 tabular-nums">
                  {subtitle}
                </p>
              )}
            </div>
            {primaryAction && (
              <div className="shrink-0">{primaryAction}</div>
            )}
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 min-w-0"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
