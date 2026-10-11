import { useEffect, useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Save, MapPin, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ageLabels } from "@/lib/format";
import type { PlaceSuggestion } from "@/lib/models";
import { useAuth } from "./auth";
import { Kicker, LoginGate, Loading, ErrorState, useCategories } from "./common";
import { Button } from "@/components/ui/button";
interface Values {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  price: string;
  ageRating: string;
  categoryId: string;
  status: string;
  placeId: string;
}
const empty: Values = {
  title: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  price: "0",
  ageRating: "FREE",
  categoryId: "",
  status: "DRAFT",
  placeId: "",
};
export function EventFormPage({ id }: { id?: string | undefined }) {
  return (
    <div className="page wrap">
      <Kicker>FAÇA ACONTECER</Kicker>
      <h1>
        {id ? "Edite seu" : "Crie seu"} <span className="text-primary">evento.</span>
      </h1>
      <p className="section-desc mb-8">
        Compartilhe uma experiência. Conecte pessoas a novos momentos.
      </p>
      <LoginGate>
        <EventForm id={id} />
      </LoginGate>
    </div>
  );
}
function EventForm({ id }: { id?: string | undefined }) {
  const auth = useAuth();
  const draftKey = `goup-event-draft-${id ?? "new"}`;
  const [values, setValues] = useState<Values>(() => {
    if (typeof window === "undefined") return empty;
    try {
      return JSON.parse(sessionStorage.getItem(draftKey) ?? "null") ?? empty;
    } catch {
      return empty;
    }
  });
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem(`${draftKey}-place`) ?? "null");
    } catch {
      return null;
    }
  });
  const [placeQuery, setPlaceQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placeValidation, setPlaceValidation] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const listId = useId();
  const navigate = useNavigate();
  const client = useQueryClient();
  const categories = useCategories();
  const event = useQuery({
    queryKey: ["event", id, auth.token],
    queryFn: () => api.event(id ?? "", auth.token),
    enabled: !!id,
    retry: false,
  });
  useEffect(() => {
    if (event.data && !sessionStorage.getItem(draftKey)) {
      const e = event.data;
      setValues({
        title: e.title,
        description: e.description ?? "",
        eventDate: e.eventDate,
        startTime: e.startTime.slice(0, 5),
        endTime: e.endTime?.slice(0, 5) ?? "",
        price: String(e.price),
        ageRating: e.ageRating,
        categoryId: e.category ? String(e.category.id) : "",
        status: e.status,
        placeId: e.location.placeId,
      });
      setSelectedPlace({
        placeId: e.location.placeId,
        name: e.location.name,
        address: e.location.formattedAddress ?? e.location.address ?? "",
      });
    }
  }, [event.data, draftKey]);
  useEffect(() => {
    if (id && !event.data) return;
    sessionStorage.setItem(draftKey, JSON.stringify(values));
    if (selectedPlace) sessionStorage.setItem(`${draftKey}-place`, JSON.stringify(selectedPlace));
    else sessionStorage.removeItem(`${draftKey}-place`);
  }, [draftKey, values, selectedPlace, id, event.data]);
  useEffect(() => {
    abortRef.current?.abort();
    setSuggestions([]);
    setActiveIndex(-1);
    setPlaceError("");
    if (selectedPlace || placeQuery.trim().length < 3 || !auth.token) {
      setPlaceLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = window.setTimeout(() => {
      setPlaceLoading(true);
      void api
        .placeSuggestions(placeQuery.trim(), auth.token, controller.signal)
        .then((items) => {
          if (!controller.signal.aborted) setSuggestions(items);
        })
        .catch((error) => {
          if (!controller.signal.aborted && !(error instanceof ApiError && error.status === 401))
            setPlaceError("Não foi possível buscar locais agora. Tente novamente.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setPlaceLoading(false);
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [placeQuery, selectedPlace, auth.token]);
  const choosePlace = (place: PlaceSuggestion) => {
    abortRef.current?.abort();
    setSelectedPlace(place);
    setValues((v) => ({ ...v, placeId: place.placeId }));
    setSuggestions([]);
    setPlaceValidation("");
  };
  const mutation = useMutation({
    mutationFn: () =>
      api.save(
        {
          title: values.title,
          description: values.description,
          eventDate: values.eventDate,
          startTime: values.startTime,
          price: Number(values.price),
          status: values.status,
          ageRating: values.ageRating,
          placeId: values.placeId,
          ...(values.categoryId ? { categoryId: Number(values.categoryId) } : {}),
          ...(values.endTime ? { endTime: values.endTime } : {}),
        },
        auth.token,
        id,
      ),
    onSuccess: (e) => {
      sessionStorage.removeItem(draftKey);
      sessionStorage.removeItem(`${draftKey}-place`);
      void client.invalidateQueries({ queryKey: ["mine"] });
      void client.invalidateQueries({ queryKey: ["events"] });
      void client.invalidateQueries({ queryKey: ["event"] });
      void client.invalidateQueries({ queryKey: ["all-events"] });
      void navigate({ to: "/eventos/$id", params: { id: String(e.id) } });
    },
  });
  const errors = mutation.error instanceof ApiError ? mutation.error.errors : [];
  const change = (key: keyof Values, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const errorField = (key: string) => (
    <>
      {errors
        .filter((e) => e.field === key)
        .map((e, i) => (
          <span key={i} className="field-error">
            {e.message}
          </span>
        ))}
    </>
  );
  if (id && event.isPending) return <Loading />;
  if (event.isError) return <ErrorState error={event.error} retry={() => void event.refetch()} />;
  return (
    <form
      className="form-card form-grid max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.placeId || !selectedPlace) {
          setPlaceValidation("Escolha um local na lista de sugestões para continuar.");
          return;
        }
        mutation.mutate();
      }}
    >
      <label className="field span-all">
        Título do evento
        <input
          required
          value={values.title}
          onChange={(e) => change("title", e.target.value)}
          placeholder="Qual momento você vai fazer acontecer?"
        />
        {errorField("title")}
      </label>
      <label className="field span-all">
        Descrição
        <textarea
          value={values.description}
          onChange={(e) => change("description", e.target.value)}
          placeholder="Conte um pouco sobre a experiência..."
        />
        {errorField("description")}
      </label>
      {(
        [
          ["eventDate", "Data", "date"],
          ["startTime", "Horário de início", "time"],
          ["endTime", "Horário de fim (opcional)", "time"],
          ["price", "Preço (R$)", "number"],
        ] as const
      ).map(([key, label, type]) => (
        <label className="field" key={key}>
          {label}
          <input
            type={type}
            required={key !== "endTime"}
            min={key === "price" ? 0 : undefined}
            step={key === "price" ? "0.01" : undefined}
            value={values[key]}
            onChange={(e) => change(key, e.target.value)}
          />
          {errorField(key)}
        </label>
      ))}
      <label className="field">
        Classificação etária
        <select value={values.ageRating} onChange={(e) => change("ageRating", e.target.value)}>
          {Object.entries(ageLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errorField("ageRating")}
      </label>
      <label className="field">
        Categoria (opcional)
        <select value={values.categoryId} onChange={(e) => change("categoryId", e.target.value)}>
          <option value="">Selecione uma vibe</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errorField("categoryId")}
      </label>
      {categories.isError && (
        <div className="span-all">
          <ErrorState error={categories.error} retry={() => void categories.refetch()} />
        </div>
      )}
      <div className="field span-all">
        <label htmlFor="event-place">
          <MapPin className="inline size-4 mr-1" />
          Local do evento
        </label>
        {selectedPlace ? (
          <div className="selected-place">
            <div>
              <strong>{selectedPlace.name}</strong>
              <small>{selectedPlace.address}</small>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedPlace(null);
                setPlaceQuery("");
                change("placeId", "");
              }}
            >
              Trocar local
            </Button>
          </div>
        ) : (
          <div className="place-search">
            <input
              id="event-place"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              aria-invalid={!!placeValidation}
              placeholder="Digite o nome do estabelecimento"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSuggestions([]);
                  setActiveIndex(-1);
                }
                if (e.key === "ArrowDown" && suggestions.length) {
                  e.preventDefault();
                  setActiveIndex((i) => (i + 1) % suggestions.length);
                }
                if (e.key === "ArrowUp" && suggestions.length) {
                  e.preventDefault();
                  setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
                }
                if (e.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
                  e.preventDefault();
                  choosePlace(suggestions[activeIndex]);
                }
              }}
            />
            {suggestions.length > 0 && (
              <div id={listId} role="listbox" className="place-suggestions">
                {suggestions.map((place, index) => (
                  <button
                    id={`${listId}-${index}`}
                    key={place.placeId}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choosePlace(place)}
                  >
                    <strong>{place.name}</strong>
                    <small>{place.address}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!selectedPlace && placeLoading && <span className="form-help">Buscando locais…</span>}
        {!selectedPlace &&
          !placeLoading &&
          placeQuery.trim().length >= 3 &&
          !suggestions.length &&
          !placeError && <span className="form-help">Nenhum local encontrado.</span>}
        {placeError && <span className="field-error">{placeError}</span>}
        {placeValidation && <span className="field-error">{placeValidation}</span>}
        {errorField("placeId")}
        {errorField("location")}
      </div>
      <label className="field">
        Status
        <select value={values.status} onChange={(e) => change("status", e.target.value)}>
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
          {id && (
            <>
              <option value="CANCELLED">Cancelado</option>
              <option value="FINISHED">Finalizado</option>
            </>
          )}
        </select>
        {errorField("status")}
      </label>
      <div className="flex items-end justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          <Save />
          {mutation.isPending ? "Salvando…" : id ? "Salvar alterações" : "Criar evento"}
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
