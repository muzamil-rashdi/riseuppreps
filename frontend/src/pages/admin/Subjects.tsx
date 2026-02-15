import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Pencil, XCircle, AlertCircle, Users, X, GraduationCap } from 'lucide-react';
import apiClient from '@/api/client';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, getFullName } from '@/utils/formatters';
import type { Subject, User, ApiResponse, PaginatedResponse } from '@/types';

// ─── Manage Members Sub-Component ────────────────────────────────────────────

interface ManageMembersDialogProps {
  subject: Subject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ManageMembersDialog({ subject, open, onOpenChange }: ManageMembersDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Fetch current members for this subject
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['subject-members', subject.id],
    queryFn: async () => {
      const res = await adminApi.getSubjectMembers(subject.id);
      return res.data.data;
    },
    enabled: open,
  });

  // Fetch all teachers
  const { data: allTeachersData } = useQuery({
    queryKey: ['users', 'TEACHER'],
    queryFn: async () => {
      const res = await adminApi.listUsers({ role: 'TEACHER', limit: 200 });
      return res.data.data;
    },
    enabled: open,
  });

  // Fetch all students
  const { data: allStudentsData } = useQuery({
    queryKey: ['users', 'STUDENT'],
    queryFn: async () => {
      const res = await adminApi.listUsers({ role: 'STUDENT', limit: 200 });
      return res.data.data;
    },
    enabled: open,
  });

  const assignedTeachers = membersData?.teachers ?? [];
  const assignedStudents = membersData?.students ?? [];
  const allTeachers = allTeachersData?.data ?? [];
  const allStudents = allStudentsData?.data ?? [];

  // Filter out already-assigned members
  const assignedTeacherIds = new Set(assignedTeachers.map((t) => t.id));
  const assignedStudentIds = new Set(assignedStudents.map((s) => s.id));
  const availableTeachers = allTeachers.filter((t) => !assignedTeacherIds.has(t.id));
  const availableStudents = allStudents.filter((s) => !assignedStudentIds.has(s.id));

  // ── Mutations ──

  const assignTeacherMutation = useMutation({
    mutationFn: (teacherId: string) =>
      adminApi.assignTeacherSubject({ teacherId, subjectId: subject.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-members', subject.id] });
      setSelectedTeacherId('');
      toast({ title: 'Teacher assigned successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to assign teacher',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const removeTeacherMutation = useMutation({
    mutationFn: (teacherId: string) =>
      adminApi.removeTeacherSubject({ teacherId, subjectId: subject.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-members', subject.id] });
      toast({ title: 'Teacher removed successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to remove teacher',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const enrollStudentMutation = useMutation({
    mutationFn: (studentId: string) =>
      adminApi.enrollStudentSubject({ studentId, subjectId: subject.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-members', subject.id] });
      setSelectedStudentId('');
      toast({ title: 'Student enrolled successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to enroll student',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: (studentId: string) =>
      adminApi.removeStudentSubject({ studentId, subjectId: subject.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-members', subject.id] });
      toast({ title: 'Student removed successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to remove student',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleAddTeacher = (teacherId: string) => {
    if (!teacherId) return;
    assignTeacherMutation.mutate(teacherId);
  };

  const handleAddStudent = (studentId: string) => {
    if (!studentId) return;
    enrollStudentMutation.mutate(studentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage {subject.name}</DialogTitle>
          <DialogDescription>
            Assign teachers and enroll students in this subject.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teachers">
              Teachers ({assignedTeachers.length})
            </TabsTrigger>
            <TabsTrigger value="students">
              Students ({assignedStudents.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Teachers Tab ── */}
          <TabsContent value="teachers" className="space-y-4">
            {/* Add teacher select */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="add-teacher">Add Teacher</Label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                >
                  <SelectTrigger id="add-teacher">
                    <SelectValue placeholder="Select a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        No available teachers
                      </SelectItem>
                    ) : (
                      availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {getFullName(teacher)} ({teacher.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                disabled={!selectedTeacherId || assignTeacherMutation.isPending}
                onClick={() => handleAddTeacher(selectedTeacherId)}
              >
                {assignTeacherMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>

            {/* Assigned teachers list */}
            {membersLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Loading members...
              </p>
            ) : assignedTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No teachers assigned yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {assignedTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {getFullName(teacher)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {teacher.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-7 w-7 p-0 text-destructive hover:text-destructive"
                      disabled={removeTeacherMutation.isPending}
                      onClick={() => removeTeacherMutation.mutate(teacher.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove {getFullName(teacher)}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Students Tab ── */}
          <TabsContent value="students" className="space-y-4">
            {/* Add student select */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="add-student">Add Student</Label>
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger id="add-student">
                    <SelectValue placeholder="Select a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        No available students
                      </SelectItem>
                    ) : (
                      availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {getFullName(student)} ({student.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                disabled={!selectedStudentId || enrollStudentMutation.isPending}
                onClick={() => handleAddStudent(selectedStudentId)}
              >
                {enrollStudentMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>

            {/* Enrolled students list */}
            {membersLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Loading members...
              </p>
            ) : assignedStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No students enrolled yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {assignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {getFullName(student)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-7 w-7 p-0 text-destructive hover:text-destructive"
                      disabled={removeStudentMutation.isPending}
                      onClick={() => removeStudentMutation.mutate(student.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove {getFullName(student)}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subject Member Count Badge ──────────────────────────────────────────────

function SubjectMemberBadges({ subjectId }: { subjectId: string }) {
  const { data: membersData } = useQuery({
    queryKey: ['subject-members', subjectId],
    queryFn: async () => {
      const res = await adminApi.getSubjectMembers(subjectId);
      return res.data.data;
    },
  });

  const teacherCount = membersData?.teachers?.length ?? 0;
  const studentCount = membersData?.students?.length ?? 0;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        <Users className="mr-1 h-3 w-3" />
        {teacherCount} {teacherCount === 1 ? 'Teacher' : 'Teachers'}
      </Badge>
      <Badge variant="outline" className="text-xs">
        <GraduationCap className="mr-1 h-3 w-3" />
        {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
      </Badge>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function SubjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deactivateSubject, setDeactivateSubject] = useState<Subject | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [manageSubject, setManageSubject] = useState<Subject | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch subjects via apiClient
  const { data: subjects, isLoading, isError } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Subject[]>>('/subjects');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      adminApi.createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Subject created successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create subject',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) =>
      adminApi.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setEditDialogOpen(false);
      setEditingSubject(null);
      resetForm();
      toast({ title: 'Subject updated successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update subject',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setConfirmOpen(false);
      setDeactivateSubject(null);
      toast({ title: 'Subject deactivated successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to deactivate subject',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  };

  const handleEditOpen = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setDescription(subject.description ?? '');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !name.trim()) return;
    updateMutation.mutate({
      id: editingSubject.id,
      data: { name: name.trim(), description: description.trim() || undefined },
    });
  };

  const handleDeactivateOpen = (subject: Subject) => {
    setDeactivateSubject(subject);
    setConfirmOpen(true);
  };

  const handleDeactivateConfirm = () => {
    if (!deactivateSubject) return;
    deactivateMutation.mutate(deactivateSubject.id);
  };

  const handleManageOpen = (subject: Subject) => {
    setManageSubject(subject);
    setManageDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingPage message="Loading subjects..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load subjects</h3>
      </div>
    );
  }

  const subjectList = subjects ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="Manage academic subjects"
      >
        <Button onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </PageHeader>

      {subjectList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectList.map((subject) => (
            <Card
              key={subject.id}
              className={!subject.isActive ? 'opacity-60' : undefined}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{subject.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Created {formatDate(subject.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={subject.isActive ? 'success' : 'destructive'}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subject.description || 'No description provided.'}
                </p>
                <SubjectMemberBadges subjectId={subject.id} />
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageOpen(subject)}
                >
                  <Users className="mr-1 h-3 w-3" />
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditOpen(subject)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                {subject.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivateOpen(subject)}
                    className="text-destructive hover:text-destructive"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Deactivate
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Add your first subject to start managing the curriculum."
          action={
            <Button onClick={handleCreateOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          }
        />
      )}

      {/* Create Subject Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
            <DialogDescription>
              Create a new academic subject for the curriculum.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subj-name">Subject Name</Label>
              <Input
                id="subj-name"
                placeholder="e.g. Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj-desc">Description (optional)</Label>
              <Textarea
                id="subj-desc"
                placeholder="Brief description of the subject..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Subject'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the details for {editingSubject?.name ?? 'this subject'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subj-name">Subject Name</Label>
              <Input
                id="edit-subj-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subj-desc">Description (optional)</Label>
              <Textarea
                id="edit-subj-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || !name.trim()}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        title="Deactivate Subject"
        description={`Are you sure you want to deactivate "${deactivateSubject?.name}"? This will hide it from active use.`}
        onConfirm={handleDeactivateConfirm}
        variant="destructive"
        confirmText="Deactivate"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />

      {/* Manage Members Dialog */}
      {manageSubject && (
        <ManageMembersDialog
          subject={manageSubject}
          open={manageDialogOpen}
          onOpenChange={(open) => {
            setManageDialogOpen(open);
            if (!open) setManageSubject(null);
          }}
        />
      )}
    </div>
  );
}
