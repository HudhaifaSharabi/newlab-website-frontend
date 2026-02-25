export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const usePrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return prefersReducedMotion();
};
