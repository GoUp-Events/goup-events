import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapPin, ArrowRight, X } from "lucide-react";
import { api } from "@/lib/api";
import { GOOGLE_MAPS_API_KEY } from "@/config";
import { loadGoogle } from "@/lib/google";
import { citiesFrom, dateLabel, money } from "@/lib/format";
import type { Event } from "@/lib/models";
import { Kicker, Loading, Empty, ErrorState, useCategories } from "./common";
import { Button } from "@/components/ui/button";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
export function MapPage() {
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState<Event | null>(null);
  const [mapError, setMapError] = useState<Error | null>(null);
  const [retry, setRetry] = useState(0);
  const categories = useCategories();
  const events = useQuery({ queryKey: ["all-events"], queryFn: () => api.events(), retry: false });
  const ref = useRef<HTMLDivElement>(null);
  const filtered = (events.data ?? []).filter(
    (e) =>
      (!city || e.location.city === city) && (!categoryId || String(e.category?.id) === categoryId),
  );
  const key = filtered.map((e) => e.id).join(",");
  useEffect(() => {
    if (!ref.current) return;
    let active = true;
    let cleanup = () => {};
    const element = ref.current;
    setMapError(null);
    async function init() {
      try {
        if (GOOGLE_MAPS_API_KEY) {
          const maps = await loadGoogle();
          if (!active) return;
          const map = new maps.Map(element, { center: { lat: -26.9194, lng: -49.0661 }, zoom: 12 });
          const bounds = new maps.LatLngBounds();
          const markers = filtered
            .filter((e) => e.location.latitude != null && e.location.longitude != null)
            .map((e) => {
              const position = {
                lat: Number(e.location.latitude),
                lng: Number(e.location.longitude),
              };
              bounds.extend(position);
              const marker = new maps.Marker({ map, position, title: e.title });
              marker.addListener("click", () => setSelected(e));
              return marker;
            });
          if (markers.length) map.fitBounds(bounds);
          cleanup = () => markers.forEach((m) => m.setMap(null));
        } else {
          const ml = await import("maplibre-gl");
          if (!active) return;
          ml.setWorkerUrl(workerUrl);
          const map = new ml.Map({
            container: element,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: [-49.0661, -26.9194],
            zoom: 12,
          });
          map.addControl(new ml.NavigationControl(), "top-right");
          map.on("error", () => {
            if (active)
              setMapError(
                new Error("Não foi possível carregar o mapa. Tente novamente em instantes."),
              );
          });
          const bounds = new ml.LngLatBounds();
          const color = getComputedStyle(document.documentElement)
            .getPropertyValue("--primary")
            .trim();
          let count = 0;
          filtered.forEach((e) => {
            const lng = Number(e.location.longitude),
              lat = Number(e.location.latitude);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
            const marker = new ml.Marker({ color }).setLngLat([lng, lat]).addTo(map);
            marker.getElement().setAttribute("aria-label", e.title);
            marker.getElement().setAttribute("role", "button");
            marker.getElement().tabIndex = 0;
            marker.getElement().onclick = () => setSelected(e);
            marker.getElement().onkeydown = (ev) => {
              if (ev.key === "Enter") setSelected(e);
            };
            bounds.extend([lng, lat]);
            count++;
          });
          if (count) map.fitBounds(bounds, { padding: 70, maxZoom: 14 });
          cleanup = () => map.remove();
        }
      } catch (error) {
        if (active)
          setMapError(
            error instanceof Error ? error : new Error("Não foi possível carregar o mapa."),
          );
      }
    }
    void init();
    return () => {
      active = false;
      cleanup();
    };
  }, [key, retry]);
  return (
    <div className="page wrap">
      <Kicker>DESCUBRA AO SEU REDOR</Kicker>
      <h1>
        O próximo momento está no <span className="text-primary">mapa.</span>
      </h1>
      <div className="filter-panel mt-7">
        <label className="field">
          Cidade
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">Todas as cidades</option>
            {citiesFrom(events.data ?? []).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Categoria
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">Todas as vibes</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setCity("");
              setCategoryId("");
              setSelected(null);
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </div>
      {categories.isError && (
        <ErrorState error={categories.error} retry={() => void categories.refetch()} />
      )}
      <div className="map-layout">
        <aside aria-label="Eventos no mapa" className="map-list">
          {events.isPending ? (
            <Loading count={1} />
          ) : events.isError ? (
            <ErrorState error={events.error} retry={() => void events.refetch()} />
          ) : !filtered.length ? (
            <Empty
              title="Nenhum evento no mapa ainda"
              description="As próximas experiências aparecerão aqui."
            />
          ) : (
            filtered.map((e) => (
              <Button
                variant="ghost"
                className="map-list-item"
                key={e.id}
                onClick={() => setSelected(e)}
              >
                <strong>{e.title}</strong>
                <span>
                  <MapPin className="inline size-3 mr-1" />
                  {e.location.city} · {dateLabel(e.eventDate)}
                </span>
                <span>{money(e.price)}</span>
              </Button>
            ))
          )}
        </aside>
        <div className="map-container">
          <div ref={ref} className="map-surface" aria-label="Mapa interativo de Blumenau" />
          {mapError && (
            <div className="absolute inset-0 z-10 bg-background flex items-center p-5">
              <ErrorState error={mapError} retry={() => setRetry((v) => v + 1)} />
            </div>
          )}
          {selected && (
            <article className="map-event">
              <div className="flex justify-between gap-4">
                <h3>{selected.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar evento selecionado"
                  onClick={() => setSelected(null)}
                >
                  <X />
                </Button>
              </div>
              <p>
                {selected.location.name} · {selected.location.city}
              </p>
              <p>
                {dateLabel(selected.eventDate)} · {money(selected.price)}
              </p>
              <Button asChild size="sm">
                <Link to="/eventos/$id" params={{ id: String(selected.id) }}>
                  Ver detalhes <ArrowRight />
                </Link>
              </Button>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
