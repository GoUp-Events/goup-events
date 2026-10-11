import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Music,
  Beer,
  Utensils,
  TreePine,
  PartyPopper,
  Drama,
  Palette,
  Footprints,
  Baby,
  Store,
  GraduationCap,
  CalendarDays,
  Heart,
  MapPin,
  ArrowRight,
  RefreshCw,
  SearchX,
  AlertCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Event } from "@/lib/models";
import { api, ApiError } from "@/lib/api";
import { money, dateLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth";
import type { ReactNode } from "react";
export function categoryIcon(name?: string): LucideIcon {
  const text = (name ?? "").toLowerCase();
  if (text.includes("música")) return Music;
  if (text.includes("cerveja")) return Beer;
  if (text.includes("gastronomia")) return Utensils;
  if (text.includes("natureza")) return TreePine;
  if (text.includes("típicas")) return PartyPopper;
  if (text.includes("festas")) return PartyPopper;
  if (text.includes("teatro")) return Drama;
  if (text.includes("arte")) return Palette;
  if (text.includes("esportes")) return Footprints;
  if (text.includes("família")) return Baby;
  if (text.includes("feiras")) return Store;
  if (text.includes("cursos")) return GraduationCap;
  return CalendarDays;
}
export function EventCover({ event, large = false }: { event: Event; large?: boolean }) {
  const Icon = categoryIcon(event.category?.name);
  return (
    <div className={`event-cover ${(event.category?.id ?? 0) % 2 ? "alternate" : ""} ${large ? "large" : ""}`}>
      <Icon strokeWidth={1.2} />
      <span className="category-label">{event.category?.name ?? "Evento"}</span>
    </div>
  );
}
export function EventCard({ event }: { event: Event }) {
  const auth = useAuth();
  return (
    <article className="event-card">
      <div className="relative">
        <EventCover event={event} />
        <Button
          size="icon"
          variant="ghost"
          className="favorite-button"
          title={auth.favoriteIds.has(event.id) ? "Remover dos favoritos" : "Favoritar evento"}
          aria-label={`${auth.favoriteIds.has(event.id) ? "Remover dos favoritos" : "Favoritar"} ${event.title}`}
          disabled={auth.favoritePending}
          onClick={() => auth.toggleFavorite(event.id)}
        >
          <Heart className={auth.favoriteIds.has(event.id) ? "fill-primary" : ""} />
        </Button>
      </div>
      <div className="event-content">
        <div className="event-meta">
          <CalendarDays size={14} />
          {dateLabel(event.eventDate)} · {event.startTime.slice(0, 5)}
        </div>
        <h3>
          <Link to="/eventos/$id" params={{ id: String(event.id) }}>
            {event.title}
          </Link>
        </h3>
        <div className="event-meta">
          <MapPin size={14} />
          {event.location.city}, {event.location.state ?? "SC"}
        </div>
        <div className="event-bottom">
          <strong>{money(event.price)}</strong>
          <Link to="/eventos/$id" params={{ id: String(event.id) }}>
            Ver detalhes <ArrowRight size={13} className="inline ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function EventGrid({ events }: { events: Event[] }) {
  return (
    <div className="event-grid">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
export function Loading({ count = 3 }: { count?: number }) {
  return (
    <div className="event-grid" role="status" aria-label="Carregando descobertas">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}
export function Empty({
  title = "Nenhum evento por aqui ainda",
  description = "Novos momentos estão a caminho. Volte em breve ou explore outras possibilidades.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="status-box">
      <SearchX />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="status-box" role="alert">
      <AlertCircle />
      <h3>Não conseguimos carregar agora</h3>
      <p>
        {error instanceof Error
          ? error.message
          : "Não foi possível concluir agora. Tente novamente em instantes."}
      </p>
      {error instanceof ApiError && error.status === 403 && (
        <Button asChild>
          <Link to="/planos">Conhecer o Premium</Link>
        </Button>
      )}
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
export function Kicker({ children }: { children: ReactNode }) {
  return <span className="kicker">{children}</span>;
}
export function LoginGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!auth.ready) return <Loading />;
  if (!auth.token)
    return (
      <div className="status-box">
        <Heart />
        <h3>Seus próximos momentos começam aqui</h3>
        <p>Entre na sua conta para continuar.</p>
        <Button asChild>
          <Link to="/login">
            Entrar no GoUp <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  return <>{children}</>;
}
export function PremiumGate() {
  return (
    <div className="status-box bg-premium border-secondary">
      <Lock />
      <Kicker>GOUP PREMIUM</Kicker>
      <h3>Mais descobertas. Mais experiências.</h3>
      <p>Encontre eventos que combinam com você com a Descoberta Mágica.</p>
      <Button asChild>
        <Link to="/planos">
          <Sparkles />
          Conhecer o Premium
        </Link>
      </Button>
    </div>
  );
}
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: api.categories,
    retry: false,
    staleTime: 300000,
  });
}
