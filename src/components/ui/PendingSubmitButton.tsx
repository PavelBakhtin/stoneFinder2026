"use client";

import { useFormStatus } from "react-dom";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Props = {
  label: string;
  pendingLabel: string;
  className: string;
};

export function PendingSubmitButton({
  label,
  pendingLabel,
  className,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={className}
    >
      <span className="flex items-center justify-center gap-2">
        {pending && <LoadingSpinner className="h-4 w-4" />}
        <span>{pending ? pendingLabel : label}</span>
      </span>
    </button>
  );
}
