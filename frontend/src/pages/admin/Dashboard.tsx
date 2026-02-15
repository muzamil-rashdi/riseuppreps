import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, GraduationCap, Heart, DollarSign, BookOpen, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency, getFullName } from '@/utils/formatters';
import type { Mark, FinancialRecord } from '@/types';

interface DashboardData {
  stats: {
    totalStudents: number;
    totalSponsors: number;
    totalTeachers: number;
    activeAssignments: number;
    totalQuizzes: number;
    totalFinancialAmount: number;
  };
  recentMarks: Mark[];
  recentFinancial: FinancialRecord[];
}

const markColumns: ColumnDef<Mark, unknown>[] = [
  {
    accessorKey: 'student',
    header: 'Student',
    cell: ({ row }) => {
      const student = row.original.student;
      return student ? getFullName(student) : 'N/A';
    },
  },
  {
    accessorKey: 'quiz.subject.name',
    header: 'Subject',
    cell: ({ row }) => row.original.quiz?.subject?.name ?? 'N/A',
  },
  {
    accessorKey: 'quiz.name',
    header: 'Quiz',
    cell: ({ row }) => row.original.quiz?.name ?? 'N/A',
  },
  {
    accessorKey: 'marksObtained',
    header: 'Score',
    cell: ({ row }) => {
      const obtained = row.original.marksObtained;
      const total = row.original.quiz?.totalMarks;
      const pct = total ? Math.round((obtained / total) * 100) : 0;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {obtained}/{total}
          </span>
          <Badge variant={pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
            {pct}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

const financeColumns: ColumnDef<FinancialRecord, unknown>[] = [
  {
    accessorKey: 'sponsor',
    header: 'Sponsor',
    cell: ({ row }) => getFullName(row.original.sponsor),
  },
  {
    accessorKey: 'student',
    header: 'Student',
    cell: ({ row }) => getFullName(row.original.student),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.amount)}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.date),
  },
];

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await adminApi.getDashboard();
      return res.data.data as DashboardData;
    },
  });

  if (isLoading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const recentMarks = (data?.recentMarks ?? []).slice(0, 5);
  const recentFinancial = (data?.recentFinancial ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of RiseUp Preps Academy operations"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={GraduationCap}
        />
        <StatsCard
          title="Sponsors"
          value={stats?.totalSponsors ?? 0}
          icon={Heart}
        />
        <StatsCard
          title="Teachers"
          value={stats?.totalTeachers ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Active Assignments"
          value={stats?.activeAssignments ?? 0}
          icon={BookOpen}
        />
        <StatsCard
          title="Total Donations"
          value={formatCurrency(stats?.totalFinancialAmount ?? 0)}
          icon={DollarSign}
        />
      </div>

      {/* Recent Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Marks */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-lg">Recent Marks</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMarks.length > 0 ? (
              <DataTable columns={markColumns} data={recentMarks} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent marks recorded.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Financial Records */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-lg">Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFinancial.length > 0 ? (
              <DataTable columns={financeColumns} data={recentFinancial} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent donations.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
