import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
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
import { useToast } from '@/components/ui/use-toast';
import { formatRelative, getFullName } from '@/utils/formatters';
import type { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Fetch announcements -- adminApi does not have a listAnnouncements method,
  // so we use the getDashboard or a custom approach. Based on the CRUD endpoints,
  // announcements are managed via create/update/delete. We'll fetch via apiClient.
  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: async () => {
      // The admin API has create/update/delete but no list endpoint.
      // We use apiClient directly for listing.
      const { default: apiClient } = await import('@/api/client');
      const res = await apiClient.get<{ success: boolean; data: Announcement[] }>('/admin/announcements');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; body: string }) =>
      adminApi.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Announcement published successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create announcement',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; body: string } }) =>
      adminApi.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setEditDialogOpen(false);
      setEditingAnnouncement(null);
      resetForm();
      toast({ title: 'Announcement updated successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update announcement',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setConfirmOpen(false);
      setDeleteTarget(null);
      toast({ title: 'Announcement deleted successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete announcement',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setTitle('');
    setBody('');
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    createMutation.mutate({ title: title.trim(), body: body.trim() });
  };

  const handleEditOpen = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setBody(announcement.body);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !title.trim() || !body.trim()) return;
    updateMutation.mutate({
      id: editingAnnouncement.id,
      data: { title: title.trim(), body: body.trim() },
    });
  };

  const handleDeleteOpen = (announcement: Announcement) => {
    setDeleteTarget(announcement);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  if (isLoading) {
    return <LoadingPage message="Loading announcements..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load announcements</h3>
      </div>
    );
  }

  const announcementList = announcements ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Broadcast announcements to all platform users"
      >
        <Button onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </PageHeader>

      {announcementList.length > 0 ? (
        <div className="space-y-4">
          {announcementList.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base leading-snug">
                      {announcement.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Posted by {getFullName(announcement.admin)}{' '}
                      {formatRelative(announcement.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditOpen(announcement)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOpen(announcement)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {announcement.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="Create your first announcement to broadcast to all users."
          action={
            <Button onClick={handleCreateOpen}>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          }
        />
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>
              This announcement will be visible to all platform users.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-body">Body</Label>
              <Textarea
                id="ann-body"
                placeholder="Write your announcement here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
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
                disabled={createMutation.isPending || !title.trim() || !body.trim()}
              >
                {createMutation.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update this announcement. Changes will be visible immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ann-title">Title</Label>
              <Input
                id="edit-ann-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ann-body">Body</Label>
              <Textarea
                id="edit-ann-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
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
                disabled={updateMutation.isPending || !title.trim() || !body.trim()}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        title="Delete Announcement"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        confirmText="Delete"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
