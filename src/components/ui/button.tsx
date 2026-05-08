import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-emerald-400 text-zinc-950 hover:bg-emerald-300",
        secondary: "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-850",
        ghost: "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50",
        danger: "bg-rose-500 text-white hover:bg-rose-400"
      },
      size: {
        sm: "min-h-8 px-3 text-xs",
        md: "min-h-10 px-4",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
