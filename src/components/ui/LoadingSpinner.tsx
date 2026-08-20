type Props = {
  className?: string;
};

export function LoadingSpinner({ className = "h-4 w-4" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}
