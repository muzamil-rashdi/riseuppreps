import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Loader2,
  GraduationCap,
  ChevronRight,
  Search,
  BookOpen,
} from 'lucide-react';
import { sponsorApi } from '@/api/sponsor.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFullName, getInitials } from '@/utils/formatters';
import type { User } from '@/types';

export default function SponsorStudents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['sponsor', 'students'],
    queryFn: () => sponsorApi.listStudents(),
    select: (res) => res.data.data,
  });
  const students: User[] = studentsData ?? [];

  // Also fetch dashboard for performance percentages
  const { data: dashboard } = useQuery({
    queryKey: ['sponsor', 'dashboard'],
    queryFn: () => sponsorApi.getDashboard(),
    select: (res) => res.data.data,
  });

  // Map of student performance percentages from dashboard
  const performanceMap = useMemo(() => {
    const map: Record<string, { percentage: number; quizzes: number }> = {};
    dashboard?.students?.forEach((s: any) => {
      map[s.id] = {
        percentage: s.overallPercentage ?? 0,
        quizzes: s.totalQuizzes ?? 0,
      };
    });
    return map;
  }, [dashboard]);

  // Filter by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentProfile?.grade?.toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sponsored Students</h1>
        <p className="text-muted-foreground">
          View all the students you are sponsoring and explore their profiles.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students by name, email, or grade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="font-medium">
            {searchQuery ? 'No students match your search.' : 'No sponsored students yet.'}
          </p>
          {!searchQuery && (
            <p className="text-sm">Students will appear here once assigned by the admin.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const perf = performanceMap[student.id];
            const pct = perf?.percentage ?? 0;

            return (
              <Card
                key={student.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                onClick={() => navigate(`/sponsor/students/${student.id}`)}
              >
                <CardContent className="p-6">
                  {/* Student header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {getInitials(student.firstName, student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold group-hover:text-primary transition-colors">
                        {getFullName(student)}
                      </p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      {student.studentProfile?.grade && (
                        <Badge variant="outline" className="mt-1.5">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          Grade: {student.studentProfile.grade}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bio preview */}
                  {student.studentProfile?.bio && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {student.studentProfile.bio}
                    </p>
                  )}

                  {/* Performance */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        Performance
                      </span>
                      <span className="font-semibold">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
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
                    {perf && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {perf.quizzes} quizzes completed
                      </p>
                    )}
                  </div>

                  {/* View button */}
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
