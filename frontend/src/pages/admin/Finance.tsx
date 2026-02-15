import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { DollarSign, Plus, Receipt, Trash2, AlertCircle, Heart } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FileUpload } from '@/components/common/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { formatDate, formatCurrency, getFullName } from '@/utils/formatters';
import type { FinancialRecord, User } from '@/types';

export default function FinancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterSponsor, setFilterSponsor] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<FinancialRecord | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form state
  const [formSponsorId, setFormSponsorId] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReceipt, setFormReceipt] = useState<File | null>(null);

  // Fetch financial summary
  const { data: summaryData } = useQuery({
    queryKey: ['admin', 'finance', 'summary'],
    queryFn: async () => {
      const res = await adminApi.getFinancialSummary();
      return res.data.data;
    },
  });

  // Fetch records
  const apiParams = useMemo(() => {
    const params: { page: number; limit: number; sponsorId?: string } = {
      page,
      limit: 20,
    };
    if (filterSponsor && filterSponsor !== 'all') params.sponsorId = filterSponsor;
    return params;
  }, [page, filterSponsor]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'finance', apiParams],
    queryFn: async () => {
      const res = await adminApi.listFinancialRecords(apiParams);
      return res.data.data;
    },
  });

  // Fetch all sponsors for filter + form dropdown
  const { data: sponsorsData } = useQuery({
    queryKey: ['admin', 'users', 'sponsors-finance'],
    queryFn: async () => {
      const res = await adminApi.listUsers({ role: 'SPONSOR', limit: 200 });
      return res.data.data;
    },
  });

  const sponsors: User[] = sponsorsData?.data ?? [];

  // Fetch students for the selected sponsor in the form
  const { data: sponsorStudentsData } = useQuery({
    queryKey: ['admin', 'sponsor-students', formSponsorId],
    queryFn: async () => {
      const res = await adminApi.getSponsorStudents(formSponsorId);
      return res.data.data;
    },
    enabled: !!formSponsorId,
  });

  const sponsorStudents = sponsorStudentsData ?? [];

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => adminApi.createFinancialRecord(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] });
      setDialogOpen(false);
      resetForm();
      toast({ title: 'Donation record created successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create record',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFinancialRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] });
      setConfirmOpen(false);
      setDeleteTarget(null);
      toast({ title: 'Record deleted successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete record',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormSponsorId('');
    setFormStudentId('');
    setFormAmount('');
    setFormDate('');
    setFormDescription('');
    setFormReceipt(null);
  };

  const handleSponsorChange = (sponsorId: string) => {
    setFormSponsorId(sponsorId);
    setFormStudentId(''); // Reset student when sponsor changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSponsorId || !formStudentId || !formAmount || !formDate) return;

    const formData = new FormData();
    formData.append('sponsorId', formSponsorId);
    formData.append('studentId', formStudentId);
    formData.append('amount', formAmount);
    formData.append('date', formDate);
    if (formDescription) formData.append('description', formDescription);
    if (formReceipt) formData.append('receipt', formReceipt);

    createMutation.mutate(formData);
  };

  const handleDeleteOpen = (record: FinancialRecord) => {
    setDeleteTarget(record);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  const handleFileUpload = useCallback((file: File) => {
    setFormReceipt(file);
  }, []);

  const columns: ColumnDef<FinancialRecord, unknown>[] = useMemo(
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
          <span className="max-w-[200px] truncate block text-muted-foreground">
            {row.original.description || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: 'receiptUrl',
        header: 'Receipt',
        cell: ({ row }) =>
          row.original.receiptUrl ? (
            <a
              href={row.original.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Receipt className="h-3 w-3" />
              View
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteOpen(row.original)}
            title="Delete record"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  const records = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (isLoading) {
    return <LoadingPage message="Loading donation records..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load donation records</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsor Donations"
        description="Track and manage sponsor donations for students"
      >
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Donation
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Donations"
            value={formatCurrency(summaryData.totalAmount)}
            icon={DollarSign}
          />
          <StatsCard
            title="Active Sponsors"
            value={sponsors.length}
            icon={Heart}
          />
          <StatsCard
            title="Total Records"
            value={pagination?.total ?? 0}
            icon={Receipt}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-[220px] space-y-1">
          <Label className="text-xs text-muted-foreground">Filter by Sponsor</Label>
          <Select
            value={filterSponsor}
            onValueChange={(val) => { setFilterSponsor(val); setPage(1); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sponsors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sponsors</SelectItem>
              {sponsors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {getFullName(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Records Table */}
      {records.length > 0 ? (
        <>
          <DataTable columns={columns} data={records} />

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
          icon={DollarSign}
          title="No donation records"
          description="Add your first donation record to start tracking."
          action={
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Donation
            </Button>
          }
        />
      )}

      {/* Add Donation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Donation Record</DialogTitle>
            <DialogDescription>
              Record a new sponsor donation for a student.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fin-sponsor">Sponsor</Label>
              <Select value={formSponsorId} onValueChange={handleSponsorChange}>
                <SelectTrigger id="fin-sponsor">
                  <SelectValue placeholder="Select a sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {sponsors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {getFullName(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fin-student">Student</Label>
              <Select
                value={formStudentId}
                onValueChange={setFormStudentId}
                disabled={!formSponsorId}
              >
                <SelectTrigger id="fin-student">
                  <SelectValue placeholder={formSponsorId ? 'Select a student' : 'Select a sponsor first'} />
                </SelectTrigger>
                <SelectContent>
                  {sponsorStudents.map((s: { id: string; firstName: string; lastName: string }) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formSponsorId && sponsorStudents.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No students assigned to this sponsor.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fin-amount">Amount (PKR)</Label>
                <Input
                  id="fin-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-date">Date</Label>
                <Input
                  id="fin-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fin-desc">Description (optional)</Label>
              <Textarea
                id="fin-desc"
                placeholder="Details about this donation..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Receipt (optional)</Label>
              <FileUpload
                accept=".pdf,.png,.jpg,.jpeg"
                maxSize={5 * 1024 * 1024}
                onUpload={handleFileUpload}
                label="Upload receipt"
                description="PDF, PNG, or JPG up to 5MB"
              />
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
                disabled={
                  createMutation.isPending ||
                  !formSponsorId ||
                  !formStudentId ||
                  !formAmount ||
                  !formDate
                }
              >
                {createMutation.isPending ? 'Saving...' : 'Add Donation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        title="Delete Donation Record"
        description={
          deleteTarget
            ? `Are you sure you want to delete this ${formatCurrency(deleteTarget.amount)} donation for ${getFullName(deleteTarget.student)}?`
            : 'Are you sure you want to delete this record?'
        }
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        confirmText="Delete"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
