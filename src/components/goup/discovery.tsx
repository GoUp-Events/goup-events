import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Send, Quote } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { citiesFrom } from "@/lib/format";
import type { Event } from "@/lib/models";
import { useAuth } from "./auth";
import { Kicker, LoginGate, Loading, ErrorState, Empty, EventCard, EventGrid, PremiumGate } from "./common";
import { Button } from "@/components/ui/button";
const suggestions = [
  "Tenho R$30 e quero fazer alguma coisa com meus amigos hoje à noite.",
  "Quero algo com música e cerveja no fim de semana",
  "Algo barato e ao ar livre",
  "Programa em família",
];
interface Message {
  message: string;
  summary: string;
  events: Event[];
}
export function DiscoveryPage() {
  return (
    <div className="page wrap">
      <div className="discovery-shell">
        <Kicker>GOUP PREMIUM</Kicker>
        <h1>
          Descoberta <span className="text-primary">Mágica.</span>
        </h1>
        <p className="section-desc mb-8">Uma vontade, muitas possibilidades. Qual é a sua hoje?</p>
        <LoginGate>
          <Discovery />
        </LoginGate>
      </div>
    </div>
  );
}
function Discovery() {
  const auth = useAuth();
  const [input, setInput] = useState("");
  const [city, setCity] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const recommendations = useQuery({
    queryKey: ["recommendations", auth.token],
    queryFn: () => api.recommendations(auth.token),
    retry: false,
  });
  const events = useQuery({ queryKey: ["all-events"], queryFn: () => api.events(), retry: false });
  const mutation = useMutation({
    mutationFn: (message: string) =>
      api.discovery({ message, ...(city ? { city } : {}) }, auth.token),
    onSuccess: (data, message) => {
      setMessages((history) => [...history, { message, ...data }]);
      setInput("");
    },
  });
  const blocked =
    (recommendations.error instanceof ApiError && recommendations.error.status === 403) ||
    (mutation.error instanceof ApiError && mutation.error.status === 403);
  if (blocked) return <PremiumGate />;
  if (recommendations.isPending) return <Loading />;
  return (
    <>
      <div className="discovery-suggestions">
        {!messages.length &&
          suggestions.map((s, i) => (
            <Button
              key={s}
              variant={i === 0 ? "dark" : "outline"}
              className={i === 0 ? "quote" : "whitespace-normal text-left justify-start h-auto"}
              disabled={mutation.isPending}
              onClick={() => {
                setInput(s);
                mutation.mutate(s);
              }}
            >
              {i === 0 ? <Quote size={22} /> : <Sparkles size={16} />} {s}
            </Button>
          ))}
      </div>
      {messages.map((m, i) => (
        <div key={i}>
          <div className="chat-user">{m.message}</div>
          <div className="chat-assistant">
            <div className="flex gap-3 mb-4">
              <Sparkles className="text-primary shrink-0" />
              <p>{m.summary}</p>
            </div>
            {m.events.length ? (
              <EventGrid events={m.events} />
            ) : (
              <Empty title="Ainda não encontrei eventos para esse momento" />
            )}
          </div>
        </div>
      ))}
      {mutation.isPending && (
        <div className="chat-assistant" role="status">
          <Sparkles className="inline text-primary mr-2 animate-pulse" />
          GoUp está pensando…
        </div>
      )}
      {mutation.isError && <ErrorState error={mutation.error} />}
      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) mutation.mutate(input);
        }}
      >
        <textarea
          aria-label="Conte o que você quer fazer"
          maxLength={500}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Conte o que você está com vontade de fazer..."
          required
        />
        <div className="chat-compose-bottom">
          <select
            aria-label="Cidade da descoberta"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {citiesFrom(events.data ?? []).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <small>{input.length}/500</small>
          <Button type="submit" disabled={mutation.isPending || !input.trim()}>
            <Send />
            Descobrir
          </Button>
        </div>
      </form>
      <section className="section">
        <Kicker>DO SEU JEITO</Kicker>
        <h2 className="section-title">
          Recomendados para <span>você.</span>
        </h2>
        {recommendations.isError ? (
          <ErrorState error={recommendations.error} retry={() => void recommendations.refetch()} />
        ) : !recommendations.data?.length ? (
          <Empty title="Suas recomendações estão a caminho" />
        ) : (
          <div className="recommendation-grid">
            {recommendations.data.map((r) => (
              <div key={r.event.id} className="recommendation-item">
                <p className="section-desc recommendation-reason">
                  <Sparkles className="inline size-4 text-primary mr-2" />
                  {r.reason}
                </p>
                <EventCard event={r.event} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
