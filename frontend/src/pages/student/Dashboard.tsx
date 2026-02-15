import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { GraduationCap, ClipboardCheck, TrendingUp, BookOpen } from 'lucide-react';
import { studentApi } from '@/api/student.api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { formatDate, formatPercentage } from '@/utils/formatters';
import type { Mark } from '@/types';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: performance, isLoading: loadingPerf } = useQuery({
    queryKey: ['student', 'performance'],
    queryFn: () => studentApi.getPerformance().then((r) => r.data.data),
  });

  const { data: marksData, isLoading: loadingMarks } = useQuery({
    queryKey: ['student', 'marks'],
    queryFn: () =>
      studentApi.getMarks({ page: 1, limit: 100 }).then((r) => r.data.data),
  });

  const { data: attendance, isLoading: loadingAtt } = useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: () => studentApi.getAttendance().then((r) => r.data.data),
  });

  const isLoading = loadingPerf || loadingMarks || loadingAtt;

  // Build performance trend data from marks
  const performanceTrend = useMemo(() => {
    if (!marksData?.data) return [];
    return marksData.data.map((m) => ({
      date: m.quiz.date,
      percentage: (m.marksObtained / m.quiz.totalMarks) * 100,
      quizName: m.quiz.name,
    }));
  }, [marksData]);

  // Last 5 marks for the recent marks table
  const recentMarks = useMemo(() => {
    if (!marksData?.data) return [];
    return [...marksData.data]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [marksData]);

  const columns = useMemo<ColumnDef<Mark>[]>(
    () => [
      {
        accessorKey: 'quiz.name',
        header: 'Quiz',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.quiz.name}</span>
        ),
      },
      {
        accessorKey: 'quiz.subject.name',
        header: 'Subject',
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.quiz.subject.name}</Badge>
        ),
      },
      {
        accessorKey: 'quiz.date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.quiz.date)}</span>
        ),
      },
      {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => {
          const pct = (row.original.marksObtained / row.original.quiz.totalMarks) * 100;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {row.original.marksObtained}/{row.original.quiz.totalMarks}
              </span>
              <Badge variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
                {pct.toFixed(0)}%
              </Badge>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  const summary = attendance?.summary;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <PageHeader
          title={`Welcome back, ${user?.firstName ?? 'Student'}!`}
          description="Here's a summary of your academic progress and attendance."
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Overall Percentage"
          value={formatPercentage(performance?.overallPercentage ?? 0)}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Quizzes"
          value={performance?.totalQuizzes ?? 0}
          icon={BookOpen}
        />
        <StatsCard
          title="Attendance Rate"
          value={formatPercentage(summary?.attendancePercentage ?? 0)}
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Subjects"
          value={performance?.subjectWise?.length ?? 0}
          icon={GraduationCap}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <PerformanceChart
          data={performanceTrend}
          title="Performance Trend"
          className="lg:col-span-2"
        />
        <AttendanceChart
          present={summary?.present ?? 0}
          absent={summary?.absent ?? 0}
          late={summary?.late ?? 0}
        />
      </div>

      {/* Subject Performance Summary */}
      {performance?.subjectWise && performance.subjectWise.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.subjectWise.map((sub) => {
                const pct = sub.averagePercentage;
                return (
                  <div key={sub.subjectId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{sub.subjectName}</span>
                      <span className="text-muted-foreground">
                        {pct.toFixed(1)}% ({sub.totalQuizzes} quizzes)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Marks Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMarks.length > 0 ? (
            <DataTable columns={columns} data={recentMarks} />
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No marks yet"
              description="Your quiz marks will appear here once posted by your teachers."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
