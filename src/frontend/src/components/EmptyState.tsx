import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-ocid="empty_state"
    >
      <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{message}</p>
      {action}
    </div>
  );
}
