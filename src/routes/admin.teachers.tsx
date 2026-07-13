import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/teachers")({
  component: AdminTeachersLayout,
});

function AdminTeachersLayout() {
  return <Outlet />;
}
