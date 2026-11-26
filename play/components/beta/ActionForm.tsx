"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/beta/actions";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

/** Small wrapper so server actions can report a friendly message inline. */
export function ActionForm({
  action,
  children,
  className = "form",
  inline = false,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  inline?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className} style={inline ? { display: "inline" } : undefined}>
      {children}
      {state?.message ? (
        <p className={`small ${state.ok ? "" : "beta-error"}`} role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function SubmitButton({
  children,
  className = "btn primary",
  name,
  value,
}: {
  children: ReactNode;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" name={name} value={value} disabled={pending} aria-busy={pending}>
      {children}
    </button>
  );
}
