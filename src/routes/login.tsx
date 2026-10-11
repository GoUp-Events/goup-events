import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/lib/format";
import { AuthPage } from "@/components/goup/account";
export const Route = createFileRoute("/login")({
  head: () => metadata("Entrar", "Entre no GoUp e encontre seus próximos momentos."),
  component: () => <AuthPage />,
});
