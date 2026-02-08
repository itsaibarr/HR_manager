"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signup } from "./actions";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (isLogin) {
        const res = await login(formData);
        if (res?.error) setError(res.error);
      } else {
        const res = await signup(formData);
        if (res?.error) setError(res.error);
        else if (res?.success) setSuccess(res.message);
      }
    });
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-sora text-navy">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-muted">
          {isLogin
            ? "Enter your email to access your workspace."
            : "Get started with your free account."}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-black-soft">
              Full Name
            </label>
            <Input name="name" placeholder="John Doe" required />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-black-soft">Email</label>
          <Input name="email" placeholder="name@company.com" type="email" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-black-soft">
            Password
          </label>
          <Input name="password" placeholder="••••••••" type="password" required />
        </div>

        {error && <p className="text-sm text-reject">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button
          className="w-full mt-2"
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
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-paper px-2 text-muted">Or continue with</span>
        </div>
      </div>

       <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Google
        </Button>

      <p className="text-center text-sm text-muted">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccess(null);
          }}
          className="font-semibold text-navy hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
