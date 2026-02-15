import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Loader2,
  GraduationCap,
  ClipboardList,
  CalendarCheck,
  Search,
} from 'lucide-react';
import { teacherApi } from '@/api/teacher.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/common/DataTable';
import { formatDate, getFullName, getInitials } from '@/utils/formatters';
import { ATTENDANCE_STATUSES } from '@/utils/constants';
import type { User, Mark, Attendance } from '@/types';

type TeacherStudent = User & { studentProfile?: { grade: string } };

export default function TeacherStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);

  // Fetch students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: () => teacherApi.listStudents(),
    select: (res) => res.data.data,
  });
  const students: TeacherStudent[] = studentsData ?? [];

  // Fetch all quizzes to find marks for the selected student
  const { data: quizzesRes } = useQuery({
    queryKey: ['teacher', 'quizzes'],
    queryFn: () => teacherApi.listQuizzes({ page: 1, limit: 200 }),
    select: (res) => res.data.data,
    enabled: !!selectedStudent,
  });

  // Fetch attendance for the selected student
  const { data: attendanceRes, isLoading: attendanceLoading } = useQuery({
    queryKey: ['teacher', 'attendance', 'all'],
    queryFn: () => teacherApi.getAttendance({ page: 1, limit: 500 }),
    select: (res) => res.data.data,
    enabled: !!selectedStudent,
  });

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentProfile?.grade?.toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

  // Compute marks for selected student from quiz details
  const studentMarks = useMemo(() => {
    if (!selectedStudent) return [];
    // We'll need to fetch each quiz detail. For now, use quizzes list.
    // Note: Marks are nested inside quiz detail. We can only show quiz info from the list.
    return [];
  }, [selectedStudent]);

  // Filter attendance for selected student
  const studentAttendance = useMemo(() => {
    if (!selectedStudent || !attendanceRes?.data) return [];
    return attendanceRes.data.filter(
      (a: Attendance) => a.studentId === selectedStudent.id || a.student?.id === selectedStudent.id,
    );
  }, [selectedStudent, attendanceRes]);

  // Attendance summary
  const attendanceSummary = useMemo(() => {
    const total = studentAttendance.length;
    const present = studentAttendance.filter((a: Attendance) => a.status === 'PRESENT').length;
    const absent = studentAttendance.filter((a: Attendance) => a.status === 'ABSENT').length;
    const late = studentAttendance.filter((a: Attendance) => a.status === 'LATE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, percentage };
  }, [studentAttendance]);

  // Attendance table columns
  const attendanceColumns = useMemo<ColumnDef<Attendance>[]>(
    () => [
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">
          View all your students and their academic summaries.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Student Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="font-medium">
            {searchQuery ? 'No students match your search.' : 'No students found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
              onClick={() => setSelectedStudent(student)}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <Avatar className="h-12 w-12">
                  {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(student.firstName, student.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{getFullName(student)}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  {student.studentProfile?.grade && (
                    <Badge variant="outline" className="mt-1">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {student.studentProfile.grade}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Detail Dialog */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    {selectedStudent.avatarUrl && (
                      <AvatarImage src={selectedStudent.avatarUrl} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{getFullName(selectedStudent)}</DialogTitle>
                    <DialogDescription>{selectedStudent.email}</DialogDescription>
                    {selectedStudent.studentProfile?.grade && (
                      <Badge variant="outline" className="mt-1">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Grade: {selectedStudent.studentProfile.grade}
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Attendance Summary */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold">
                    <CalendarCheck className="h-4 w-4" />
                    Attendance Summary
                  </h4>
                  {studentAttendance.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attendance records found.</p>
                  ) : (
                    <>
                      <div className="mb-4 grid grid-cols-4 gap-3">
                        <div className="rounded-lg border p-3 text-center">
                          <p className="text-2xl font-bold">{attendanceSummary.percentage}%</p>
                          <p className="text-xs text-muted-foreground">Overall</p>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <p className="text-2xl font-bold text-green-600">{attendanceSummary.present}</p>
                          <p className="text-xs text-muted-foreground">Present</p>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <p className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</p>
                          <p className="text-xs text-muted-foreground">Absent</p>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{attendanceSummary.late}</p>
                          <p className="text-xs text-muted-foreground">Late</p>
                        </div>
                      </div>

                      <DataTable
                        columns={attendanceColumns}
                        data={studentAttendance.slice(0, 10)}
                      />
                      {studentAttendance.length > 10 && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Showing latest 10 of {studentAttendance.length} records.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
