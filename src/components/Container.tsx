import React from 'react';
import clsx from 'clsx';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(({className, ...props}, ref) => (
  <div
    ref={ref}
    className={clsx('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}
    {...props}
  />
));

Container.displayName = 'Container';
