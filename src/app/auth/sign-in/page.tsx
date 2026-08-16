"use client";

import { useActionState } from "react";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-section px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
            S
          </div>
          <h1 className="font-heading text-xl font-bold text-ink">Admin sign in</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            SmileUp clinic dashboard — staff only.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@clinic.com"
              className="w-full rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
            />
          </div>

          {state?.error && (
            <p className="text-[13.5px] font-medium text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 rounded-xl bg-brand px-5 py-4 text-[15.5px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
