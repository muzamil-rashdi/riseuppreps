import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Mail,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await authApi.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setServerError(
        err.response?.data?.error ||
          'Something went wrong. Please try again later.'
      );
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ============================================================ */}
      {/*  LEFT SIDE - Branding                                         */}
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

        {/* Center: Security message */}
        <div className="relative">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <KeyRound className="h-8 w-8 text-amber-300" />
          </div>
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Account recovery
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              made simple
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-200/70">
            Forgot your password? No worries. Enter your registered email
            address and we will send you instructions to reset your password
            securely.
          </p>

          {/* Security notes */}
          <div className="mt-8 space-y-3">
            {[
              'Reset links expire after 1 hour',
              'Your data remains secure throughout the process',
              'Contact support if you need additional help',
            ].map((note) => (
              <div
                key={note}
                className="flex items-center gap-3 text-sm text-blue-100/60"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400/70" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="relative" />
      </div>

      {/* ============================================================ */}
      {/*  RIGHT SIDE - Forgot Password Form                            */}
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

          {/* Success state */}
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                We have sent password reset instructions to{' '}
                <span className="font-medium text-foreground">
                  {submittedEmail}
                </span>
                . Please check your inbox and follow the link to reset your
                password.
              </p>

              <div className="mt-8 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Did not receive the email? Check your spam folder or try again.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false);
                      setSubmittedEmail('');
                    }}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Try again
                  </Button>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Back to login */}
              <Link
                to="/login"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Forgot your password?
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter the email address associated with your account and we
                  will send you a link to reset your password.
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              {/* Form */}
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
                      autoFocus
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
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
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Help note */}
              <div className="mt-8 flex items-start gap-2 rounded-lg bg-muted/50 p-4">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  If you do not have access to your registered email, please
                  contact your administrator for assistance with account
                  recovery.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
