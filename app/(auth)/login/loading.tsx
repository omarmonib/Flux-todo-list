export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4 animate-pulse space-y-4">
        <div className="h-8 w-16 bg-secondary rounded mx-auto" />
        <div className="h-4 w-40 bg-secondary rounded mx-auto" />
        <div className="bg-secondary rounded-lg h-64" />
      </div>
    </div>
  );
}
