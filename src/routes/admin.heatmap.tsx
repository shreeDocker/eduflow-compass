import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/heatmap")({
  component: () => <Navigate to="/books" search={{ view: "catalog", layout: "overview" }} replace />,
});
