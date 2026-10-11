import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { metadata } from "@/lib/format";
import { ExplorePage } from "@/components/goup/explore";
export const Route = createFileRoute("/eventos/")({
  validateSearch: z.object({
    q: z.coerce.string().optional(),
    city: z.coerce.string().optional(),
    categoryId: z.coerce.string().optional(),
    categoryIds: z.coerce.string().optional(),
    dateFrom: z.coerce.string().optional(),
    dateTo: z.coerce.string().optional(),
    maxPrice: z.coerce.string().optional(),
    freeOnly: z.coerce.string().optional(),
    ageRating: z.coerce.string().optional(),
    sort: z.coerce.string().optional(),
  }),
  head: () =>
    metadata(
      "Explore eventos",
      "Encontre eventos por cidade, categoria, data e preço em Blumenau e região.",
    ),
  component: EventsPage,
});
function EventsPage() {
  return <ExplorePage />;
}
