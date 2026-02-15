import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ArrowLeft,
  Loader2,
  Download,
  GraduationCap,
  Heart,
  Target,
  TrendingUp,
  CalendarCheck,
  DollarSign,
  Newspaper,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { sponsorApi } from '@/api/sponsor.api';
import { reportApi, downloadPdf } from '@/api/report.api';
import { DataTable } from '@/components/common/DataTable';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  formatDate,
  formatCurrency,
  formatRelative,
  getFullName,
  getInitials,
} from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { Mark, FinancialRecord, StudentUpdate, StudentAchievement } from '@/types';

export default function SponsorStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadingFinance, setDownloadingFinance] = useState(false);

  // Fetch student detail
  const { data: detail, isLoading } = useQuery({
    queryKey: ['sponsor', 'student', id],
    queryFn: () => sponsorApi.getStudentDetail(id!),
    enabled: !!id,
    select: (res) => res.data.data,
  });

  // Fetch marks
  const { data: marksRes } = useQuery({
    queryKey: ['sponsor', 'student', id, 'marks'],
    queryFn: () => sponsorApi.getStudentMarks(id!, { page: 1, limit: 100 }),
    enabled: !!id,
    select: (res) => res.data.data,
  });
  const marks: Mark[] = marksRes?.data ?? [];

  // Fetch attendance
  const { data: attendanceRes } = useQuery({
    queryKey: ['sponsor', 'student', id, 'attendance'],
    queryFn: () => sponsorApi.getStudentAttendance(id!),
    enabled: !!id,
    select: (res) => res.data.data,
  });

  // Fetch finance
  const { data: financeRes } = useQuery({
    queryKey: ['sponsor', 'student', id, 'finance'],
    queryFn: () => sponsorApi.getStudentFinance(id!),
    enabled: !!id,
    select: (res) => res.data.data,
  });
  const financeRecords: FinancialRecord[] = financeRes?.records ?? [];

  const student = detail?.student;
  const performance = detail?.performance;
  const attendance = detail?.attendance;
  const finance = detail?.finance ?? financeRes?.summary;
  const updates: StudentUpdate[] = detail?.recentUpdates ?? [];
  const achievements: StudentAchievement[] = detail?.recentAchievements ?? [];

  // Subject bar chart data
  const subjectChartData = useMemo(
    () =>
      performance?.subjectWise?.map((s) => ({
        subject: s.subjectName,
        percentage: Math.round(s.averagePercentage),
        quizzes: s.totalQuizzes,
      })) ?? [],
    [performance],
  );

  // Marks table columns
  const marksColumns = useMemo<ColumnDef<Mark>[]>(
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
          <Badge variant="secondary">{row.original.quiz.subject?.name ?? 'N/A'}</Badge>
        ),
      },
      {
        id: 'marks',
        header: 'Marks',
        cell: ({ row }) => (
          <span>
            <span className="font-semibold">{row.original.marksObtained}</span>
            <span className="text-muted-foreground"> / {row.original.quiz.totalMarks}</span>
          </span>
        ),
      },
      {
        id: 'percentage',
        header: 'Percentage',
        cell: ({ row }) => {
          const pct = row.original.quiz.totalMarks
            ? Math.round((row.original.marksObtained / row.original.quiz.totalMarks) * 100)
            : 0;
          return (
            <Badge variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
              {pct}%
            </Badge>
          );
        },
      },
      {
        accessorKey: 'quiz.date',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.quiz.date),
      },
    ],
    [],
  );

  // Finance table columns
  const financeColumns = useMemo<ColumnDef<FinancialRecord>[]>(
    () => [
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.description || '--'}</span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.date),
      },
    ],
    [],
  );

  async function handleDownloadReport() {
    if (!id) return;
    setDownloadingReport(true);
    try {
      const res = await reportApi.studentReport(id);
      downloadPdf(res.data, `student-report-${id}.pdf`);
    } catch {
      // silently fail
    } finally {
      setDownloadingReport(false);
    }
  }

  async function handleDownloadFinanceReport() {
    if (!id) return;
    setDownloadingFinance(true);
    try {
      const res = await reportApi.financialReport(id);
      downloadPdf(res.data, `finance-report-${id}.pdf`);
    } catch {
      // silently fail
    } finally {
      setDownloadingFinance(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p className="text-lg font-medium">Student not found.</p>
        <Button variant="ghost" onClick={() => navigate('/sponsor/students')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/sponsor/students')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Button>

      {/* Student Info Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{getFullName(student)}</h1>
                <p className="text-muted-foreground">{student.email}</p>
                {student.studentProfile?.grade && (
                  <Badge variant="outline" className="mt-1">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    Grade: {student.studentProfile.grade}
                  </Badge>
                )}
              </div>

              {student.studentProfile?.bio && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">About</h4>
                  <p className="text-sm">{student.studentProfile.bio}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-6">
                {student.studentProfile?.goals && (
                  <div>
                    <h4 className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Target className="h-3.5 w-3.5" />
                      Goals
                    </h4>
                    <p className="text-sm">{student.studentProfile.goals}</p>
                  </div>
                )}
                {student.studentProfile?.thankYouMessage && (
                  <div>
                    <h4 className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Heart className="h-3.5 w-3.5 text-pink-500" />
                      Thank You Message
                    </h4>
                    <p className="text-sm italic">"{student.studentProfile.thankYouMessage}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Download Reports */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="gap-2"
              >
                {downloadingReport ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Academic Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadFinanceReport}
                disabled={downloadingFinance}
                className="gap-2"
              >
                {downloadingFinance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Finance Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="updates" className="gap-1.5">
            <Newspaper className="h-4 w-4" />
            <span className="hidden sm:inline">Updates</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Overall stat */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard
              title="Overall Percentage"
              value={`${Math.round(performance?.overallPercentage ?? 0)}%`}
              icon={TrendingUp}
            />
            <StatsCard
              title="Total Quizzes"
              value={performance?.totalQuizzes ?? 0}
              icon={BookOpen}
            />
            <StatsCard
              title="Subjects"
              value={performance?.subjectWise?.length ?? 0}
              icon={GraduationCap}
            />
          </div>

          {/* Subject-wise Bar Chart */}
          {subjectChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
                <CardDescription>
                  Average percentage per subject across all quizzes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="subject" className="text-xs" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--background))',
                        }}
                        formatter={(value: number, name: string) => [`${value}%`, 'Average']}
                      />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {subjectChartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Marks table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marks Details</CardTitle>
              <CardDescription>All quiz marks for this student.</CardDescription>
            </CardHeader>
            <CardContent>
              {marks.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No marks recorded yet.
                </p>
              ) : (
                <DataTable
                  columns={marksColumns}
                  data={marks}
                  searchable
                  searchPlaceholder="Search by quiz or subject..."
                  pagination
                  pageSize={8}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatsCard
              title="Attendance Rate"
              value={`${Math.round(attendance?.attendancePercentage ?? attendanceRes?.summary?.attendancePercentage ?? 0)}%`}
              icon={CalendarCheck}
            />
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {attendance?.present ?? attendanceRes?.summary?.present ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Present</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {attendance?.absent ?? attendanceRes?.summary?.absent ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {attendance?.late ?? attendanceRes?.summary?.late ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Late</p>
              </CardContent>
            </Card>
          </div>

          {/* Visual Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Summary</CardTitle>
              <CardDescription>
                Overall attendance breakdown across all subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const totalClasses = attendance?.totalClasses ?? attendanceRes?.summary?.totalClasses ?? 0;
                const present = attendance?.present ?? attendanceRes?.summary?.present ?? 0;
                const absent = attendance?.absent ?? attendanceRes?.summary?.absent ?? 0;
                const late = attendance?.late ?? attendanceRes?.summary?.late ?? 0;

                if (totalClasses === 0) {
                  return (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No attendance records yet.
                    </p>
                  );
                }

                const pieData = [
                  { name: 'Present', value: present, color: '#16a34a' },
                  { name: 'Absent', value: absent, color: '#ef4444' },
                  { name: 'Late', value: late, color: '#f59e0b' },
                ].filter((d) => d.value > 0);

                return (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--background))',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatsCard
              title="Total Donated"
              value={formatCurrency(finance?.totalAmount ?? 0)}
              icon={DollarSign}
            />
            <StatsCard
              title="Total Records"
              value={financeRecords.length}
              icon={BookOpen}
            />
          </div>

          {/* Finance table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Donation Records</CardTitle>
              <CardDescription>All donations made for this student.</CardDescription>
            </CardHeader>
            <CardContent>
              {financeRecords.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No donation records yet.
                </p>
              ) : (
                <DataTable
                  columns={financeColumns}
                  data={financeRecords}
                  searchable
                  searchPlaceholder="Search records..."
                  pagination
                  pageSize={8}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Updates</CardTitle>
              <CardDescription>Blog posts and updates from the student.</CardDescription>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Newspaper className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>No updates posted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{update.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatRelative(update.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {update.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>Timeline of student achievements and milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Trophy className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>No achievements recorded yet.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {achievements.map((achievement, index) => (
                      <div key={achievement.id} className="relative flex gap-4 pl-2">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                          <Trophy className="h-4 w-4 text-primary" />
                        </div>

                        <div className="flex-1 rounded-lg border p-4">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <Badge variant="outline" className="shrink-0">
                              {formatDate(achievement.date)}
                            </Badge>
                          </div>
                          {achievement.description && (
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
