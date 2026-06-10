import { useState, useEffect, type ReactNode } from 'react';

function getPath(): string {
  return window.location.hash.replace('#', '') || '/';
}

function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const cleanPath = path.split('?')[0].replace(/\/+$/, '');
  const cleanPattern = pattern.replace(/\/+$/, '');

  const patternParts = cleanPattern.split('/');
  const pathParts = cleanPath.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo(0, 0);
}

export function Route({
  pattern,
  component
}: {
  pattern: string;
  component: (params: Record<string, string>) => ReactNode;
}) {
  const [currentPath, setCurrentPath] = useState(() => getPath());

  useEffect(() => {
    const handler = () => setCurrentPath(getPath());

    window.addEventListener('hashchange', handler);
    handler();

    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const params = matchRoute(pattern, currentPath);

  if (!params) return null;

  return <>{component(params)}</>;
}

export function Link({
  to,
  children,
  className,
  onClick
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}