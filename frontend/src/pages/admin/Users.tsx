import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Users as UsersIcon, Pencil, UserX, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import type { User, Role } from '@/types';

type TabValue = 'ALL' | 'SPONSOR' | 'TEACHER' | 'STUDENT';

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const roleFilter = activeTab === 'ALL' ? undefined : (activeTab as Role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', { page, role: roleFilter }],
    queryFn: async () => {
      const res = await adminApi.listUsers({ page, limit: 20, role: roleFilter });
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditDialogOpen(false);
      setEditingUser(null);
      toast({ title: 'User updated successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update user',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmOpen(false);
      setDeactivateUser(null);
      toast({ title: 'User deactivated successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to deactivate user',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleEditOpen = (user: User) => {
    setEditingUser(user);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditPhone(user.phone ?? '');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: {
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone || undefined,
      },
    });
  };

  const handleDeactivateOpen = (user: User) => {
    setDeactivateUser(user);
    setConfirmOpen(true);
  };

  const handleDeactivateConfirm = () => {
    if (!deactivateUser) return;
    deactivateMutation.mutate(deactivateUser.id);
  };

  const columns: ColumnDef<User, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium">{getFullName(row.original)}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const role = row.original.role;
          const variant =
            role === 'ADMIN'
              ? 'default'
              : role === 'TEACHER'
                ? 'secondary'
                : role === 'SPONSOR'
                  ? 'outline'
                  : 'warning';
          return <Badge variant={variant}>{role}</Badge>;
        },
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
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditOpen(user)}
                title="Edit user"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {user.isActive && user.role !== 'ADMIN' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeactivateOpen(user)}
                  title="Deactivate user"
                >
                  <UserX className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );

  const users = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (isLoading) {
    return <LoadingPage message="Loading users..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load users</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage all users across the platform"
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as TabValue);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="SPONSOR">Sponsors</TabsTrigger>
          <TabsTrigger value="TEACHER">Teachers</TabsTrigger>
          <TabsTrigger value="STUDENT">Students</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {users.length > 0 ? (
            <>
              <DataTable columns={columns} data={users} searchable searchPlaceholder="Search users..." />

              {/* Server-side Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({pagination?.total ?? 0} total users)
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
              icon={UsersIcon}
              title="No users found"
              description="There are no users matching the current filter."
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the details for {editingUser ? getFullName(editingUser) : 'this user'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone (optional)</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${deactivateUser ? getFullName(deactivateUser) : 'this user'}? They will no longer be able to log in.`}
        onConfirm={handleDeactivateConfirm}
        variant="destructive"
        confirmText="Deactivate"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
