"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

// Turnstile types are in types/turnstile.d.ts

export default function ChallengePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVerify = async (token: string) => {
    setStatus("verifying");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        // Small delay to show success state
        setTimeout(() => {
          router.replace("/");
        }, 800);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Verification failed. Please try again.");
        // Reset widget
        if (widgetRef.current && window.turnstile) {
          window.turnstile.reset(widgetRef.current);
        }
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  useEffect(() => {
    // Check if already verified
    const checkVerification = async () => {
      try {
        const res = await fetch("/api/turnstile/status");
        const data = await res.json();
        if (data.verified) {
          router.replace("/");
          return;
        }
      } catch {
        // Continue to show challenge
      }
      setStatus("ready");
    };

    checkVerification();
  }, [router]);

  useEffect(() => {
    if (status !== "ready") return;

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;

    const verifyCallback = handleVerify;

    script.onload = () => {
      if (window.turnstile && containerRef.current) {
        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: verifyCallback,
          "error-callback": () => {
            setStatus("error");
            setErrorMessage("Verification failed. Please try again.");
          },
          "expired-callback": () => {
            setStatus("ready");
            setErrorMessage("Verification expired. Please try again.");
          },
          theme: "dark",
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
      }
      script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-8 text-center">
          {/* Logo/Shield Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 p-4">
              <Shield className="h-12 w-12 text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Security Check
          </h1>
          <p className="text-white/60 mb-8">
            Please verify you&apos;re human to continue
          </p>

          {/* Status Messages */}
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 text-white/60">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking status...</span>
            </div>
          )}

          {status === "verifying" && (
            <div className="flex items-center justify-center gap-3 text-blue-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center justify-center gap-3 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Verified! Redirecting...</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Turnstile Widget Container */}
          {(status === "ready" || status === "error") && (
            <div className="flex justify-center">
              <div ref={containerRef} />
            </div>
          )}

          {/* Footer */}
          <p className="mt-8 text-xs text-white/40">
            Protected by Cloudflare Turnstile
          </p>
        </div>
      </div>
    </div>
  );
}
