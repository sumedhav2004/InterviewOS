import { cn } from "@/lib/utils";

type StackProps = React.ComponentProps<"div"> & {
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
};

const gapClasses = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export function Stack({
  gap = "md",
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gapClasses[gap],
        className
      )}
      {...props}
    />
  );
}