import type { CurrentUserSummary } from "@/lib/current-session";

type HeaderUserBadgeProps = {
  user: CurrentUserSummary;
  variant?: "marketing" | "app";
};

const variantClasses = {
  marketing: "text-bleu-fonce",
  app: "text-encre-2",
} as const;

export function HeaderUserBadge({
  user,
  variant = "marketing",
}: HeaderUserBadgeProps) {
  return (
    <span
      aria-label={`Utilisateur connecté : ${user.displayName}`}
      className={`inline-flex min-w-0 items-center gap-2 ${variantClasses[variant]}`}
      title={user.email}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jaune text-[12px] font-extrabold text-bleu-fonce shadow-[0_8px_18px_rgba(252,229,0,0.24)]"
      >
        {user.initials}
      </span>
      <span className="max-w-[11rem] truncate text-sm font-bold">
        {user.displayName}
      </span>
    </span>
  );
}
