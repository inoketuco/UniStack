"use client";

import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthMode = "login" | "register" | "forgot" | "reset";

function safeMessage(error: unknown) {
  if (error instanceof Error && /invalid login credentials/i.test(error.message)) return "Email or password is incorrect.";
  if (error instanceof Error && /already registered/i.test(error.message)) return "That email is already registered. Try signing in.";
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function AuthScreen({ client, mode: initialMode = "login", onResetComplete, initialMessage = "" }: { client: SupabaseClient; mode?: AuthMode; onResetComplete?: () => void; initialMessage?: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);
  const redirectUrl = typeof window === "undefined" ? "" : `${window.location.origin}/`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      if (mode === "register") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (password !== confirm) throw new Error("Passwords do not match.");
        const { error } = await client.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: redirectUrl } });
        if (error) throw error;
        setMode("login");
        setMessage("Account created. Check your email to verify your address.");
      } else if (mode === "forgot") {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
        if (error) throw error;
        setMessage("Password reset instructions are on their way.");
      } else if (mode === "reset") {
        if (password.length < 8 || password !== confirm) throw new Error("Use a matching password with at least 8 characters.");
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        const { error: signOutError } = await client.auth.signOut();
        if (signOutError) throw signOutError;
        window.history.replaceState({}, "", window.location.pathname);
        onResetComplete?.();
        setMode("login");
        setMessage("Password updated. You can sign in now.");
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(safeMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "register" ? "Build your calmer semester." : mode === "forgot" ? "Recover your account." : mode === "reset" ? "Choose a new password." : "Welcome back to UniStack.";
  return <main className="auth-shell"><section className="auth-brand"><div className="brand"><span>U</span><strong>UniStack</strong></div><p>One clear place for your classes, deadlines, and study time.</p></section><section className="auth-panel"><p className="eyebrow">{mode === "register" ? "CREATE ACCOUNT" : "YOUR STUDY SPACE"}</p><h1>{title}</h1><p className="auth-intro">{mode === "register" ? "Start with a private account that follows you across devices." : "Your schedule is private to your account."}</p><form onSubmit={submit}>{mode === "register" && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>}{mode !== "reset" && <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>}{mode !== "forgot" && <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />{(mode === "register" || mode === "reset") && <small>At least 8 characters.</small>}</label>}{(mode === "register" || mode === "reset") && <label>Confirm password<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} required /></label>}{message && <p className="auth-message" role="status">{message}</p>}<button className="primary auth-submit" disabled={busy}>{busy ? "Working…" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset email" : mode === "reset" ? "Update password" : "Sign in"}</button></form><div className="auth-links">{mode === "login" && <><button onClick={() => setMode("register")}>Create account</button><button onClick={() => setMode("forgot")}>Forgot password?</button></>}{mode === "register" && <button onClick={() => setMode("login")}>Already have an account? Sign in</button>}{mode === "forgot" && <button onClick={() => setMode("login")}>Back to sign in</button>}{mode === "reset" && <button onClick={() => setMode("login")}>Back to sign in</button>}</div></section></main>;
}
