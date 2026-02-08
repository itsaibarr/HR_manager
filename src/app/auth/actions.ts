"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient(); // Await the asynchronous client creation

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase =await createClient(); // Await the asynchronous client creation

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // After signup, we might want to redirect to a verification page or dashboard
  // For MVP, if email confirmation is disabled, they are logged in.
  // If enabled, they need to verify. Assuming auto-confirm for now or user checks email.
  
  return { success: true, message: "Check your email to confirm your account." };
}
