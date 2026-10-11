import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, ArrowUpRight, ArrowRight, Sparkles, Quote, Compass } from "lucide-react";
import { api } from "@/lib/api";
import { metadata } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Kicker,
  Loading,
  ErrorState,
  Empty,
  EventGrid,
  categoryIcon,
  useCategories,
} from "@/components/goup/common";
import festival from "@/assets/goup-festival.jpg";
export const Route = createFileRoute("/")({
  head: () =>
    metadata(
      "Descubra o que fazer hoje",
      "Descubra eventos, lazer e experiências em Blumenau e região. Encontre sua vibe com o GoUp.",
    ),
  component: Home,
});
function Home() {
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const navigate = useNavigate();
  const categories = useCategories();
  const events = useQuery({
    queryKey: ["events", { categoryId }],
    queryFn: () => api.events({ categoryId }),
    retry: false,
  });
  return (
    <>
      <section className="hero">
        <div aria-hidden className="hero-dots">
          ✳
        </div>
        <div className="wrap hero-grid">
          <div>
            <span className="kicker hero-kicker">Seu próximo momento começa aqui</span>
            <h1>
              Descubra o que
              <br />
              fazer <span>hoje.</span>
            </h1>
            <p className="hero-description">
              O melhor de Blumenau e região está mais perto do que você imagina. Encontre eventos,
              novos lugares e momentos que valem a pena.
            </p>
            <form
              className="search-pill"
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({ to: "/eventos", search: { q } });
              }}
            >
              <Search size={20} />
              <input
                aria-label="Buscar evento, lugar ou cidade"
                placeholder="Evento, lugar ou cidade..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="submit" className="search-button">
                Buscar <ArrowUpRight size={16} />
              </Button>
            </form>
            <div className="trending">
              <span>Em alta:</span>
              <Link to="/eventos" search={{ q: "Música ao vivo" }}>
                Música ao vivo
              </Link>
              <Link to="/eventos" search={{ q: "Gastronomia" }}>
                Gastronomia
              </Link>
              <Link to="/eventos" search={{ q: "Cerveja" }}>
                Cerveja
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-photo">
              <img
                src={festival}
                alt="Amigos aproveitando música ao ar livre — imagem ilustrativa"
                width="1200"
                height="960"
              />
            </div>
            <div aria-hidden className="hero-stamp">
              <Sparkles size={22} />
              <span>
                Viva mais
                <br />
                perto de você
              </span>
            </div>
            <div className="place-tag">
              <div className="pin">
                <MapPin size={21} />
              </div>
              <div>
                <strong>Descubra Blumenau</strong>
                <small>Onde a vida acontece</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="wrap home-quote">
        <Link to="/descoberta" className="quote">
          <Quote size={27} />
          <span>“Tenho R$30 e quero fazer alguma coisa com meus amigos hoje à noite.”</span>
          <ArrowUpRight className="ml-auto shrink-0" size={22} />
        </Link>
      </div>
      <section className="section wrap">
        <Kicker>UM MUNDO DE POSSIBILIDADES</Kicker>
        <h2 className="section-title">
          Encontre sua <span>vibe.</span>
        </h2>
        <p className="section-desc">
          De um show inesquecível a um café sem pressa. Qual é a sua hoje?
        </p>
        {categories.isPending ? (
          <Loading />
        ) : categories.isError ? (
          <ErrorState error={categories.error} retry={() => void categories.refetch()} />
        ) : categories.data.length === 0 ? (
          <Empty title="As categorias estão chegando" />
        ) : (
          <div className="category-grid">
            {categories.data.map((c) => {
              const Icon = categoryIcon(c.name);
              return (
                <Button
                  key={c.id}
                  variant="ghost"
                  className={`category-card ${categoryId === String(c.id) ? "selected" : ""}`}
                  title={c.description}
                  onClick={() => setCategoryId(categoryId === String(c.id) ? "" : String(c.id))}
                >
                  <Icon />
                  <strong>{c.name}</strong>
                </Button>
              );
            })}
          </div>
        )}
      </section>
      <section className="section wrap pt-0">
        <div className="section-top">
          <div>
            <Kicker>SAIA DO ÓBVIO</Kicker>
            <h2 className="section-title">
              Eventos que fazem <span>acontecer.</span>
            </h2>
            <p className="section-desc">Seu próximo “ainda bem que eu fui” está aqui.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/eventos">
              Explorar todos <ArrowRight />
            </Link>
          </Button>
        </div>
        {!events.isPending && !events.isError && (
          <div className="flex justify-between mb-5 items-center">
            <span className="count">{events.data.length} eventos encontrados</span>
            {categoryId && (
              <Button variant="link" onClick={() => setCategoryId("")}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}
        {events.isPending ? (
          <Loading />
        ) : events.isError ? (
          <ErrorState error={events.error} retry={() => void events.refetch()} />
        ) : events.data.length ? (
          <EventGrid events={events.data.slice(0, 6)} />
        ) : (
          <Empty
            title="O próximo evento está por vir"
            description="Ainda não há eventos para mostrar por aqui. Enquanto isso, que tal descobrir uma nova vibe?"
          />
        )}
      </section>
      <section className="section wrap">
        <Kicker>SIMPLES ASSIM</Kicker>
        <h2 className="section-title">
          Menos planos. Mais <span>momentos.</span>
        </h2>
        <div className="steps">
          <article className="step">
            <span className="step-number">
              01 <Compass className="inline size-6 ml-3" />
            </span>
            <h3>DESCUBRA</h3>
            <p>Explore o que está acontecendo perto de você e encontre sua vibe.</p>
          </article>
          <article className="step">
            <span className="step-number">02 ♡</span>
            <h3>ESCOLHA</h3>
            <p>Guarde seus favoritos e escolha os momentos que combinam com você.</p>
          </article>
          <article className="step">
            <span className="step-number">03 ✳</span>
            <h3>VIVA</h3>
            <p>Chame a companhia, saia de casa e deixe a vida surpreender.</p>
          </article>
        </div>
      </section>
      <section className="wrap premium-band">
        <Sparkles />
        <div>
          <Kicker>DESCUBERTA MÁGICA</Kicker>
          <h2 className="mt-4">
            Mais descobertas.
            <br />
            Mais experiências.
          </h2>
          <p>Conte sua vontade. O GoUp encontra o seu próximo momento.</p>
        </div>
        <Button asChild variant="secondary" className="premium-action">
          <Link to="/planos">
            Conhecer o Premium <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
