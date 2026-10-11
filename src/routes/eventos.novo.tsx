import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/lib/format";
import { EventFormPage } from "@/components/goup/event-form";
export const Route = createFileRoute("/eventos/novo")({
  head: () =>
    metadata(
      "Crie seu evento",
      "Divulgue seu evento em Blumenau e região. Faça acontecer com o GoUp.",
    ),
  component: () => <EventFormPage />,
});
