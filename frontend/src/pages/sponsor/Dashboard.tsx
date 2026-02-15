import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Mail,
  Loader2,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { sponsorApi } from '@/api/sponsor.api';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, getFullName, getInitials } from '@/utils/formatters';

export default function SponsorDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['sponsor', 'dashboard'],
    queryFn: () => sponsorApi.getDashboard(),
    select: (res) => res.data.data,
  });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName ?? 'Sponsor'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here is an overview of the students you are sponsoring.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Sponsored Students"
          value={isLoading ? '...' : (dashboard?.totalStudents ?? 0)}
          icon={Users}
        />
        <StatsCard
          title="Total Donated"
          value={isLoading ? '...' : formatCurrency(dashboard?.totalFinanceSpent ?? 0)}
          icon={DollarSign}
        />
        <StatsCard
          title="Unread Messages"
          value={isLoading ? '...' : (dashboard?.unreadMessages ?? 0)}
          icon={Mail}
        />
      </div>

      {/* Sponsored Students Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Sponsored Students</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sponsor/students')}>
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !dashboard?.students || dashboard.students.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">No sponsored students yet.</p>
              <p className="text-sm">Students will appear here once assigned to you by the admin.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.students.map((student) => {
              const pct = student.overallPercentage ?? 0;
              return (
                <Card
                  key={student.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => navigate(`/sponsor/students/${student.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{getFullName(student)}</p>
                        {student.studentProfile?.grade && (
                          <Badge variant="outline" className="mt-0.5">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            {student.studentProfile.grade}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-semibold">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 80
                              ? 'bg-green-500'
                              : pct >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {student.totalQuizzes !== undefined && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {student.totalQuizzes} quizzes completed
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
