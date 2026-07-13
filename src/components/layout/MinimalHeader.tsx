import { useNavigate, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppLogoMark } from "@/components/AppLogo";
import { useRole } from "@/lib/role-context";
import { HEADER_SAFE } from "@/components/layout/shell-layout";
import { cn } from "@/lib/utils";

type MinimalHeaderProps = {
  title: string;
  showBack?: boolean;
  /** Prefer a known parent route over browser history */
  backTo?: string;
  backSearch?: Record<string, unknown>;
  className?: string;
};

export function MinimalHeader({ title, showBack, backTo, backSearch, className }: MinimalHeaderProps) {
  const router = useRouter();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const homeTo = isAdmin ? "/principal" : "/today";

  function handleBack() {
    if (backTo) {
      navigate({ to: backTo, search: backSearch });
      return;
    }
    router.history.back();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--min-border)] bg-[var(--min-bg)]/88 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--min-bg)]/72 sm:px-4",
        HEADER_SAFE,
        className,
      )}
    >
      {showBack ? (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-theme-accent transition-colors active:bg-[var(--min-surface-hover)]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
      ) : (
        <Link
          to={homeTo}
          aria-label="Swotify Plus home"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--min-surface)] ring-1 ring-[var(--min-border)] transition-colors active:bg-[var(--min-surface-hover)]"
        >
          <AppLogoMark size="sm" glow />
        </Link>
      )}
      <div className="min-w-0 flex-1 px-1">
        <h1 className="truncate text-center text-[16px] font-semibold tracking-tight text-theme sm:text-[17px]">
          {title}
        </h1>
      </div>
      <div className="w-11 shrink-0" />
    </header>
  );
}
