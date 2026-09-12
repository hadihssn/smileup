"use client";

import { useActionState } from "react";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            S
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500">SmileUp clinic dashboard — staff only.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@clinic.com"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-[inherit] text-sm text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-[inherit] text-sm text-slate-900"
            />
          </div>

          {state?.error && <p className="text-[13px] font-medium text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
