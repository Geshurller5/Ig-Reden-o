import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = 'Progress';

export { Progress };