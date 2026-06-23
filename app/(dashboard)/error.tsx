'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <p className="text-5xl">💥</p>
      <h2 className="text-xl font-bold text-foreground">Failed to load tasks</h2>
      <p className="text-muted-foreground text-sm text-center max-w-sm">
        There was a problem loading your tasks. This might be a temporary issue.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono bg-secondary px-3 py-1 rounded">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
