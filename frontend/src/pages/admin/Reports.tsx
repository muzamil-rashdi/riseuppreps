import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  FileText,
  Download,
  GraduationCap,
  DollarSign,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { reportApi, downloadPdf } from '@/api/report.api';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getFullName } from '@/utils/formatters';
import type { User } from '@/types';

export default function ReportsPage() {
  const { toast } = useToast();

  const [studentReportId, setStudentReportId] = useState('');
  const [financeReportId, setFinanceReportId] = useState('');

  // Fetch students for selector dropdowns
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['admin', 'users', 'students-reports'],
    queryFn: async () => {
      const res = await adminApi.listUsers({ role: 'STUDENT', limit: 200 });
      return res.data.data;
    },
  });

  const students: User[] = studentsData?.data ?? [];

  // Student Report Card download
  const studentReportMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await reportApi.studentReport(studentId);
      return res.data as Blob;
    },
    onSuccess: (blob) => {
      const student = students.find((s) => s.id === studentReportId);
      const filename = student
        ? `report-card-${student.firstName}-${student.lastName}.pdf`
        : 'student-report-card.pdf';
      downloadPdf(blob, filename);
      toast({ title: 'Report downloaded successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to download report',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  // Financial Report download
  const financeReportMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await reportApi.financialReport(studentId);
      return res.data as Blob;
    },
    onSuccess: (blob) => {
      const student = students.find((s) => s.id === financeReportId);
      const filename = student
        ? `financial-report-${student.firstName}-${student.lastName}.pdf`
        : 'financial-report.pdf';
      downloadPdf(blob, filename);
      toast({ title: 'Report downloaded successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to download report',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  // Admin Summary download
  const adminSummaryMutation = useMutation({
    mutationFn: async () => {
      const res = await reportApi.adminSummary();
      return res.data as Blob;
    },
    onSuccess: (blob) => {
      downloadPdf(blob, 'admin-summary-report.pdf');
      toast({ title: 'Report downloaded successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to download report',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  if (studentsLoading) {
    return <LoadingPage message="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download PDF reports"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Student Report Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Student Report Card</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Academic performance summary
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a comprehensive report card for a student, including quiz scores,
              subject-wise performance, and attendance records.
            </p>
            <div className="space-y-2">
              <Label htmlFor="student-report-select" className="text-xs">
                Select Student
              </Label>
              <Select value={studentReportId} onValueChange={setStudentReportId}>
                <SelectTrigger id="student-report-select">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {getFullName(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={!studentReportId || studentReportMutation.isPending}
              onClick={() => studentReportMutation.mutate(studentReportId)}
            >
              {studentReportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Financial Report */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2.5">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Financial Report</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Student financial breakdown
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a detailed financial report for a student, including all recorded
              expenses organized by category with totals and summaries.
            </p>
            <div className="space-y-2">
              <Label htmlFor="finance-report-select" className="text-xs">
                Select Student
              </Label>
              <Select value={financeReportId} onValueChange={setFinanceReportId}>
                <SelectTrigger id="finance-report-select">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {getFullName(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={!financeReportId || financeReportMutation.isPending}
              onClick={() => financeReportMutation.mutate(financeReportId)}
            >
              {financeReportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Admin Summary Report */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2.5">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Admin Summary</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Platform-wide overview
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a full administrative summary report including student enrollment,
              financial totals, assignment statistics, and overall platform performance.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={adminSummaryMutation.isPending}
              onClick={() => adminSummaryMutation.mutate()}
            >
              {adminSummaryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
