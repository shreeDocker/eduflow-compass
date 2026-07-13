import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppBottomNav } from "./layout/AppBottomNav";
import { MinimalHeader } from "./layout/MinimalHeader";

export type AppShellProps = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  backSearch?: Record<string, unknown>;
  hideNav?: boolean;
  wide?: boolean;
};

export function AppShell({
  children,
  title = "Swotify",
  showBack,
  backTo,
  backSearch,
  hideNav,
  wide,
}: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[var(--min-bg)] text-theme">
      <MinimalHeader title={title} showBack={showBack} backTo={backTo} backSearch={backSearch} />
      <main
        className={cn(
          "mx-auto w-full px-4 py-5 sm:px-5",
          wide ? "max-w-4xl" : "max-w-lg",
          !hideNav && "pb-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px))]",
        )}
      >
        {children}
      </main>
      {!hideNav && <AppBottomNav />}
    </div>
  );
}

/** @deprecated Use AppShell */
export function MobileShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
