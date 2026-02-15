import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Send, Mail, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { ROLES } from '@/utils/constants';
import type { Invitation, Role } from '@/types';

function getInvitationStatus(invitation: Invitation): { label: string; variant: 'success' | 'warning' | 'destructive' } {
  if (invitation.usedAt) {
    return { label: 'Used', variant: 'success' };
  }
  if (new Date(invitation.expiresAt) < new Date()) {
    return { label: 'Expired', variant: 'destructive' };
  }
  return { label: 'Pending', variant: 'warning' };
}

const columns: ColumnDef<Invitation, unknown>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { label, variant } = getInvitationStatus(row.original);
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Sent Date',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: 'inviter',
    header: 'Invited By',
    cell: ({ row }) =>
      row.original.inviter ? getFullName(row.original.inviter) : 'N/A',
  },
];

export default function InvitationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'invitations', page],
    queryFn: async () => {
      const res = await adminApi.listInvitations({ page, limit: 20 });
      return res.data.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { email: string; role: Role }) =>
      adminApi.sendInvitation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invitations'] });
      setDialogOpen(false);
      setEmail('');
      setRole('');
      toast({ title: 'Invitation sent successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to send invitation',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;
    sendMutation.mutate({ email, role: role as Role });
  };

  const invitations = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (isLoading) {
    return <LoadingPage message="Loading invitations..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load invitations</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations"
        description="Send and manage platform invitations"
      >
        <Button onClick={() => setDialogOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      </PageHeader>

      {invitations.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={invitations}
            searchable
            searchPlaceholder="Search by email..."
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
          icon={Mail}
          title="No invitations yet"
          description="Send your first invitation to add users to the platform."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          }
        />
      )}

      {/* Send Invitation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invitation</DialogTitle>
            <DialogDescription>
              Invite a new user to join RiseUp Preps Academy. They will receive an email
              with a registration link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inv-email">Email Address</Label>
              <Input
                id="inv-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-role">Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                <SelectTrigger id="inv-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
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
                disabled={sendMutation.isPending || !email || !role}
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
