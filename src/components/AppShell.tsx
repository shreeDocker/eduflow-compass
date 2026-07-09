import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-5 pb-28 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
