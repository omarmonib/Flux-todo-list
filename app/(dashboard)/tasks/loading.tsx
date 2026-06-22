export default function TasksLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-32 bg-secondary rounded" />
        <div className="h-4 w-48 bg-secondary rounded mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-secondary rounded-lg p-3 h-16" />
        ))}
      </div>

      {/* Progress bar skeleton */}
      <div className="h-2 bg-secondary rounded-full mb-8" />

      {/* Search skeleton */}
      <div className="h-9 w-64 bg-secondary rounded" />

      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-secondary rounded-full" />
        ))}
      </div>

      {/* Task cards skeleton */}
      <div className="grid gap-3 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-secondary rounded-lg h-20" />
        ))}
      </div>
    </div>
  );
}
