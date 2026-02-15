import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, getFullName } from '@/utils/formatters';
import type { SponsorStudent, User } from '@/types';

export default function AssignmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sponsorId, setSponsorId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [page, setPage] = useState(1);
  const [removeTarget, setRemoveTarget] = useState<SponsorStudent | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch assignments
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'assignments', page],
    queryFn: async () => {
      const res = await adminApi.listAssignments({ page, limit: 20 });
      return res.data.data;
    },
  });

  // Fetch sponsors for dropdown
  const { data: sponsorsData } = useQuery({
    queryKey: ['admin', 'users', 'sponsors-dropdown'],
    queryFn: async () => {
      const res = await adminApi.listUsers({ role: 'SPONSOR', limit: 200 });
      return res.data.data;
    },
  });

  // Fetch students for dropdown
  const { data: studentsData } = useQuery({
    queryKey: ['admin', 'users', 'students-dropdown'],
    queryFn: async () => {
      const res = await adminApi.listUsers({ role: 'STUDENT', limit: 200 });
      return res.data.data;
    },
  });

  const sponsors: User[] = sponsorsData?.data ?? [];
  const students: User[] = studentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: { sponsorId: string; studentId: string }) =>
      adminApi.createAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignments'] });
      setDialogOpen(false);
      setSponsorId('');
      setStudentId('');
      toast({ title: 'Assignment created successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create assignment',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignments'] });
      setConfirmOpen(false);
      setRemoveTarget(null);
      toast({ title: 'Assignment removed successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to remove assignment',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorId || !studentId) return;
    createMutation.mutate({ sponsorId, studentId });
  };

  const handleRemoveOpen = (assignment: SponsorStudent) => {
    setRemoveTarget(assignment);
    setConfirmOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget.id);
  };

  const columns: ColumnDef<SponsorStudent, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'sponsor',
        header: 'Sponsor',
        cell: ({ row }) => (
          <div className="font-medium">{getFullName(row.original.sponsor)}</div>
        ),
      },
      {
        accessorKey: 'student',
        header: 'Student',
        cell: ({ row }) => (
          <div className="font-medium">{getFullName(row.original.student)}</div>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const assignment = row.original;
          return assignment.isActive ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveOpen(assignment)}
              title="Remove assignment"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ) : null;
        },
        enableSorting: false,
      },
    ],
    [],
  );

  const assignments = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (isLoading) {
    return <LoadingPage message="Loading assignments..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load assignments</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsor-Student Assignments"
        description="Manage sponsor-student pairings"
      >
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </PageHeader>

      {assignments.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={assignments}
            searchable
            searchPlaceholder="Search assignments..."
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({pagination?.total ?? 0} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Link2}
          title="No assignments yet"
          description="Create your first sponsor-student assignment to get started."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          }
        />
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>
              Assign a sponsor to a student. The sponsor will be able to view the student's
              progress and financial records.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assign-sponsor">Sponsor</Label>
              <Select value={sponsorId} onValueChange={setSponsorId}>
                <SelectTrigger id="assign-sponsor">
                  <SelectValue placeholder="Select a sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {sponsors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {getFullName(s)} ({s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="assign-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {getFullName(s)} ({s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !sponsorId || !studentId}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirm Dialog */}
      <ConfirmDialog
        title="Remove Assignment"
        description={
          removeTarget
            ? `Are you sure you want to remove the assignment between ${getFullName(removeTarget.sponsor)} and ${getFullName(removeTarget.student)}?`
            : 'Are you sure you want to remove this assignment?'
        }
        onConfirm={handleRemoveConfirm}
        variant="destructive"
        confirmText="Remove"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
