"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Github, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<"github" | "google" | "email" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showResetSignUpPrompt, setShowResetSignUpPrompt] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );

    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(null),
          "error-callback": () => setCaptchaToken(null),
          theme: "dark",
          size: "invisible",
        });
      }
    };

    if (existingScript) {
      initTurnstile();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.head.appendChild(script);
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setIsLoading(provider);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(null);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading("email");
    setError(null);
    setShowSignUpPrompt(false);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: captchaToken ?? undefined,
        },
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password");
          setShowSignUpPrompt(true);
        } else if (error.message.includes("captcha")) {
          setError("Verification failed. Please refresh and try again.");
        } else {
          setError(error.message);
        }
        // Reset captcha on error
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setCaptchaToken(null);
        }
        setIsLoading(null);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(null);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetError("Email is required");
      return;
    }

    setIsLoading("reset");
    setResetError(null);
    setShowResetSignUpPrompt(false);

    try {
      const supabase = createSupabaseBrowserClient();
      
      // First check if user exists by attempting to get user by email
      // We use signInWithOtp with shouldCreateUser: false to check existence
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        captchaToken: captchaToken ?? undefined,
      });

      if (error) {
        if (error.message.includes("captcha")) {
          setResetError("Verification failed. Please refresh and try again.");
        } else {
          setResetError(error.message);
        }
        // Reset captcha on error
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setCaptchaToken(null);
        }
        setIsLoading(null);
      } else {
        setResetSuccess(true);
        setIsLoading(null);
      }
    } catch {
      setResetError("An unexpected error occurred");
      setIsLoading(null);
    }
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSuccess(false);
    setResetError(null);
    setShowResetSignUpPrompt(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {/* Invisible Turnstile CAPTCHA */}
      <div ref={turnstileRef} />
      
      <div className="w-full max-w-sm space-y-6">
        {showForgotPassword ? (
          // Forgot Password View
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Reset Your Password</h1>
              <p className="mt-2 text-sm text-white/60">
                Enter your email and we&apos;ll send you a link to reset your password
              </p>
            </div>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="rounded-md border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1 text-green-400/80">
                    We&apos;ve sent a password reset link to <span className="font-medium">{resetEmail}</span>
                  </p>
                </div>
                <button
                  onClick={handleBackToSignIn}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {resetError}
                    {showResetSignUpPrompt && (
                      <p className="mt-2">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="font-medium text-white underline">
                          Sign up here
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="block text-sm font-medium">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading !== null}
                    className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading === "reset" ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <button
                  onClick={handleBackToSignIn}
                  className="flex w-full items-center justify-center gap-2 text-sm text-white/60 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              </>
            )}
          </>
        ) : (
          // Sign In View
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Sign in to TMDB Watchlist</h1>
              <p className="mt-2 text-sm text-white/60">
                Track your favorite movies and build your watchlist
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
                {showSignUpPrompt && (
                  <p className="mt-2">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="font-medium text-white underline">
                      Sign up here
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-white/60 transition hover:text-white hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading !== null}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading === "email" ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-950 px-4 text-white/40">or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading !== null}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Github className="h-5 w-5" />
                {isLoading === "github" ? "Signing in..." : "GitHub"}
              </button>

              <button
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading !== null}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GoogleIcon />
                {isLoading === "google" ? "Signing in..." : "Google"}
              </button>
            </div>

            <div className="text-center text-sm text-white/60">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-white hover:underline">
                Sign up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
