import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";

type AppSidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function AppSidebar({ mobileOpen, onMobileOpenChange }: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar — fixed */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-w)] lg:block"
        style={{ background: "var(--sw-gradient-dark)" }}
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile / tablet drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-[min(280px,85vw)] border-none p-0 [&>button]:text-white/70 [&>button]:hover:text-white"
          style={{ background: "var(--sw-gradient-dark)" }}
        >
          <SidebarContent onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
