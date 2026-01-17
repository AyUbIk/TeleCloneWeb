import { getAvatarColor, cn } from "@/lib/utils";
import { User } from "@shared/schema";

interface AvatarProps {
  user?: User | { name: string; id: string; avatar?: string | null };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}

export function Avatar({ user, size = "md", className, online }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const gradient = getAvatarColor(user?.id || "default");

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white shadow-sm overflow-hidden select-none",
          sizes[size],
          !user?.avatar ? `bg-gradient-to-br ${gradient}` : ""
        )}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[hsl(var(--tg-online))] border-2 border-[hsl(var(--tg-sidebar-bg))] rounded-full" />
      )}
    </div>
  );
}
