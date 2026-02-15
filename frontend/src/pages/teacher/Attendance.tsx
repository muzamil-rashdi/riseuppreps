import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  CalendarCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { teacherApi } from '@/api/teacher.api';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, getFullName } from '@/utils/formatters';
import { ATTENDANCE_STATUSES } from '@/utils/constants';
import type { Attendance, AttendanceStatus, User, Subject } from '@/types';

interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  grade?: string;
  status: AttendanceStatus;
}

export default function TeacherAttendance() {
  const queryClient = useQueryClient();

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [attendanceEntries, setAttendanceEntries] = useState<StudentAttendanceEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['teacher', 'subjects'],
    queryFn: () => teacherApi.listSubjects(),
    select: (res) => res.data.data,
  });
  const subjects: Subject[] = subjectsData ?? [];

  // Fetch students (filtered by selected subject)
  const { data: studentsData } = useQuery({
    queryKey: ['teacher', 'students', selectedSubjectId],
    queryFn: () => teacherApi.listStudents({ subjectId: selectedSubjectId || undefined }),
    select: (res) => res.data.data,
  });
  const students: (User & { studentProfile?: { grade: string } })[] = studentsData ?? [];

  // Fetch recent attendance records
  const { data: attendanceRes, isLoading: attendanceLoading } = useQuery({
    queryKey: ['teacher', 'attendance', selectedSubjectId],
    queryFn: () =>
      teacherApi.getAttendance({
        page: 1,
        limit: 50,
        subjectId: selectedSubjectId || undefined,
      }),
    select: (res) => res.data.data,
  });
  const recentAttendance: Attendance[] = attendanceRes?.data ?? [];

  // When subject changes, update selection (entries will reinitialize via useMemo below)
  function handleSubjectChange(subjectId: string) {
    setSelectedSubjectId(subjectId);
    setSuccessMsg('');
    setErrorMsg('');
  }

  function initializeEntries() {
    setAttendanceEntries(
      students.map((s) => ({
        studentId: s.id,
        studentName: getFullName(s),
        grade: s.studentProfile?.grade,
        status: 'PRESENT' as AttendanceStatus,
      })),
    );
  }

  // Reinitialize entries whenever the student list changes (e.g. subject filter changed)
  useMemo(() => {
    if (students.length > 0) {
      initializeEntries();
    } else {
      setAttendanceEntries([]);
    }
  }, [students, selectedSubjectId]);

  function updateStudentStatus(studentId: string, status: AttendanceStatus) {
    setAttendanceEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e)),
    );
  }

  async function handleSubmitAttendance() {
    if (!selectedSubjectId || !selectedDate) {
      setErrorMsg('Please select a subject and date.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      for (const entry of attendanceEntries) {
        await teacherApi.markAttendance({
          studentId: entry.studentId,
          subjectId: selectedSubjectId,
          date: selectedDate,
          status: entry.status,
        });
      }
      setSuccessMsg(`Attendance marked successfully for ${attendanceEntries.length} students.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance'] });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error ?? 'Failed to mark attendance. Some entries may have been saved.');
    } finally {
      setSubmitting(false);
    }
  }

  // Table columns for recent attendance
  const recentColumns = useMemo<ColumnDef<Attendance>[]>(
    () => [
      {
        accessorKey: 'student',
        header: 'Student',
        cell: ({ row }) =>
          row.original.student ? getFullName(row.original.student) : 'Unknown',
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = ATTENDANCE_STATUSES.find((a) => a.value === row.original.status);
          return (
            <Badge
              variant={
                row.original.status === 'PRESENT'
                  ? 'success'
                  : row.original.status === 'ABSENT'
                    ? 'destructive'
                    : 'warning'
              }
            >
              {s?.label ?? row.original.status}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const presentCount = attendanceEntries.filter((e) => e.status === 'PRESENT').length;
  const absentCount = attendanceEntries.filter((e) => e.status === 'ABSENT').length;
  const lateCount = attendanceEntries.filter((e) => e.status === 'LATE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Mark daily attendance for your students and view records.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mark Attendance</CardTitle>
          <CardDescription>
            Select a subject and date, then mark each student's attendance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject & Date selectors */}
          <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {errorMsg}
            </div>
          )}

          {/* Student list with radio buttons */}
          {attendanceEntries.length > 0 ? (
            <>
              {/* Summary bar */}
              <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <span className="font-medium">{attendanceEntries.length} Students</span>
                <span className="text-green-600">{presentCount} Present</span>
                <span className="text-red-600">{absentCount} Absent</span>
                <span className="text-yellow-600">{lateCount} Late</span>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="h-12 px-4 text-left font-medium text-muted-foreground">Student</th>
                      <th className="h-12 px-4 text-left font-medium text-muted-foreground">Grade</th>
                      <th className="h-12 px-4 text-center font-medium text-muted-foreground">Present</th>
                      <th className="h-12 px-4 text-center font-medium text-muted-foreground">Absent</th>
                      <th className="h-12 px-4 text-center font-medium text-muted-foreground">Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceEntries.map((entry) => (
                      <tr key={entry.studentId} className="border-b transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{entry.studentName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.grade || '--'}</td>
                        {ATTENDANCE_STATUSES.map((as) => (
                          <td key={as.value} className="px-4 py-3 text-center">
                            <input
                              type="radio"
                              name={`attendance-${entry.studentId}`}
                              checked={entry.status === as.value}
                              onChange={() => updateStudentStatus(entry.studentId, as.value as AttendanceStatus)}
                              className="h-4 w-4 cursor-pointer accent-primary"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleSubmitAttendance}
                disabled={submitting || !selectedSubjectId || !selectedDate}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Attendance
              </Button>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <CalendarCheck className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No students found. Students will appear here once assigned.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance Records</CardTitle>
          <CardDescription>
            Latest attendance entries{selectedSubjectId ? ' for the selected subject' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentAttendance.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No attendance records found.</p>
            </div>
          ) : (
            <DataTable
              columns={recentColumns}
              data={recentAttendance}
              searchable
              searchPlaceholder="Search attendance..."
              pagination
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
