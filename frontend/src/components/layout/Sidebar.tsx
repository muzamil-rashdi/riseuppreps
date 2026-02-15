import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';
import {
  LayoutDashboard,
  Users,
  Mail,
  UserPlus,
  Link2,
  BookOpen,
  DollarSign,
  Megaphone,
  MessageSquare,
  BarChart3,
  ClipboardList,
  PenLine,
  CalendarCheck,
  GraduationCap,
  FileText,
  Trophy,
  Newspaper,
  User,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navigationByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Invitations', href: '/admin/invitations', icon: UserPlus },
    { label: 'Assignments', href: '/admin/assignments', icon: Link2 },
    { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { label: 'Finance', href: '/admin/finance', icon: DollarSign },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ],
  TEACHER: [
    { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'Quizzes', href: '/teacher/quizzes', icon: ClipboardList },
    { label: 'Enter Marks', href: '/teacher/marks', icon: PenLine },
    { label: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Students', href: '/teacher/students', icon: GraduationCap },
  ],
  SPONSOR: [
    { label: 'Dashboard', href: '/sponsor', icon: LayoutDashboard },
    { label: 'My Students', href: '/sponsor/students', icon: GraduationCap },
    { label: 'Messages', href: '/sponsor/messages', icon: MessageSquare },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'My Marks', href: '/student/marks', icon: ClipboardList },
    { label: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
    { label: 'Profile', href: '/student/profile', icon: User },
    { label: 'Documents', href: '/student/documents', icon: FileText },
    { label: 'Achievements', href: '/student/achievements', icon: Trophy },
    { label: 'My Updates', href: '/student/updates', icon: Newspaper },
  ],
};

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, setMobileOpen } =
    useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const role = user?.role ?? 'STUDENT';
  const navItems = navigationByRole[role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
          // Desktop sizing
          'lg:relative lg:z-auto',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile: slide from left
          'w-72 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border px-4',
            isCollapsed ? 'lg:justify-center lg:px-2' : 'gap-3'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div
            className={cn(
              'flex flex-col overflow-hidden transition-all duration-300',
              isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
            )}
          >
            <span className="whitespace-nowrap text-sm font-bold tracking-tight">
              RiseUp Preps
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Academy
            </span>
          </div>

          {/* Collapse toggle - desktop only */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              'ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex',
              isCollapsed && 'lg:ml-0 lg:rotate-180'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Close button - mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const rolePrefix = `/${role.toLowerCase()}`;
              const isActive =
                item.href === rolePrefix
                  ? location.pathname === rolePrefix
                  : location.pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isCollapsed && 'lg:justify-center lg:px-2',
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'whitespace-nowrap transition-all duration-300',
                        isCollapsed
                          ? 'lg:hidden lg:w-0 lg:opacity-0'
                          : 'w-auto opacity-100'
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute right-0 h-6 w-[3px] rounded-l-full bg-primary" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / User role badge */}
        <div
          className={cn(
            'shrink-0 border-t border-border p-4',
            isCollapsed && 'lg:p-2'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2',
              isCollapsed && 'lg:justify-center lg:px-1'
            )}
          >
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div
              className={cn(
                'flex flex-col overflow-hidden transition-all duration-300',
                isCollapsed ? 'lg:hidden lg:w-0' : 'w-auto'
              )}
            >
              <span className="truncate text-xs font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
