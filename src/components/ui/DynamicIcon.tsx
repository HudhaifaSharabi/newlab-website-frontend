import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Fallback icon while loading, or if icon is not found
const Fallback = () => (
  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full" />
);

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // Convert any format (e.g. PascalCase or camelCase) to kebab-case
  // and ensure it's a valid key in dynamicIconImports
  const formattedName = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

  const isIconValid = formattedName in dynamicIconImports;

  if (!isIconValid) {
    console.warn(`Icon "${name}" (resolved to "${formattedName}") is not a valid lucide-react icon.`);
    return <Fallback />;
  }

  const LucideIcon = dynamic(dynamicIconImports[formattedName as keyof typeof dynamicIconImports], {
    loading: () => <Fallback />,
  });

  return <LucideIcon {...props} />;
};

export default DynamicIcon;
