"use client";

import { useFormState } from "react-dom";
import { toast } from "sonner";

export function Form({
  children,
  action,
}: {
  children: React.ReactNode;
  action: (prevState: any, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction] = useFormState(action, {
    error: null,
  });

  // Show toast if there's an error
  if (state.error) {
    toast.error(state.error);
  }

  return <form action={formAction}>{children}</form>;
}

export interface ActionResult {
  error: string | null;
}
