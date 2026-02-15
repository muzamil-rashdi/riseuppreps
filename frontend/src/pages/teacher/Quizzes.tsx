import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Pencil,
  Eye,
  Loader2,
  ClipboardList,
  X,
} from 'lucide-react';
import { teacherApi } from '@/api/teacher.api';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, getFullName } from '@/utils/formatters';
import type { Quiz, Mark, Subject } from '@/types';

export default function TeacherQuizzes() {
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
  const [viewQuizId, setViewQuizId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTotalMarks, setFormTotalMarks] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Queries
  const { data: subjectsRes } = useQuery({
    queryKey: ['teacher', 'subjects'],
    queryFn: () => teacherApi.listSubjects(),
    select: (res) => res.data.data,
  });
  const subjects: Subject[] = subjectsRes ?? [];

  const { data: quizzesRes, isLoading } = useQuery({
    queryKey: ['teacher', 'quizzes'],
    queryFn: () => teacherApi.listQuizzes({ page: 1, limit: 200 }),
    select: (res) => res.data.data,
  });
  const quizzes: Quiz[] = quizzesRes?.data ?? [];

  const { data: quizDetailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['teacher', 'quiz', viewQuizId],
    queryFn: () => teacherApi.getQuiz(viewQuizId!),
    enabled: !!viewQuizId,
    select: (res) => res.data.data,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: teacherApi.createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
      resetForm();
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof teacherApi.updateQuiz>[1] }) =>
      teacherApi.updateQuiz(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
      resetForm();
      setEditQuiz(null);
    },
  });

  function resetForm() {
    setFormName('');
    setFormSubjectId('');
    setFormDate('');
    setFormTotalMarks('');
    setFormDescription('');
  }

  function openEditDialog(quiz: Quiz) {
    setFormName(quiz.name);
    setFormSubjectId(quiz.subjectId);
    setFormDate(quiz.date.split('T')[0]);
    setFormTotalMarks(String(quiz.totalMarks));
    setFormDescription(quiz.description ?? '');
    setEditQuiz(quiz);
  }

  function handleCreate() {
    if (!formName || !formSubjectId || !formDate || !formTotalMarks) return;
    createMutation.mutate({
      name: formName,
      subjectId: formSubjectId,
      date: formDate,
      totalMarks: Number(formTotalMarks),
      description: formDescription || undefined,
    });
  }

  function handleUpdate() {
    if (!editQuiz || !formName || !formDate || !formTotalMarks) return;
    updateMutation.mutate({
      id: editQuiz.id,
      data: {
        name: formName,
        date: formDate,
        totalMarks: Number(formTotalMarks),
        description: formDescription || undefined,
      },
    });
  }

  // Table columns
  const columns = useMemo<ColumnDef<Quiz>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <button
            className="font-medium text-primary hover:underline"
            onClick={() => setViewQuizId(row.original.id)}
          >
            {row.original.name}
          </button>
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
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewQuizId(row.original.id)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(row.original)}
              title="Edit quiz"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  // Marks detail columns
  const marksColumns = useMemo<ColumnDef<Mark>[]>(
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
        header: 'Marks Obtained',
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.marksObtained}
            <span className="text-muted-foreground">
              {' '}/ {quizDetailRes?.totalMarks}
            </span>
          </span>
        ),
      },
      {
        id: 'percentage',
        header: 'Percentage',
        cell: ({ row }) => {
          const pct = quizDetailRes?.totalMarks
            ? Math.round((row.original.marksObtained / quizDetailRes.totalMarks) * 100)
            : 0;
          return (
            <Badge
              variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}
            >
              {pct}%
            </Badge>
          );
        },
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.remarks || '--'}
          </span>
        ),
      },
    ],
    [quizDetailRes],
  );

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quiz-name">Quiz Name *</Label>
        <Input
          id="quiz-name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="e.g., Chapter 3 Test"
        />
      </div>
      {!editQuiz && (
        <div className="space-y-2">
          <Label htmlFor="quiz-subject">Subject *</Label>
          <Select value={formSubjectId} onValueChange={setFormSubjectId}>
            <SelectTrigger id="quiz-subject">
              <SelectValue placeholder="Select a subject" />
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
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quiz-date">Date *</Label>
          <Input
            id="quiz-date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quiz-marks">Total Marks *</Label>
          <Input
            id="quiz-marks"
            type="number"
            min={1}
            value={formTotalMarks}
            onChange={(e) => setFormTotalMarks(e.target.value)}
            placeholder="e.g., 100"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quiz-desc">Description</Label>
        <Textarea
          id="quiz-desc"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Optional description..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">
            Create and manage your quizzes and view entered marks.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      {/* Quizzes Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">No quizzes yet</p>
              <p className="text-sm">Click "Create Quiz" to add your first quiz.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={quizzes}
              searchable
              searchPlaceholder="Search quizzes..."
              pagination
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Quiz</DialogTitle>
            <DialogDescription>
              Add a new quiz for your students.
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !formName || !formSubjectId || !formDate || !formTotalMarks}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editQuiz} onOpenChange={(open) => !open && setEditQuiz(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>
              Update quiz details. Subject cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQuiz(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || !formName || !formDate || !formTotalMarks}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quiz Detail Dialog */}
      <Dialog open={!!viewQuizId} onOpenChange={(open) => !open && setViewQuizId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {quizDetailRes?.name ?? 'Quiz Details'}
            </DialogTitle>
            <DialogDescription>
              {quizDetailRes && (
                <span className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary">{quizDetailRes.subject.name}</Badge>
                  <span>{formatDate(quizDetailRes.date)}</span>
                  <span>Total Marks: {quizDetailRes.totalMarks}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : quizDetailRes ? (
            <div className="space-y-4">
              {quizDetailRes.description && (
                <p className="text-sm text-muted-foreground">{quizDetailRes.description}</p>
              )}
              <div>
                <h4 className="mb-3 text-sm font-semibold">
                  Marks Entered ({quizDetailRes.marks?.length ?? 0})
                </h4>
                {quizDetailRes.marks && quizDetailRes.marks.length > 0 ? (
                  <DataTable columns={marksColumns} data={quizDetailRes.marks} />
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No marks entered for this quiz yet.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
