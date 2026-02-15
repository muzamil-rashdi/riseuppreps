import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { BookOpen } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import { studentApi } from '@/api/student.api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDate, formatPercentage } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { Mark } from '@/types';

function BarTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as { subjectName: string; averagePercentage: number; totalQuizzes: number };
  return (
    <div className="rounded-lg border bg-background px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground">{item.subjectName}</p>
      <p className="text-lg font-bold text-primary">{item.averagePercentage.toFixed(1)}%</p>
      <p className="text-xs text-muted-foreground">{item.totalQuizzes} quizzes</p>
    </div>
  );
}

export default function StudentMarks() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const { data: marksData, isLoading: loadingMarks } = useQuery({
    queryKey: ['student', 'marks', 'all'],
    queryFn: () => studentApi.getMarks({ page: 1, limit: 500 }).then((r) => r.data.data),
  });

  const { data: performance, isLoading: loadingPerf } = useQuery({
    queryKey: ['student', 'performance'],
    queryFn: () => studentApi.getPerformance().then((r) => r.data.data),
  });

  const isLoading = loadingMarks || loadingPerf;

  // Extract unique subjects from marks
  const subjects = useMemo(() => {
    if (!marksData?.data) return [];
    const map = new Map<string, string>();
    marksData.data.forEach((m) => {
      map.set(m.quiz.subjectId, m.quiz.subject.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [marksData]);

  // Filter marks by selected subject
  const filteredMarks = useMemo(() => {
    if (!marksData?.data) return [];
    if (selectedSubject === 'all') return marksData.data;
    return marksData.data.filter((m) => m.quiz.subjectId === selectedSubject);
  }, [marksData, selectedSubject]);

  // Subject-wise chart data
  const subjectChartData = useMemo(() => {
    if (!performance?.subjectWise) return [];
    return performance.subjectWise.map((s) => ({
      subjectName: s.subjectName,
      averagePercentage: s.averagePercentage,
      totalQuizzes: s.totalQuizzes,
    }));
  }, [performance]);

  const columns = useMemo<ColumnDef<Mark>[]>(
    () => [
      {
        accessorKey: 'quiz.name',
        header: 'Quiz Name',
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
        cell: ({ row }) => (
          <span className="font-semibold">
            {row.original.marksObtained}/{row.original.quiz.totalMarks}
          </span>
        ),
      },
      {
        id: 'percentage',
        header: 'Percentage',
        cell: ({ row }) => {
          const pct = (row.original.marksObtained / row.original.quiz.totalMarks) * 100;
          return (
            <Badge variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
              {formatPercentage(Number(pct.toFixed(1)))}
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

  if (isLoading) {
    return <LoadingPage message="Loading your marks..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Marks"
        description="View all your quiz results and subject performance."
      />

      {/* Subject-wise Performance Bar Chart */}
      {subjectChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="subjectName"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <Bar
                  dataKey="averagePercentage"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {subjectChartData.map((_, index) => (
                    <rect key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subject Filter Tabs + Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="all">All Subjects</TabsTrigger>
              {subjects.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>
                  {s.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedSubject}>
              {filteredMarks.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={filteredMarks}
                  searchable
                  searchPlaceholder="Search quizzes..."
                  pagination
                  pageSize={10}
                />
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No marks found"
                  description={
                    selectedSubject === 'all'
                      ? 'Your quiz marks will appear here once posted by your teachers.'
                      : 'No marks found for this subject.'
                  }
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
