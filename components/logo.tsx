import { FileText } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  withIcon?: boolean;
}

export function Logo({ size = 'md', withText = true, withIcon = false }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center gap-2">
      {withIcon && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-md blur-[2px] opacity-70" />
          <div className="relative bg-background dark:bg-background/90 rounded-md p-1.5 border">
            <FileText className={`${sizeClasses[size]} text-primary`} />
          </div>
        </div>
      )}
      {withText && (
        <div className="font-semibold tracking-tight leading-none">
          <span className={`${textSizeClasses[size]} gradient-underline`}>Branch</span>
          <span className={`${textSizeClasses[size]} ml-1`}>CMS</span>
        </div>
      )}
    </div>
  );
}
