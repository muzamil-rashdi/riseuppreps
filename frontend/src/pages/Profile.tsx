import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Phone, Shield, Calendar, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, getInitials, getFullName } from '@/utils/formatters';

export default function ProfilePage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const mutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phone?: string }) =>
      adminApi.updateUser(user!.id, data),
    onSuccess: () => {
      updateUser({ firstName, lastName, phone: phone || undefined });
      toast({ title: 'Profile updated successfully' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update profile',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      firstName,
      lastName,
      phone: phone || undefined,
    });
  };

  if (!user) return null;

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-primary text-primary-foreground',
    TEACHER: 'bg-blue-500 text-white',
    SPONSOR: 'bg-emerald-500 text-white',
    STUDENT: 'bg-amber-500 text-white',
  };

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
              <Avatar className="mb-4 h-28 w-28 ring-4 ring-primary/10">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={getFullName(user)} />}
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold">{getFullName(user)}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={`mt-2 ${roleColors[user.role] ?? ''}`}>
                {user.role}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium">{user.role}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact admin for assistance.
                  </p>
                </div>

                {mutation.isSuccess && (
                  <p className="text-sm text-green-600">Profile updated successfully!</p>
                )}

                <Button
                  type="submit"
                  disabled={mutation.isPending}
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
