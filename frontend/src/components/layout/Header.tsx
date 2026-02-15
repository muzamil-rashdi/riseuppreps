import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api/auth.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/utils/formatters';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

// Breadcrumb label map
const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  invitations: 'Invitations',
  assignments: 'Assignments',
  subjects: 'Subjects',
  finance: 'Finance',
  announcements: 'Announcements',
  messages: 'Messages',
  reports: 'Reports',
  quizzes: 'Quizzes',
  marks: 'Enter Marks',
  attendance: 'Attendance',
  students: 'Students',
  'my-students': 'My Students',
  'my-marks': 'My Marks',
  profile: 'Profile',
  documents: 'Documents',
  achievements: 'Achievements',
  'my-updates': 'My Updates',
};

export function Header() {
  const { toggleCollapsed, toggleMobileOpen } = useSidebarStore();
  const { user, logout: storeLogout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Build breadcrumbs from path
  const rolePrefix = user?.role?.toLowerCase() ?? 'admin';
  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .filter((seg) => seg !== rolePrefix);

  const breadcrumbs = [
    { label: 'Dashboard', href: `/${rolePrefix}` },
    ...pathSegments.map((seg, i) => ({
      label: pathLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: `/${rolePrefix}/` + pathSegments.slice(0, i + 1).join('/'),
    })),
  ];

  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Dashboard';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed with logout even if API fails
    }
    storeLogout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex w-full items-center gap-4 px-4 lg:px-6">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop sidebar collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:flex"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs / Page title */}
        <div className="flex flex-col">
          {/* Page title (mobile) */}
          <h1 className="text-lg font-semibold lg:hidden">{pageTitle}</h1>

          {/* Breadcrumbs (desktop) */}
          <nav className="hidden items-center gap-1.5 text-sm lg:flex" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <span className="text-muted-foreground transition-colors hover:text-foreground cursor-default">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-[18px] w-[18px]" />
            ) : (
              <Sun className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setUserMenuOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {/* Unread count badge */}
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    3 new
                  </Badge>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[
                    {
                      title: 'New marks posted',
                      desc: 'Mathematics Quiz 3 marks are now available.',
                      time: '5 min ago',
                    },
                    {
                      title: 'Financial update',
                      desc: 'A new fee payment has been recorded.',
                      time: '1 hour ago',
                    },
                    {
                      title: 'System update',
                      desc: 'The platform will undergo maintenance tonight.',
                      time: '3 hours ago',
                    },
                  ].map((notif, i) => (
                    <div
                      key={i}
                      className="flex cursor-pointer gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0 hover:bg-accent/50"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bell className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-medium leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notif.desc}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-2.5">
                  <button className="w-full text-center text-xs font-medium text-primary transition-colors hover:text-primary/80">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-border" />

          {/* User avatar + dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotifOpen(false);
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent',
                userMenuOpen && 'bg-accent'
              )}
            >
              <Avatar className="h-8 w-8">
                {user?.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt="User avatar" />
                )}
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {user ? getInitials(user.firstName, user.lastName) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-sm font-medium leading-tight">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate(`/${rolePrefix}/profile`);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
