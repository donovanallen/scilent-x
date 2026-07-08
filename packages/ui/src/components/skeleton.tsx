import { cn } from '../utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-primary/10 motion-safe:skeleton-shimmer motion-reduce:animate-pulse',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
