import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Swotify Plus" }],
  }),
  component: HomeRedirect,
});

function HomeRedirect() {
  const { isAdmin } = useRole();
  return <Navigate to={isAdmin ? "/principal" : "/today"} replace />;
}
