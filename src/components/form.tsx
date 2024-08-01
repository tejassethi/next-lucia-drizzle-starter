"use client";

import { useFormState } from "react-dom";
import { toast } from "sonner";

export function Form({
  children,
  classname,
  action,
}: {
  children: React.ReactNode;
  classname?: string;
  action: (prevState: any, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction] = useFormState(action, {
    error: null,
  });
  if (state.error) {
    toast.error(state.error);
  }
  if (state.success) {
    toast.success(state.success);
  }

  return (
    <form action={formAction} className={classname}>
      {children}
    </form>
  );
}

export interface ActionResult {
  error?: string | null;
  success?: string | null;
}
