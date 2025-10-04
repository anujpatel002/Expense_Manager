import { cn } from '../../lib/utils';

const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'ai-card hover-lift animate-fade-in',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 p-6 border-b border-border/50', className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3
    className={cn(
      'text-xl font-bold text-text flex items-center',
      className
    )}
    {...props}
  />
);

const CardDescription = ({ className, ...props }) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };