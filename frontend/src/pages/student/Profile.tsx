import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, User, MapPin, Calendar, BookOpen, Heart, MessageSquare, Save, Loader2 } from 'lucide-react';
import { studentApi } from '@/api/student.api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatDate, getInitials, getFullName } from '@/utils/formatters';

const profileSchema = z.object({
  grade: z.string().max(20, 'Grade must be 20 characters or less').optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().max(500, 'Address must be 500 characters or less').optional(),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
  goals: z.string().max(1000, 'Goals must be 1000 characters or less').optional(),
  thankYouMessage: z.string().max(2000, 'Message must be 2000 characters or less').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function StudentProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: () => studentApi.getProfile().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      grade: profile?.studentProfile?.grade ?? '',
      dateOfBirth: profile?.studentProfile?.dateOfBirth
        ? profile.studentProfile.dateOfBirth.slice(0, 10)
        : '',
      address: profile?.studentProfile?.address ?? '',
      bio: profile?.studentProfile?.bio ?? '',
      goals: profile?.studentProfile?.goals ?? '',
      thankYouMessage: profile?.studentProfile?.thankYouMessage ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      const formData = new FormData();
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      return studentApi.updateProfile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
      if (avatarPreview) {
        updateUser({ avatarUrl: avatarPreview });
      }
      setAvatarFile(null);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  if (isLoading || !profile) {
    return <LoadingPage message="Loading your profile..." />;
  }

  const displayAvatar = avatarPreview ?? profile.avatarUrl;
  const initials = getInitials(profile.firstName, profile.lastName);
  const sp = profile.studentProfile;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        description="View and update your personal information."
      />

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: Profile Preview */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col items-center pt-8 pb-6">
              {/* Avatar with camera overlay */}
              <div className="group relative mb-4">
                <Avatar className="h-28 w-28 ring-4 ring-primary/10">
                  <AvatarImage src={displayAvatar} alt={getFullName(profile)} />
                  <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Change avatar"
                >
                  <Camera className="h-7 w-7 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </div>

              <h2 className="text-xl font-bold">{getFullName(profile)}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {sp?.grade && (
                <Badge variant="secondary" className="mt-2">
                  Grade {sp.grade}
                </Badge>
              )}

              {sp?.enrollmentDate && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Enrolled {formatDate(sp.enrollmentDate)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sp?.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">{formatDate(sp.dateOfBirth)}</p>
                  </div>
                </div>
              )}
              {sp?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{sp.address}</p>
                  </div>
                </div>
              )}
              {sp?.bio && (
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bio</p>
                    <p className="text-sm">{sp.bio}</p>
                  </div>
                </div>
              )}
              {sp?.goals && (
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Goals</p>
                    <p className="text-sm">{sp.goals}</p>
                  </div>
                </div>
              )}
              {sp?.thankYouMessage && (
                <div className="flex items-start gap-3">
                  <Heart className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Thank You Message</p>
                    <p className="text-sm italic">{sp.thankYouMessage}</p>
                  </div>
                </div>
              )}
              {!sp?.dateOfBirth && !sp?.address && !sp?.bio && !sp?.goals && !sp?.thankYouMessage && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Complete your profile using the form to share more about yourself.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      placeholder="e.g. 10th"
                      {...register('grade')}
                    />
                    {errors.grade && (
                      <p className="text-xs text-destructive">{errors.grade.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    rows={2}
                    placeholder="Your home address"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('bio')}
                  />
                  {errors.bio && (
                    <p className="text-xs text-destructive">{errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Academic Goals</Label>
                  <textarea
                    id="goals"
                    rows={3}
                    placeholder="What are your academic goals?"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('goals')}
                  />
                  {errors.goals && (
                    <p className="text-xs text-destructive">{errors.goals.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thankYouMessage">Thank You Message for Sponsors</Label>
                  <textarea
                    id="thankYouMessage"
                    rows={4}
                    placeholder="Write a heartfelt message to your sponsors..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('thankYouMessage')}
                  />
                  {errors.thankYouMessage && (
                    <p className="text-xs text-destructive">{errors.thankYouMessage.message}</p>
                  )}
                </div>

                {mutation.isError && (
                  <p className="text-sm text-destructive">
                    Failed to update profile. Please try again.
                  </p>
                )}

                {mutation.isSuccess && (
                  <p className="text-sm text-green-600">
                    Profile updated successfully!
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={mutation.isPending || (!isDirty && !avatarFile)}
                  className="w-full sm:w-auto"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
