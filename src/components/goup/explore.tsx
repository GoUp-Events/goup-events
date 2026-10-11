import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { api, type Filters } from "@/lib/api";
import { citiesFrom } from "@/lib/format";
import { useAuth } from "./auth";
import { useCategories, Loading, Empty, ErrorState, EventGrid, Kicker } from "./common";
import { Button } from "@/components/ui/button";
export function ExplorePage({ initialQ = "" }: { initialQ?: string }) {
  const [filters, setFilters] = useState<Filters>({ q: initialQ, sort: "date" });
  const auth = useAuth();
  const categories = useCategories();
  const all = useQuery({ queryKey: ["all-events"], queryFn: () => api.events(), retry: false });
  const events = useQuery({
    queryKey: ["events", filters, auth.token],
    queryFn: () => api.events(filters, auth.token),
    retry: false,
  });
  const change = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const cities = citiesFrom(all.data ?? []);
  return (
    <div className="page wrap">
      <div className="page-intro">
        <Kicker>SEU PRÓXIMO MOMENTO</Kicker>
        <h1>
          Explore <span className="text-primary">eventos.</span>
        </h1>
        <p className="section-desc">Encontre o que combina com você, perto de você.</p>
      </div>
      <div className="filter-panel">
        <label className="field">
          O que você procura?
          <input
            placeholder="Evento, lugar ou cidade..."
            value={filters.q ?? ""}
            onChange={(e) => change("q", e.target.value)}
          />
        </label>
        <label className="field">
          Categoria
          <select
            value={filters.categoryId ?? ""}
            onChange={(e) => change("categoryId", e.target.value)}
          >
            <option value="">Todas as vibes</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Cidade
          <select value={filters.city ?? ""} onChange={(e) => change("city", e.target.value)}>
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          A partir de
          <input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => change("dateFrom", e.target.value)}
          />
        </label>
        <label className="field">
          Até a data
          <input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => change("dateTo", e.target.value)}
          />
        </label>
        <label className="field">
          Preço máximo (R$)
          <input
            type="number"
            min="0"
            placeholder="Qualquer preço"
            value={filters.maxPrice ?? ""}
            onChange={(e) => change("maxPrice", e.target.value)}
          />
        </label>
        <label className="field">
          Ordenar por
          <select value={filters.sort ?? "date"} onChange={(e) => change("sort", e.target.value)}>
            <option value="date">Data do evento</option>
            <option value="popular">Mais populares · Premium</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button variant="outline" onClick={() => setFilters({ q: "", sort: "date" })}>
            <RotateCcw />
            Limpar filtros
          </Button>
        </div>
      </div>
      {categories.isError && (
        <div className="mb-6">
          <ErrorState error={categories.error} retry={() => void categories.refetch()} />
        </div>
      )}
      <p className="count mb-6">
        {events.isPending
          ? "Encontrando seus próximos momentos…"
          : `${events.data?.length ?? 0} eventos`}
      </p>
      {events.isPending ? (
        <Loading count={6} />
      ) : events.isError ? (
        <ErrorState error={events.error} retry={() => void events.refetch()} />
      ) : events.data.length ? (
        <EventGrid events={events.data} />
      ) : (
        <Empty
          title="Nenhum evento encontrado"
          description="Que tal tentar outra categoria, cidade ou data? Novas possibilidades estão a caminho."
        />
      )}
    </div>
  );
}
