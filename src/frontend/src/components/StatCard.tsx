import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  sub?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  color = "text-primary",
  sub,
  loading,
}: Props) {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          <div
            className={`rounded-xl p-2.5 bg-primary/10 ${color} shrink-0 ml-3`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
