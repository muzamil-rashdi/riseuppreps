import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  ClipboardList,
  Users,
  BookOpen,
  Plus,
  PenLine,
  CalendarCheck,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { teacherApi } from '@/api/teacher.api';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelative, getFullName } from '@/utils/formatters';
import type { Quiz } from '@/types';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
    queryKey: ['teacher', 'quizzes'],
    queryFn: () => teacherApi.listQuizzes({ page: 1, limit: 50 }),
    select: (res) => res.data.data,
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: () => teacherApi.listStudents(),
    select: (res) => res.data.data,
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['teacher', 'subjects'],
    queryFn: () => teacherApi.listSubjects(),
    select: (res) => res.data.data,
  });

  const isLoading = quizzesLoading || studentsLoading || subjectsLoading;

  const allQuizzes = quizzesData?.data ?? [];
  const recentQuizzes = allQuizzes.slice(0, 5);
  const totalStudents = studentsData?.length ?? 0;
  const totalSubjects = subjectsData?.length ?? 0;

  const recentColumns = useMemo<ColumnDef<Quiz>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Quiz Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
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
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: 'totalMarks',
        header: 'Total Marks',
      },
      {
        id: 'marksEntered',
        header: 'Marks Entered',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original._count?.marks ?? 0}</Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName ?? 'Teacher'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here is an overview of your teaching activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Quizzes"
          value={isLoading ? '...' : allQuizzes.length}
          icon={ClipboardList}
        />
        <StatsCard
          title="Students"
          value={isLoading ? '...' : totalStudents}
          icon={Users}
        />
        <StatsCard
          title="Subjects"
          value={isLoading ? '...' : totalSubjects}
          icon={BookOpen}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/teacher/quizzes')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/teacher/marks')}
              className="gap-2"
            >
              <PenLine className="h-4 w-4" />
              Enter Marks
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/attendance')}
              className="gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Quizzes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Quizzes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/quizzes')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentQuizzes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No quizzes created yet.</p>
              <p className="text-sm">Create your first quiz to get started.</p>
            </div>
          ) : (
            <DataTable columns={recentColumns} data={recentQuizzes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
