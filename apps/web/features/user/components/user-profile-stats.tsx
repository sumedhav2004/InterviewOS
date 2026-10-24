import { Users, Brain, CalendarPlus, CalendarCheck } from "lucide-react";

type UserProfileStatsProps = {
  friendsCount: number;
  questionsCount: number;
  interviewsCreatedCount: number;
  interviewsParticipatedCount: number;
};

const UserProfileStats = ({
  friendsCount,
  questionsCount,
  interviewsCreatedCount,
  interviewsParticipatedCount,
}: UserProfileStatsProps) => {
  const stats = [
    {
      label: "Friends",
      value: friendsCount,
      icon: Users,
    },
    {
      label: "Questions created",
      value: questionsCount,
      icon: Brain,
    },
    {
      label: "Interviews created",
      value: interviewsCreatedCount,
      icon: CalendarPlus,
    },
    {
      label: "Interviews participated",
      value: interviewsParticipatedCount,
      icon: CalendarCheck,
    },
  ];

  return (
    <section
      aria-label="User profile statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {stat.value.toLocaleString()}
            </p>
          </div>
        );
      })}
    </section>
  );
};

export default UserProfileStats;
