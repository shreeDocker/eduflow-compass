import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/classes")({
  component: () => (
    <Navigate to="/books" search={{ view: "catalog", layout: "overview" }} replace />
  ),
});
