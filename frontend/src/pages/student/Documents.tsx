import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  Download,
  Trash2,
  Plus,
  Loader2,
  FileSpreadsheet,
  FileArchive,
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
import type { StudentDocument } from '@/types';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type.startsWith('image/')) return ImageIcon;
  if (type.includes('pdf')) return FileText;
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return FileSpreadsheet;
  if (type.includes('zip') || type.includes('archive') || type.includes('rar')) return FileArchive;
  return File;
}

function getFileExtension(fileType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/png': 'PNG',
    'image/jpeg': 'JPG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'text/csv': 'CSV',
    'application/zip': 'ZIP',
  };
  return map[fileType] ?? fileType.split('/').pop()?.toUpperCase() ?? 'FILE';
}

export default function StudentDocuments() {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentDocument | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['student', 'documents'],
    queryFn: () => studentApi.listDocuments().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const uploadMutation = useMutation({
    mutationFn: (data: UploadFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (selectedFile) formData.append('file', selectedFile);
      return studentApi.uploadDocument(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'documents'] });
      setIsUploadOpen(false);
      setSelectedFile(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'documents'] });
      setDeleteTarget(null);
    },
  });

  const onUploadSubmit = (data: UploadFormData) => {
    if (!selectedFile) return;
    uploadMutation.mutate(data);
  };

  const handleDownload = (doc: StudentDocument) => {
    window.open(doc.fileUrl, '_blank');
  };

  if (isLoading) {
    return <LoadingPage message="Loading documents..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Documents" description="Upload and manage your documents.">
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </PageHeader>

      {/* Document Grid */}
      {documents && documents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => {
            const FileIcon = getFileIcon(doc.fileType);
            const ext = getFileExtension(doc.fileType);

            return (
              <Card
                key={doc.id}
                className="group relative overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-5">
                  {/* File type icon with badge */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">
                      {ext}
                    </span>
                  </div>

                  {/* Title and description */}
                  <h3 className="mb-1 truncate text-sm font-semibold">{doc.title}</h3>
                  {doc.description && (
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                      {doc.description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Uploaded {formatDate(doc.uploadedAt)}
                  </p>

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first document to get started."
          action={
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          }
        />
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to your profile. Supported formats: PDF, images, and office documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                placeholder="e.g. Report Card - Term 1"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-desc">Description (optional)</Label>
              <textarea
                id="doc-desc"
                rows={2}
                placeholder="Brief description of the document"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>File</Label>
              {!selectedFile ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById('doc-file')?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.getElementById('doc-file')?.click();
                    }
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 10MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <input
                id="doc-file"
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </div>

            {uploadMutation.isError && (
              <p className="text-sm text-destructive">
                Failed to upload document. Please try again.
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploadMutation.isPending || !selectedFile}>
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
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
        title="Delete Document"
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
