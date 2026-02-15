import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  GraduationCap,
  Heart,
  BarChart3,
  Users,
  TrendingUp,
  ChevronRight,
  Star,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  Sparkles,
  Eye,
  HandHeart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let rafId: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, end, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Fade-in wrapper component                                          */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: directionMap[direction].x,
        y: directionMap[direction].y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  end,
  suffix,
  label,
  delay,
}: {
  icon: React.ElementType;
  end: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { count, ref } = useCounter(end);

  return (
    <FadeIn delay={delay}>
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent" />
        <Icon className="mb-4 h-8 w-8 text-amber-400" />
        <p className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          <span ref={ref}>{count}</span>
          {suffix}
        </p>
        <p className="mt-2 text-sm font-medium text-blue-200/80">{label}</p>
      </div>
    </FadeIn>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ============================================================ */}
      {/*  NAVIGATION                                                   */}
      {/* ============================================================ */}
      <nav
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                scrolled
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/20 text-white backdrop-blur-sm'
              )}
            >
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  'text-sm font-bold tracking-tight transition-colors',
                  scrolled ? 'text-slate-900' : 'text-white'
                )}
              >
                RiseUp Preps
              </span>
              <span
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-[0.2em] transition-colors',
                  scrolled ? 'text-slate-500' : 'text-white/70'
                )}
              >
                Academy
              </span>
            </div>
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden items-center gap-8 md:flex">
            {['About', 'How It Works', 'Impact', 'Testimonials'].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-white/80 hover:text-white'
                  )}
                >
                  {item}
                </a>
              )
            )}
          </div>

          {/* Login button */}
          <Link
            to="/login"
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200',
              scrolled
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30'
                : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25'
            )}
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="relative flex min-h-[100vh] items-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Radial gradient */}
          <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/30 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tl from-amber-500/15 to-transparent blur-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* Floating shapes */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[15%] top-[20%] h-3 w-3 rounded-full bg-amber-400/40"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute right-[20%] top-[30%] h-2 w-2 rounded-full bg-blue-300/40"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            className="absolute left-[60%] top-[60%] h-4 w-4 rounded-full bg-white/10"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <FadeIn delay={0}>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Transparent Student Sponsorship Platform
              </div>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={0.1}>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Empowering Futures{' '}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    Through Education
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-amber-400/20 blur-lg" />
                </span>
              </h1>
            </FadeIn>

            {/* Subtext */}
            <FadeIn delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/70 md:text-xl">
                Connect sponsors with students in need. Track academic progress,
                manage finances, and see real impact -- all in one transparent
                platform built for trust.
              </p>
            </FadeIn>

            {/* CTA buttons */}
            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="#how-it-works"
                  className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/30 transition-all duration-200 hover:bg-amber-400 hover:shadow-2xl hover:shadow-amber-500/40"
                >
                  Become a Sponsor
                  <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10"
                >
                  Learn More
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </FadeIn>

            {/* Trust indicators */}
            <FadeIn delay={0.4}>
              <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-200/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400/70" />
                  <span>100% Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400/70" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400/70" />
                  <span>Verified Students</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-950 to-transparent" />
      </section>

      {/* ============================================================ */}
      {/*  IMPACT STATS SECTION                                         */}
      {/* ============================================================ */}
      <section
        id="impact"
        className="relative bg-gradient-to-b from-blue-950 to-blue-900 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={GraduationCap}
              end={250}
              suffix="+"
              label="Students Sponsored"
              delay={0}
            />
            <StatCard
              icon={Users}
              end={85}
              suffix="+"
              label="Active Sponsors"
              delay={0.1}
            />
            <StatCard
              icon={TrendingUp}
              end={94}
              suffix="%"
              label="Success Rate"
              delay={0.2}
            />
            <StatCard
              icon={Heart}
              end={50}
              suffix="K+"
              label="Invested in Education"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS SECTION                                         */}
      {/* ============================================================ */}
      <section id="how-it-works" className="relative bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                <BarChart3 className="h-4 w-4" />
                Simple Process
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Three simple steps to make a lasting difference in a student's
                life.
              </p>
            </div>
          </FadeIn>

          {/* Steps */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: HandHeart,
                title: 'Sponsor a Student',
                description:
                  'Choose a student to support. Review their profile, academic goals, and financial needs. Your sponsorship covers tuition, books, uniforms, and more.',
                color: 'from-blue-500 to-blue-600',
                iconBg: 'bg-blue-50 text-blue-600',
              },
              {
                step: '02',
                icon: Eye,
                title: 'Track Progress',
                description:
                  'Monitor your student\'s academic performance, attendance records, and financial allocations in real-time through your personalized dashboard.',
                color: 'from-amber-500 to-amber-600',
                iconBg: 'bg-amber-50 text-amber-600',
              },
              {
                step: '03',
                icon: Star,
                title: 'See the Impact',
                description:
                  'Receive updates, achievement notifications, and messages from your student. Watch them grow and succeed with your support.',
                color: 'from-green-500 to-green-600',
                iconBg: 'bg-green-50 text-green-600',
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.15}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
                  {/* Step number watermark */}
                  <span className="absolute -right-2 -top-4 text-8xl font-black text-slate-100 transition-colors group-hover:text-blue-50">
                    {item.step}
                  </span>

                  {/* Icon */}
                  <div
                    className={cn(
                      'relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl',
                      item.iconBg
                    )}
                  >
                    <item.icon className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <h3 className="relative mb-3 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="relative text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>

                  {/* Bottom gradient line */}
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100',
                      item.color
                    )}
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ABOUT SECTION                                                */}
      {/* ============================================================ */}
      <section id="about" className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text content */}
            <FadeIn direction="right">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
                  <GraduationCap className="h-4 w-4" />
                  About Us
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  About RiseUp Preps Academy
                </h2>
                <div className="mt-6 space-y-4 text-slate-600">
                  <p className="text-lg leading-relaxed">
                    RiseUp Preps Academy is a non-profit organization dedicated to
                    bridging the educational gap for underprivileged students.
                    We believe every child deserves access to quality education,
                    regardless of their financial background.
                  </p>
                  <p className="leading-relaxed">
                    Our platform connects generous sponsors with deserving
                    students, providing complete transparency in how funds are
                    utilized. From tuition fees to learning materials, every
                    contribution is tracked and reported.
                  </p>
                  <p className="leading-relaxed">
                    Through our rigorous monitoring system, sponsors can see
                    real-time academic progress, attendance records, and
                    financial reports -- building trust and accountability at
                    every step.
                  </p>
                </div>

                {/* Key highlights */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    'Full financial transparency',
                    'Real-time academic tracking',
                    'Direct student communication',
                    'Verified institutions only',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Right: Visual card */}
            <FadeIn direction="left">
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
                <div className="absolute -bottom-4 -left-4 h-48 w-48 rounded-full bg-amber-100/50 blur-3xl" />

                {/* Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl shadow-blue-900/20">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                  <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />

                  <div className="relative space-y-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                      <Heart className="h-6 w-6 text-amber-300" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold">Our Mission</h3>
                      <p className="mt-3 text-sm leading-relaxed text-blue-100/80">
                        To ensure that no student is denied education due to
                        financial constraints. We empower communities, transform
                        lives, and build a brighter future -- one scholarship at
                        a time.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                      <div>
                        <p className="text-2xl font-bold">5+</p>
                        <p className="text-xs text-blue-200/70">
                          Years of Impact
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs text-blue-200/70">
                          Funds go to Students
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS SECTION                                         */}
      {/* ============================================================ */}
      <section id="testimonials" className="relative bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                <Star className="h-4 w-4" />
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                What People Say
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Hear from our sponsors, students, and partners about the impact
                of RiseUp Preps Academy.
              </p>
            </div>
          </FadeIn>

          {/* Testimonial cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  'RiseUp Preps gave me the transparency I needed as a sponsor. I can see exactly where my money goes and how my student is progressing. It is incredibly rewarding.',
                name: 'Sarah Johnson',
                role: 'Sponsor',
                initials: 'SJ',
                bg: 'bg-blue-100 text-blue-700',
              },
              {
                quote:
                  'Thanks to my sponsor, I was able to focus on my studies without worrying about fees. The platform makes it easy to share my progress and stay connected.',
                name: 'Ahmed Musa',
                role: 'Student',
                initials: 'AM',
                bg: 'bg-amber-100 text-amber-700',
              },
              {
                quote:
                  'As a teacher, I love how the platform lets me record marks and attendance digitally. It keeps everyone -- sponsors, students, and admin -- in the loop.',
                name: 'Grace Okafor',
                role: 'Teacher',
                initials: 'GO',
                bg: 'bg-green-100 text-green-700',
              },
            ].map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.15}>
                <div className="group relative h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
                  {/* Stars */}
                  <div className="mb-6 flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-slate-600">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                        testimonial.bg
                      )}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA SECTION                                                  */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-24">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to Change a Life?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100/70">
              Join our community of sponsors and educators. Together, we can
              ensure every student has the opportunity to succeed.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/30 transition-all duration-200 hover:bg-amber-400 hover:shadow-2xl hover:shadow-amber-500/40"
              >
                Get Started Today
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="mailto:info@riseuppreps.org"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10"
              >
                <Mail className="h-5 w-5" />
                Contact Us
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    RiseUp Preps
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Academy
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Empowering underprivileged students through transparent
                sponsorship and education tracking.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2.5">
                {['About Us', 'How It Works', 'Impact', 'Testimonials'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                        className="text-sm text-slate-500 transition-colors hover:text-blue-600"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Platform
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: 'Sponsor Login', href: '/login' },
                  { label: 'Teacher Portal', href: '/login' },
                  { label: 'Student Access', href: '/login' },
                  { label: 'Admin Panel', href: '/login' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-blue-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-slate-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>123 Education Lane, Knowledge City</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <a
                    href="mailto:info@riseuppreps.org"
                    className="transition-colors hover:text-blue-600"
                  >
                    info@riseuppreps.org
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                  <a
                    href="#"
                    className="transition-colors hover:text-blue-600"
                  >
                    www.riseuppreps.org
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} RiseUp Preps Academy. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
