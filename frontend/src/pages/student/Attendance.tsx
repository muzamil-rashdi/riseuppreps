import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CheckCircle2, XCircle, Clock, BarChart3 } from 'lucide-react';
import { studentApi } from '@/api/student.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, formatPercentage } from '@/utils/formatters';
import { ATTENDANCE_STATUSES } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { Attendance } from '@/types';

const STATUS_BADGE_MAP: Record<string, 'success' | 'destructive' | 'warning'> = {
  PRESENT: 'success',
  ABSENT: 'destructive',
  LATE: 'warning',
};

const STATUS_CELL_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-500',
  ABSENT: 'bg-red-500',
  LATE: 'bg-yellow-500',
};

const STATUS_CELL_BG: Record<string, string> = {
  PRESENT: 'bg-green-500/20 hover:bg-green-500/30',
  ABSENT: 'bg-red-500/20 hover:bg-red-500/30',
  LATE: 'bg-yellow-500/20 hover:bg-yellow-500/30',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentAttendance() {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['student', 'attendance', subjectFilter],
    queryFn: () =>
      studentApi
        .getAttendance(subjectFilter !== 'all' ? { subjectId: subjectFilter } : undefined)
        .then((r) => r.data.data),
  });

  const records = (attendanceData?.records ?? []) as Attendance[];
  const summary = attendanceData?.summary;

  // Extract unique subjects
  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => map.set(r.subjectId, r.subject.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  // Build date -> status map for the calendar
  const dateStatusMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    records.forEach((r) => {
      const key = r.date.slice(0, 10);
      // If multiple records per day, prioritize: ABSENT > LATE > PRESENT
      const existing = map.get(key);
      if (!existing) {
        map.set(key, r);
      } else {
        const priority: Record<string, number> = { ABSENT: 3, LATE: 2, PRESENT: 1 };
        if ((priority[r.status] ?? 0) > (priority[existing.status] ?? 0)) {
          map.set(key, r);
        }
      }
    });
    return map;
  }, [records]);

  // Calendar grid generation
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let row: (number | null)[] = [];

    // Fill leading empty cells
    for (let i = 0; i < firstDay; i++) {
      row.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      row.push(day);
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    }

    // Fill trailing empty cells
    if (row.length > 0) {
      while (row.length < 7) {
        row.push(null);
      }
      rows.push(row);
    }

    return rows;
  }, [calMonth, calYear]);

  // Recent records (last 10)
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [records]);

  const columns = useMemo<ColumnDef<Attendance>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="font-medium">{formatDate(row.original.date)}</span>
        ),
      },
      {
        accessorKey: 'subject.name',
        header: 'Subject',
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.subject.name}</Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusInfo = ATTENDANCE_STATUSES.find((s) => s.value === row.original.status);
          return (
            <Badge variant={STATUS_BADGE_MAP[row.original.status] ?? 'default'}>
              {statusInfo?.label ?? row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.remarks || '-'}
          </span>
        ),
      },
    ],
    [],
  );

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading attendance data..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Attendance" description="Track your class attendance and records.">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Classes"
          value={summary?.totalClasses ?? 0}
          icon={CalendarDays}
        />
        <StatsCard
          title="Present"
          value={summary?.present ?? 0}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Absent"
          value={summary?.absent ?? 0}
          icon={XCircle}
        />
        <StatsCard
          title="Late"
          value={summary?.late ?? 0}
          icon={Clock}
        />
        <StatsCard
          title="Attendance %"
          value={formatPercentage(summary?.attendancePercentage ?? 0)}
          icon={BarChart3}
        />
      </div>

      {/* Calendar Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Monthly Attendance</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              &larr;
            </button>
            <span className="min-w-[140px] text-center text-sm font-medium">
              {MONTHS[calMonth]} {calYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              &rarr;
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {WEEKDAYS.map((day) => (
                    <th key={day} className="pb-2 text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarGrid.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day, di) => {
                      if (day === null) {
                        return <td key={di} className="p-1" />;
                      }

                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const record = dateStatusMap.get(dateStr);
                      const isToday =
                        new Date().toISOString().slice(0, 10) === dateStr;

                      return (
                        <td key={di} className="p-1">
                          <div
                            className={cn(
                              'relative flex h-10 w-full items-center justify-center rounded-md text-sm transition-colors',
                              record
                                ? STATUS_CELL_BG[record.status]
                                : 'bg-muted/30 hover:bg-muted/50',
                              isToday && 'ring-2 ring-primary ring-offset-1',
                            )}
                            title={
                              record
                                ? `${ATTENDANCE_STATUSES.find((s) => s.value === record.status)?.label} - ${record.subject.name}`
                                : undefined
                            }
                          >
                            <span
                              className={cn(
                                'text-xs font-medium',
                                record ? 'text-foreground' : 'text-muted-foreground',
                              )}
                            >
                              {day}
                            </span>
                            {record && (
                              <div
                                className={cn(
                                  'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                                  STATUS_CELL_COLORS[record.status],
                                )}
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 border-t pt-4">
            {ATTENDANCE_STATUSES.map((s) => (
              <div key={s.value} className="flex items-center gap-2">
                <div className={cn('h-3 w-3 rounded-full', STATUS_CELL_COLORS[s.value])} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">No record</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance Records Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRecords.length > 0 ? (
            <DataTable columns={columns} data={recentRecords} />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No attendance records"
              description="Your attendance records will appear here once marked by your teachers."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
