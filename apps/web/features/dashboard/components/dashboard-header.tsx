type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
        Dashboard
      </p>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Welcome back, {name}
      </h1>

      <p className="max-w-2xl text-muted-foreground">
        Here's what's happening with your interviews.
      </p>
    </header>
  );
}