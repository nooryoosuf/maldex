import { cn } from "@/lib/cn";

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-shell px-4 sm:px-5 lg:px-6", className)}>{children}</div>;
}
