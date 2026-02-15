import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Shield,
  Heart,
} from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRoutes: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  SPONSOR: '/sponsor',
  STUDENT: '/student',
};

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await authApi.login(data.email, data.password);
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      const redirectTo = roleRoutes[user.role] || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setServerError(
        err.response?.data?.error || 'Invalid email or password. Please try again.'
      );
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ============================================================ */}
      {/*  LEFT SIDE - Branding & Illustration                          */}
      {/* ============================================================ */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-12 lg:flex">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-amber-500/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Top: Logo */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">
                RiseUp Preps
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Academy
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Feature highlights */}
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Empowering students.
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Transforming futures.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-200/70">
            A transparent sponsorship platform that connects generous sponsors
            with deserving students. Track progress, manage finances, and see
            real impact.
          </p>

          {/* Feature cards */}
          <div className="mt-10 space-y-4">
            {[
              {
                icon: BarChart3,
                title: 'Real-time Progress Tracking',
                desc: 'Monitor academic performance and attendance live.',
              },
              {
                icon: Shield,
                title: 'Complete Transparency',
                desc: 'Every dollar is tracked and accounted for.',
              },
              {
                icon: Heart,
                title: 'Direct Student Connection',
                desc: 'Communicate directly with sponsored students.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-200/60">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative">
          <blockquote className="border-l-2 border-amber-400/50 pl-4">
            <p className="text-sm italic text-blue-100/60">
              "RiseUp Preps gave me the tools and support I needed to complete my
              education. I am forever grateful to my sponsor."
            </p>
            <footer className="mt-2 text-xs text-blue-200/40">
              -- Ahmed M., Student
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  RIGHT SIDE - Login Form                                      */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">
                  RiseUp Preps
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Academy
                </span>
              </div>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-8 flex items-start gap-2 rounded-lg bg-muted/50 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              New to RiseUp Preps? Registration is by invitation only. Contact
              your administrator or sponsor to receive an invitation link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
