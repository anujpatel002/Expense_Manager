import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-ai text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover-lift relative overflow-hidden group text-center whitespace-nowrap leading-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-primary text-white shadow-ai hover:shadow-ai-hover',
        destructive: 'bg-error text-white hover:bg-error/90 shadow-ai hover:shadow-ai-hover',
        outline: 'border-2 border-border bg-transparent text-text hover:bg-surface hover:border-primary',
        secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-ai hover:shadow-ai-hover',
        ghost: 'bg-transparent text-text hover:bg-surface hover:text-primary',
        link: 'text-primary underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 rounded-lg text-xs',
        lg: 'h-14 px-8 rounded-ai-lg text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = ({ className, variant, size, children, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), 'gap-2')}
      {...props}
    >
      <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export { Button, buttonVariants };