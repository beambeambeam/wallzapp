import { cn } from "@wallzapp/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-1 text-xs font-medium text-white",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        easy: "bg-green-500",
        hard: "bg-red-500",
        medium: "bg-yellow-500",
        secondary: "bg-secondary text-secondary-foreground",
      },
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ className, variant }))} data-slot="badge" {...props} />
  );
}

export { Badge, badgeVariants };
