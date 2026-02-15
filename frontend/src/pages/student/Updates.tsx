import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  FileEdit,
} from 'lucide-react';
import { studentApi } from '@/api/student.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate, formatRelative } from '@/utils/formatters';
import type { StudentUpdate } from '@/types';

const updateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be 5000 characters or less'),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function StudentUpdates() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentUpdate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentUpdate | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: updates, isLoading } = useQuery({
    queryKey: ['student', 'updates'],
    queryFn: () => studentApi.listUpdates().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    values: editTarget
      ? { title: editTarget.title, content: editTarget.content }
      : { title: '', content: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: UpdateFormData) => studentApi.createUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'updates'] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormData }) =>
      studentApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'updates'] });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentApi.deleteUpdate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'updates'] });
      setDeleteTarget(null);
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditTarget(null);
    reset();
  };

  const openCreate = () => {
    setEditTarget(null);
    reset({ title: '', content: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (update: StudentUpdate) => {
    setEditTarget(update);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: UpdateFormData) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Sort updates newest first
  const sortedUpdates = updates
    ? [...updates].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : [];

  if (isLoading) {
    return <LoadingPage message="Loading updates..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Updates"
        description="Share progress updates and stories with your sponsors."
      >
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Write New Update
        </Button>
      </PageHeader>

      {/* Blog-style Update List */}
      {sortedUpdates.length > 0 ? (
        <div className="space-y-4">
          {sortedUpdates.map((update) => {
            const isExpanded = expandedId === update.id;
            const isLong = update.content.length > 200;
            const previewContent = isLong
              ? update.content.slice(0, 200) + '...'
              : update.content;
            const wasEdited = update.updatedAt !== update.createdAt;

            return (
              <Card
                key={update.id}
                className="transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold leading-snug">
                        {update.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelative(update.createdAt)}
                        </span>
                        <span>{formatDate(update.createdAt)}</span>
                        {wasEdited && (
                          <span className="flex items-center gap-1 italic">
                            <FileEdit className="h-3 w-3" />
                            edited
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(update)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(update)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground/80">
                    <p className="whitespace-pre-wrap">
                      {isExpanded ? update.content : previewContent}
                    </p>
                  </div>

                  {/* Expand/collapse toggle */}
                  {isLong && (
                    <button
                      onClick={() => toggleExpand(update.id)}
                      className="mt-3 flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Read more
                        </>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="No updates yet"
          description="Write your first update to share your progress with sponsors."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Write New Update
            </Button>
          }
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? 'Edit Update' : 'Write New Update'}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Modify your update below.'
                : 'Share a progress update or story. This will be visible to your sponsors.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upd-title">Title</Label>
              <Input
                id="upd-title"
                placeholder="e.g. My Progress This Month"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upd-content">Content</Label>
              <textarea
                id="upd-content"
                rows={8}
                placeholder="Write your update here... Share what you've learned, challenges you've overcome, or goals you've achieved."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('content')}
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content.message}</p>
              )}
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-sm text-destructive">
                Failed to save update. Please try again.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editTarget ? (
                  'Update'
                ) : (
                  'Publish'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Update"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        variant="destructive"
        confirmText="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
