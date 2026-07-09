import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/AppShell";
import { currentTeacher } from "@/lib/mock-data";
import { LayoutDashboard, Languages, Moon, LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ClassPulse" },
      { name: "description", content: "Your profile, language and school settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <MobileShell>
      <header className="flex items-center gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-2xl font-black"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {currentTeacher.name.split(" ").slice(-1)[0][0]}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black">{currentTeacher.name}</h1>
          <p className="truncate text-sm" style={{ color: "var(--muted-foreground)" }}>
            {currentTeacher.school}
          </p>
        </div>
      </header>

      <ul className="mt-8 space-y-3">
        <SettingRow icon={<LayoutDashboard className="h-5 w-5" />} label="Principal dashboard" to="/principal" />
        <SettingRow icon={<Languages className="h-5 w-5" />} label="Language" hint="English / தமிழ்" />
        <SettingRow icon={<Moon className="h-5 w-5" />} label="Dark mode" hint="Always on" />
        <SettingRow icon={<LogOut className="h-5 w-5" />} label="Sign out" />
      </ul>
    </MobileShell>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  to?: "/principal";
}) {
  const inner = (
    <div className="card-elevated grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4">
      <span
        className="grid h-10 w-10 place-items-center rounded-xl"
        style={{ backgroundColor: "var(--surface-2)", color: "var(--primary)" }}
      >
        {icon}
      </span>
      <span className="truncate font-semibold">{label}</span>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {hint ?? ""}
      </span>
    </div>
  );
  return <li>{to ? <Link to={to}>{inner}</Link> : inner}</li>;
}
