import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/track")({
  component: () => <Navigate to="/books" replace />,
});
