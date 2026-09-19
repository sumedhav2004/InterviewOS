import { CalendarDays, CheckCircle2, Code2, Contact2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type DashboardStatsProps = {
  upcoming: number;
  completed: number;
  invites: number;
};

const stats = [
  {
    key: "upcoming",
    label: "Upcoming",
    description: "Scheduled interviews",
    icon: CalendarDays,
  },
  {
    key: "completed",
    label: "Completed",
    description: "Finished interviews",
    icon: CheckCircle2,
  },
  {
    key: "invites",
    label: "Invites",
    description: "Invitations received",
    icon: Contact2,
  },
] as const;

export function DashboardStats({
  upcoming,
  completed,
  invites,
}: DashboardStatsProps) {
  const values = {
    upcoming,
    completed,
    invites,
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.key}
            className="group transition-colors hover:border-primary/40"
          >
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {stat.label}
                </p>

                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {String(values[stat.key]).padStart(2, "0")}
                </p>

                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>

              <div className="rounded-md border border-border/60 bg-muted/40 p-2.5 text-primary transition-colors group-hover:border-primary/30">
                <Icon className="size-4" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}