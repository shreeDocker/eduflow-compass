import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/metro")({
  component: () => <Navigate to="/progress" replace />,
});
