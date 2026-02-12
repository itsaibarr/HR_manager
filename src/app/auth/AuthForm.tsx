"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const supabase = createClient();

    startTransition(async () => {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message || "Failed to sign in");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) {
          setError(error.message || "Failed to sign up");
        } else {
          setSuccess("Check your email for a confirmation link.");
        }
      }
    });
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    const origin = window.location.origin;

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: origin + "/auth/callback",
        },
      });
      if (error) {
        setError(error.message || "Failed to sign in with Google");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-sora text-primary tracking-tighter uppercase">
          {isLogin ? "Sign In" : "Sign Up"}
        </h1>
        <p className="text-primary/40 text-base font-bold uppercase tracking-tight">
          {isLogin
            ? "Enter your credentials to access your account."
            : "Create an account to start screening candidates."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {!isLogin && (
          <div className="space-y-1">
              <label className="text-[10px] font-black tracking-widest text-primary/40 uppercase">
                Full Name
              </label>
              <Input
                name="name"
                placeholder="Name Surname"
                required
                className="h-13 rounded-sm border-2 border-primary/10 focus:border-brand transition-all uppercase font-bold px-5"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-primary/40 uppercase">
              Email
            </label>
            <Input
              name="email"
              placeholder="name@company.com"
              type="email"
              required
              className="h-13 rounded-sm border-2 border-primary/10 focus:border-brand transition-all uppercase font-bold px-5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-primary/40 uppercase">
              Password
            </label>
            <div className="relative group">
              <Input
                name="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                className="h-13 rounded-sm border-2 border-primary/10 focus:border-brand transition-all uppercase font-bold px-5 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/20 hover:text-brand transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2.4} />
                ) : (
                  <Eye size={18} strokeWidth={2.4} />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-reject/5 border border-reject/20 rounded-sm">
            <p className="text-[10px] font-black uppercase text-reject tracking-widest">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-brand/5 border border-brand/20 rounded-sm">
            <p className="text-[10px] font-black uppercase text-brand tracking-widest">{success}</p>
          </div>
        )}

        <Button
          className="w-full mt-5 h-[52px] text-sm font-black rounded-sm bg-primary hover:bg-brand text-white border-none transition-all duration-300 uppercase tracking-widest"
          size="lg"
          disabled={isPending}
        >
          {isPending
            ? "Processing..."
            : isLogin
            ? "Sign In"
            : "Sign Up"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-primary/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
          <span className="bg-paper px-4 text-primary/20">OR</span>
        </div>
      </div>

       <Button
         variant="outline"
         className="w-full h-[52px] text-xs font-black uppercase tracking-[0.2em] rounded-sm border-2 border-primary/10 hover:border-brand hover:text-brand transition-all"
         type="button"
         onClick={handleGoogleLogin}
       >
            <svg
              className="mr-3 h-[14px] w-[14px]"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google OAuth
        </Button>

      <p className="text-center">
        <span className="text-[10px] font-black uppercase text-primary/30 tracking-widest">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccess(null);
          }}
          className="text-[10px] font-black uppercase text-brand tracking-widest hover:underline ml-1"
        >
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </p>
    </div>
  );
}
