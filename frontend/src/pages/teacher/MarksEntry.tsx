import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  PenLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { teacherApi } from '@/api/teacher.api';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import type { Quiz, Mark, User } from '@/types';

export default function TeacherMarksEntry() {
  const queryClient = useQueryClient();

  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [remarks, setRemarks] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch quizzes list
  const { data: quizzesRes } = useQuery({
    queryKey: ['teacher', 'quizzes'],
    queryFn: () => teacherApi.listQuizzes({ page: 1, limit: 200 }),
    select: (res) => res.data.data,
  });
  const quizzes: Quiz[] = quizzesRes?.data ?? [];

  // Fetch quiz detail when selected
  const { data: quizDetail, isLoading: quizDetailLoading } = useQuery({
    queryKey: ['teacher', 'quiz', selectedQuizId],
    queryFn: () => teacherApi.getQuiz(selectedQuizId),
    enabled: !!selectedQuizId,
    select: (res) => res.data.data,
  });

  // Fetch students list (filtered by selected quiz's subject)
  const { data: studentsData } = useQuery({
    queryKey: ['teacher', 'students', quizDetail?.subjectId],
    queryFn: () => teacherApi.listStudents({ subjectId: quizDetail?.subjectId }),
    enabled: !!selectedQuizId && !!quizDetail?.subjectId,
    select: (res) => res.data.data,
  });
  const students: (User & { studentProfile?: { grade: string } })[] = studentsData ?? [];

  // Already entered student IDs
  const enteredStudentIds = useMemo(
    () => new Set(quizDetail?.marks?.map((m: Mark) => m.studentId) ?? []),
    [quizDetail],
  );

  // Available students (not yet entered)
  const availableStudents = useMemo(
    () => students.filter((s) => !enteredStudentIds.has(s.id)),
    [students, enteredStudentIds],
  );

  // Create mark mutation
  const createMarkMutation = useMutation({
    mutationFn: teacherApi.createMark,
    onSuccess: () => {
      setSuccessMessage('Mark entered successfully.');
      setErrorMessage('');
      setMarksObtained('');
      setRemarks('');
      setSelectedStudentId('');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quiz', selectedQuizId] });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.error ?? 'Failed to enter mark.');
      setSuccessMessage('');
    },
  });

  function handleSubmitMark() {
    if (!selectedQuizId || !selectedStudentId || !marksObtained) return;
    const obtained = Number(marksObtained);
    if (quizDetail && obtained > quizDetail.totalMarks) {
      setErrorMessage(`Marks cannot exceed total marks (${quizDetail.totalMarks}).`);
      return;
    }
    if (obtained < 0) {
      setErrorMessage('Marks cannot be negative.');
      return;
    }
    createMarkMutation.mutate({
      quizId: selectedQuizId,
      studentId: selectedStudentId,
      marksObtained: obtained,
      remarks: remarks || undefined,
    });
  }

  // Table columns for entered marks
  const enteredMarksColumns = useMemo<ColumnDef<Mark>[]>(
    () => [
      {
        accessorKey: 'student',
        header: 'Student',
        cell: ({ row }) =>
          row.original.student
            ? getFullName(row.original.student)
            : 'Unknown',
      },
      {
        accessorKey: 'marksObtained',
        header: 'Marks',
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.marksObtained}
            <span className="text-muted-foreground"> / {quizDetail?.totalMarks}</span>
          </span>
        ),
      },
      {
        id: 'percentage',
        header: 'Percentage',
        cell: ({ row }) => {
          const pct = quizDetail?.totalMarks
            ? Math.round((row.original.marksObtained / quizDetail.totalMarks) * 100)
            : 0;
          return (
            <Badge variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
              {pct}%
            </Badge>
          );
        },
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.remarks || '--'}
          </span>
        ),
      },
    ],
    [quizDetail],
  );

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marks Entry</h1>
        <p className="text-muted-foreground">
          Select a quiz and enter marks for your students step by step.
        </p>
      </div>

      {/* Step 1: Select Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Badge className="h-6 w-6 items-center justify-center rounded-full p-0">1</Badge>
            Select Quiz
          </CardTitle>
          <CardDescription>Choose which quiz to enter marks for.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={selectedQuizId} onValueChange={(v) => { setSelectedQuizId(v); setSelectedStudentId(''); setMarksObtained(''); setRemarks(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a quiz..." />
              </SelectTrigger>
              <SelectContent>
                {quizzes.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.name} - {q.subject.name} ({formatDate(q.date)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Quiz Details & Student Selection */}
      {selectedQuizId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Badge className="h-6 w-6 items-center justify-center rounded-full p-0">2</Badge>
              Quiz Details & Student
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizDetailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : quizDetail ? (
              <>
                {/* Quiz Info */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="grid gap-2 sm:grid-cols-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Quiz</p>
                      <p className="font-medium">{quizDetail.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Subject</p>
                      <p>{quizDetail.subject.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Date</p>
                      <p>{formatDate(quizDetail.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Marks</p>
                      <p className="font-semibold">{quizDetail.totalMarks}</p>
                    </div>
                  </div>
                  {quizDetail.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{quizDetail.description}</p>
                  )}
                </div>

                {/* Student selector */}
                <div className="max-w-md">
                  <Label htmlFor="student-select" className="mb-2 block">
                    Select Student
                  </Label>
                  {availableStudents.length === 0 ? (
                    <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                      All students already have marks entered for this quiz.
                    </p>
                  ) : (
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student-select">
                        <SelectValue placeholder="Choose a student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {getFullName(s)}
                            {s.studentProfile?.grade && (
                              <span className="ml-1 text-muted-foreground">
                                ({s.studentProfile.grade})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Enter Marks */}
      {selectedStudentId && quizDetail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Badge className="h-6 w-6 items-center justify-center rounded-full p-0">3</Badge>
              Enter Marks
            </CardTitle>
            <CardDescription>
              Enter marks for{' '}
              <span className="font-medium text-foreground">
                {getFullName(students.find((s) => s.id === selectedStudentId)!)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marks-obtained">
                  Marks Obtained * <span className="text-muted-foreground">(out of {quizDetail.totalMarks})</span>
                </Label>
                <Input
                  id="marks-obtained"
                  type="number"
                  min={0}
                  max={quizDetail.totalMarks}
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(e.target.value)}
                  placeholder={`0 - ${quizDetail.totalMarks}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mark-remarks">Remarks</Label>
                <Textarea
                  id="mark-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional remarks..."
                  rows={1}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmitMark}
              disabled={createMarkMutation.isPending || !marksObtained}
              className="gap-2"
            >
              {createMarkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Submit Mark
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Entered Marks Table */}
      {selectedQuizId && quizDetail && quizDetail.marks && quizDetail.marks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Entered Marks ({quizDetail.marks.length})
            </CardTitle>
            <CardDescription>
              All marks entered for {quizDetail.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={enteredMarksColumns}
              data={quizDetail.marks}
              searchable
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
