import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/lib/format";
import { MyEventsPage } from "@/components/goup/account";
export const Route = createFileRoute("/meus-eventos")({
  head: () => metadata("Meus eventos", "Gerencie os eventos que você divulga no GoUp."),
  component: () => <MyEventsPage />,
});
