import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  Award,
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
import { formatDate } from '@/utils/formatters';
import type { StudentAchievement } from '@/types';

const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  date: z.string().min(1, 'Date is required'),
});

type AchievementFormData = z.infer<typeof achievementSchema>;

export default function StudentAchievements() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentAchievement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentAchievement | null>(null);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['student', 'achievements'],
    queryFn: () => studentApi.listAchievements().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    values: editTarget
      ? {
          title: editTarget.title,
          description: editTarget.description ?? '',
          date: editTarget.date.slice(0, 10),
        }
      : {
          title: '',
          description: '',
          date: new Date().toISOString().slice(0, 10),
        },
  });

  const createMutation = useMutation({
    mutationFn: (data: AchievementFormData) =>
      studentApi.createAchievement({
        title: data.title,
        description: data.description || undefined,
        date: data.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'achievements'] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AchievementFormData }) =>
      studentApi.updateAchievement(id, {
        title: data.title,
        description: data.description || undefined,
        date: data.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'achievements'] });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentApi.deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'achievements'] });
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
    reset({ title: '', description: '', date: new Date().toISOString().slice(0, 10) });
    setIsDialogOpen(true);
  };

  const openEdit = (achievement: StudentAchievement) => {
    setEditTarget(achievement);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AchievementFormData) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Sort achievements chronologically (newest first)
  const sortedAchievements = achievements
    ? [...achievements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
    : [];

  if (isLoading) {
    return <LoadingPage message="Loading achievements..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Achievements"
        description="Track and showcase your accomplishments."
      >
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Achievement
        </Button>
      </PageHeader>

      {/* Timeline */}
      {sortedAchievements.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border lg:left-1/2 lg:-translate-x-px" />

          <div className="space-y-8">
            {sortedAchievements.map((achievement, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={achievement.id}
                  className="relative flex items-start gap-6 lg:gap-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 z-10 -translate-x-1/2 lg:left-1/2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {/* Card - on mobile always right, on desktop alternating */}
                  <div
                    className={`ml-14 w-full lg:ml-0 lg:w-[calc(50%-2rem)] ${
                      isLeft ? 'lg:mr-auto lg:pr-8' : 'lg:ml-auto lg:pl-8'
                    }`}
                  >
                    <Card className="transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold leading-snug">
                            {achievement.title}
                          </h3>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(achievement)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteTarget(achievement)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {achievement.description && (
                          <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
                            {achievement.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(achievement.date)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No achievements yet"
          description="Record your first achievement to start building your timeline."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          }
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? 'Edit Achievement' : 'Add Achievement'}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Update the details of your achievement.'
                : 'Record a new accomplishment to your timeline.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ach-title">Title</Label>
              <Input
                id="ach-title"
                placeholder="e.g. Won Science Fair"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ach-desc">Description (optional)</Label>
              <textarea
                id="ach-desc"
                rows={3}
                placeholder="Describe your achievement..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ach-date">Date</Label>
              <Input
                id="ach-date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-sm text-destructive">
                Failed to save achievement. Please try again.
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
                  'Add Achievement'
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
        title="Delete Achievement"
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
