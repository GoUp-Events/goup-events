import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/lib/format";
import { MapPage } from "@/components/goup/map";
export const Route = createFileRoute("/mapa")({
  head: () =>
    metadata("Mapa de eventos", "Explore no mapa os eventos e experiências de Blumenau e região."),
  component: MapPage,
});
