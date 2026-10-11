import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { metadata } from "@/lib/format";
import { ExplorePage } from "@/components/goup/explore";
export const Route = createFileRoute("/eventos/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () =>
    metadata(
      "Explore eventos",
      "Encontre eventos por cidade, categoria, data e preço em Blumenau e região.",
    ),
  component: EventsPage,
});
function EventsPage() {
  const { q } = Route.useSearch();
  return <ExplorePage key={q} initialQ={q ?? ""} />;
}
