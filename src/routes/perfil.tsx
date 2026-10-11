import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/lib/format";
import { ProfilePage } from "@/components/goup/account";
export const Route = createFileRoute("/perfil")({
  head: () => metadata("Meu perfil", "Sua conta, seu plano e suas descobertas no GoUp."),
  component: () => <ProfilePage />,
});
